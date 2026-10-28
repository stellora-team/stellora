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
    [FromServices] IPasswordHasher<AppUser> passwordHasher,
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
    var emailChanged = normalizedEmail != user.NormalizedEmail;

    if (emailChanged)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            ModelState.AddModelError(
                nameof(request.CurrentPassword),
                "Current password is required to change email.");

            return ValidationProblem(ModelState);
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.CurrentPassword);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Problem(
                statusCode: StatusCodes.Status403Forbidden,
                title: "Profile update denied",
                detail: "Current password is incorrect.");
        }

        var emailExists = await _dbContext.Users.AnyAsync(
            candidate =>
                candidate.Id != userId &&
                candidate.NormalizedEmail == normalizedEmail,
            cancellationToken);

        if (emailExists)
        {
            return EmailUnavailable();
        }

        if (verificationResult ==
            PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(
                user,
                request.CurrentPassword);
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

private ObjectResult EmailUnavailable()
{
    return Problem(
        statusCode: StatusCodes.Status409Conflict,
        title: "Email unavailable",
        detail: "An account with this email already exists.");
}
}