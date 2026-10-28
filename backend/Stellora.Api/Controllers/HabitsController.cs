using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Habits;
using Stellora.Api.Data;
using Stellora.Api.Models;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/habits")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class HabitsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HabitsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost]
    public async Task<ActionResult<HabitResponse>> Create(
        [FromBody] CreateHabitRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var categoryExists = await _dbContext.Categories
            .AnyAsync(
                category => category.Id == request.CategoryId,
                cancellationToken);

        if (!categoryExists)
        {
            ModelState.AddModelError(
                nameof(request.CategoryId),
                "Category does not exist.");

            return ValidationProblem(ModelState);
        }

        var habit = new Habit
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Title = request.Title,
            Description = request.Description
        };

        _dbContext.Habits.Add(habit);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new HabitResponse(
            habit.Id,
            habit.Title,
            habit.Description,
            habit.CategoryId,
            habit.CreatedAtUtc,
            habit.UpdatedAtUtc);

        return CreatedAtAction(
            nameof(GetById),
            new { id = habit.Id },
            response);
    }

    [HttpGet]
    public async Task<ActionResult<HabitPageResponse>> GetAll(
        CancellationToken cancellationToken,
        [FromQuery, Range(1, 1_000_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var query = _dbContext.Habits
            .AsNoTracking()
            .Where(habit => habit.UserId == userId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(habit => habit.CreatedAtUtc)
            .ThenByDescending(habit => habit.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(habit => new HabitResponse(
                habit.Id,
                habit.Title,
                habit.Description,
                habit.CategoryId,
                habit.CreatedAtUtc,
                habit.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return Ok(new HabitPageResponse(
            items,
            page,
            pageSize,
            totalCount));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HabitResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var habit = await _dbContext.Habits
            .AsNoTracking()
            .Where(candidate =>
                candidate.Id == id &&
                candidate.UserId == userId)
            .Select(candidate => new HabitResponse(
                candidate.Id,
                candidate.Title,
                candidate.Description,
                candidate.CategoryId,
                candidate.CreatedAtUtc,
                candidate.UpdatedAtUtc))
            .SingleOrDefaultAsync(cancellationToken);

        if (habit is null)
        {
            return NotFound();
        }

        return Ok(habit);
    }
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<HabitResponse>> Update(
        Guid id,
        [FromBody] UpdateHabitRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var habit = await _dbContext.Habits
            .SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                             candidate.UserId == userId,
                cancellationToken);

        if (habit is null)
        {
            return NotFound();
        }

        var categoryExists = await _dbContext.Categories
            .AnyAsync(
                category => category.Id == request.CategoryId,
                cancellationToken);

        if (!categoryExists)
        {
            ModelState.AddModelError(
                nameof(request.CategoryId),
                "Category does not exist.");

            return ValidationProblem(ModelState);
        }

        habit.Title = request.Title;
        habit.Description = request.Description;
        habit.CategoryId = request.CategoryId;
        habit.UpdatedAtUtc = DateTime.UtcNow;

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return NotFound();
        }

        return Ok(new HabitResponse(
            habit.Id,
            habit.Title,
            habit.Description,
            habit.CategoryId,
            habit.CreatedAtUtc,
            habit.UpdatedAtUtc));
    }
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var deletedCount = await _dbContext.Habits
            .Where(habit =>
                habit.Id == id &&
                habit.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);

        if (deletedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}