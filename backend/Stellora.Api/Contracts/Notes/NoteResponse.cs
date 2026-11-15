namespace Stellora.Api.Contracts.Notes;

public sealed record NoteResponse(
    Guid Id,
    string Title,
    string Content,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);