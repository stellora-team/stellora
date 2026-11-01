using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Users;
using Stellora.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using AppUser = Stellora.Api.Models.User;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public sealed class UsersController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public UsersController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMe(
        CancellationToken cancellationToken)
    {
        Response.Headers["Cache-Control"] = "no-store";

        var userIdClaim = User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var profile = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new UserProfileResponse(
                user.Id,
                user.Email,
                user.DisplayName,
                user.CreatedAtUtc,
                user.TimeZone))
            .SingleOrDefaultAsync(cancellationToken);

        if (profile is null)
        {
            return Unauthorized();
        }

        return Ok(profile);
    } 
    
    [HttpPut("me")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<UserProfileResponse>> UpdateMe(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        Response.Headers["Cache-Control"] = "no-store";

        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users.SingleOrDefaultAsync(
            candidate => candidate.Id == userId,
            cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        var normalizedEmail = request.Email.ToUpperInvariant();

        if (normalizedEmail != user.NormalizedEmail)
        {
            var emailExists = await _dbContext.Users.AnyAsync(
                candidate =>
                    candidate.Id != userId &&
                    candidate.NormalizedEmail == normalizedEmail,
                cancellationToken);

            if (emailExists)
            {
                return EmailUnavailable();
            }
        }

        user.DisplayName = request.DisplayName;
        user.Email = request.Email;
        user.NormalizedEmail = normalizedEmail;
        user.TimeZone = request.TimeZone;

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
                  {
                      SqlState: PostgresErrorCodes.UniqueViolation,
                      ConstraintName: "ux_users_normalized_email"
                  })
        {
            return EmailUnavailable();
        }

        return Ok(new UserProfileResponse(
            user.Id,
            user.Email,
            user.DisplayName,
            user.CreatedAtUtc,
            user.TimeZone));
    }

    [HttpPut("me/password")]
[EnableRateLimiting("login")]
public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordRequest request,
    [FromServices] IPasswordHasher<AppUser> passwordHasher,
    CancellationToken cancellationToken)
{
    Response.Headers["Cache-Control"] = "no-store";

    if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId) ||
        !Guid.TryParse(User.FindFirst("sid")?.Value, out var sessionId))
    {
        return Unauthorized();
    }

    await using var transaction =
        await _dbContext.Database.BeginTransactionAsync(cancellationToken);

    // блок строки пользователя до завершения транзакции
    var users = await _dbContext.Users
        .FromSqlInterpolated(
            $"""SELECT * FROM users WHERE "Id" = {userId} FOR UPDATE""")
        .ToListAsync(cancellationToken);

    var user = users.SingleOrDefault();

    if (user is null)
    {
        return Unauthorized();
    }

    // пока запрос ожидал блокировку сессию могли отозвать
    var now = DateTime.UtcNow;

    var sessionIsActive = await _dbContext.UserSessions.AnyAsync(
        session =>
            session.Id == sessionId &&
            session.UserId == userId &&
            session.RevokedAtUtc == null &&
            session.ExpiresAtUtc > now,
        cancellationToken);

    if (!sessionIsActive)
    {
        return Unauthorized();
    }

    var verificationResult = passwordHasher.VerifyHashedPassword(
        user,
        user.PasswordHash,
        request.CurrentPassword);

    if (verificationResult == PasswordVerificationResult.Failed)
    {
        return Problem(
            statusCode: StatusCodes.Status403Forbidden,
            title: "Password change denied",
            detail: "Current password is incorrect.");
    }

    if (request.CurrentPassword == request.NewPassword)
    {
        ModelState.AddModelError(
            nameof(request.NewPassword),
            "New password must differ from the current password.");

        return ValidationProblem(ModelState);
    }

    user.PasswordHash = passwordHasher.HashPassword(
        user,
        request.NewPassword);

    await _dbContext.SaveChangesAsync(cancellationToken);

    var revokedAtUtc = DateTime.UtcNow;

    await _dbContext.UserSessions
        .Where(session =>
            session.UserId == userId &&
            session.RevokedAtUtc == null)
        .ExecuteUpdateAsync(
            setters => setters.SetProperty(
                session => session.RevokedAtUtc,
                (DateTime?)revokedAtUtc),
            cancellationToken);

    await transaction.CommitAsync(cancellationToken);

    return NoContent();
}
    
private ObjectResult EmailUnavailable()
{
    return Problem(
        statusCode: StatusCodes.Status409Conflict,
        title: "Email unavailable",
        detail: "An account with this email already exists.");
}
}