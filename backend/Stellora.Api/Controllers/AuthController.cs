using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Stellora.Api.Contracts.Auth;
using Stellora.Api.Data;
using AppUser = Stellora.Api.Models.User;

namespace Stellora.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<AppUser> _passwordHasher;

    public AuthController(
        AppDbContext dbContext,
        IPasswordHasher<AppUser> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.ToUpperInvariant();

        var emailExists = await _dbContext.Users.AnyAsync(
            user => user.NormalizedEmail == normalizedEmail,
            cancellationToken);

        if (emailExists)
        {
            return EmailAlreadyRegistered();
        }

        var user = new AppUser
        {
            Email = request.Email,
            NormalizedEmail = normalizedEmail,
            DisplayName = request.DisplayName,
            PasswordHash = string.Empty
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        _dbContext.Users.Add(user);

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
            // Інший запит міг створити користувача після нашої перевірки.
            return EmailAlreadyRegistered();
        }

        var response = new RegisterResponse(
            user.Id,
            user.Email,
            user.DisplayName,
            user.CreatedAtUtc);

        return StatusCode(StatusCodes.Status201Created, response);
    }

    private ObjectResult EmailAlreadyRegistered()
    {
        return Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Email already registered",
            detail: "An account with this email already exists.");
    }
}