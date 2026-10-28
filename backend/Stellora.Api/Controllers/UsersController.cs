using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Users;
using Stellora.Api.Data;

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
                user.CreatedAtUtc))
            .SingleOrDefaultAsync(cancellationToken);

        if (profile is null)
        {
            return Unauthorized();
        }

        return Ok(profile);
    }
}