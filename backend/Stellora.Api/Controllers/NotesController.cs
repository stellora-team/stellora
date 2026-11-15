using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Contracts.Notes;
using Stellora.Api.Data;
using Stellora.Api.Models;

namespace Stellora.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notes")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class NotesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public NotesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost]
    public async Task<ActionResult<NoteResponse>> Create(
        [FromBody] SaveNoteRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var note = new Note
        {
            UserId = userId,
            Title = request.Title,
            Content = request.Content
        };

        _dbContext.Notes.Add(note);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = note.Id },
            ToResponse(note));
    }

    [HttpGet]
    public async Task<ActionResult<NotePageResponse>> GetAll(
        CancellationToken cancellationToken,
        [FromQuery, Range(1, 1_000_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var query = _dbContext.Notes
            .AsNoTracking()
            .Where(note => note.UserId == userId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(note => note.CreatedAtUtc)
            .ThenByDescending(note => note.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(note => new NoteResponse(
                note.Id,
                note.Title,
                note.Content,
                note.CreatedAtUtc,
                note.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return Ok(new NotePageResponse(
            items,
            page,
            pageSize,
            totalCount));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var response = await _dbContext.Notes
            .AsNoTracking()
            .Where(note => note.Id == id && note.UserId == userId)
            .Select(note => new NoteResponse(
                note.Id,
                note.Title,
                note.Content,
                note.CreatedAtUtc,
                note.UpdatedAtUtc))
            .SingleOrDefaultAsync(cancellationToken);

        if (response is null)
        {
            return NotFound();
        }

        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoteResponse>> Update(
        Guid id,
        [FromBody] SaveNoteRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            return Unauthorized();
        }

        var note = await _dbContext.Notes
            .SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                             candidate.UserId == userId,
                cancellationToken);

        if (note is null)
        {
            return NotFound();
        }

        if (note.Title == request.Title &&
            note.Content == request.Content)
        {
            return Ok(ToResponse(note));
        }

        note.Title = request.Title;
        note.Content = request.Content;
        note.UpdatedAtUtc = DateTime.UtcNow;

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Заметку могли удалить после загрузки.
            return NotFound();
        }

        return Ok(ToResponse(note));
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

        var deletedCount = await _dbContext.Notes
            .Where(note => note.Id == id && note.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);

        if (deletedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

    private static NoteResponse ToResponse(Note note)
    {
        return new NoteResponse(
            note.Id,
            note.Title,
            note.Content,
            note.CreatedAtUtc,
            note.UpdatedAtUtc);
    }
}