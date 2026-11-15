using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Moods;
using Stellora.Api.Data;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/moods")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class MoodsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public MoodsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPut("today")]
    public async Task<IActionResult> SaveToday(
        [FromBody] SaveMoodRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var timeZoneId = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.TimeZone)
            .SingleOrDefaultAsync(cancellationToken);

        if (timeZoneId is null)
        {
            return Unauthorized();
        }

        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        var now = DateTimeOffset.UtcNow;
        var localNow = TimeZoneInfo.ConvertTime(now, timeZone);
        var today = DateOnly.FromDateTime(localNow.DateTime);

        var id = Guid.NewGuid();
        var createdAtUtc = now.UtcDateTime;
        var score = request.Score!.Value;

        await _dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
            INSERT INTO mood_entries
                ("Id", "UserId", "RecordedOn", "Score",
                 "CreatedAtUtc", "UpdatedAtUtc")
            VALUES
                ({id}, {userId}, {today}, {score},
                 {createdAtUtc}, NULL)
            ON CONFLICT ("UserId", "RecordedOn")
            DO UPDATE SET
                "Score" = EXCLUDED."Score",
                "UpdatedAtUtc" = EXCLUDED."CreatedAtUtc"
            WHERE mood_entries."Score" IS DISTINCT FROM EXCLUDED."Score";
            """,
            cancellationToken);

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<List<MoodResponse>>> GetHistory(
        CancellationToken cancellationToken,
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        [FromQuery, Range(1, 1_000_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 30)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            ModelState.AddModelError(
                nameof(to),
                "End date must be on or after start date.");

            return ValidationProblem(ModelState);
        }

        var query = _dbContext.MoodEntries
            .AsNoTracking()
            .Where(entry => entry.UserId == userId);

        if (from.HasValue)
        {
            query = query.Where(entry => entry.RecordedOn >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(entry => entry.RecordedOn <= to.Value);
        }

        var items = await query
            .OrderByDescending(entry => entry.RecordedOn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(entry => new MoodResponse(
                entry.Id,
                entry.RecordedOn,
                entry.Score,
                entry.CreatedAtUtc,
                entry.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }
}