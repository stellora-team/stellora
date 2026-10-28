using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Dashboard;
using Stellora.Api.Data;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public DashboardController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(
        CancellationToken cancellationToken)
    {
        Response.Headers["Cache-Control"] = "no-store";

        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users
            .AsNoTracking()
            .Where(candidate => candidate.Id == userId)
            .Select(candidate => new
            {
                candidate.DisplayName,
                candidate.TimeZone
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZone);
        var localNow = TimeZoneInfo.ConvertTime(
            DateTimeOffset.UtcNow,
            timeZone);

        return Ok(new DashboardResponse(
            user.DisplayName,
            user.TimeZone,
            DateOnly.FromDateTime(localNow.DateTime),
            localNow));
    }
}