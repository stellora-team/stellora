namespace Stellora.Api.Contracts.Notes;

public sealed record NotePageResponse(
    List<NoteResponse> Items,
    int Page,
    int PageSize,
    int TotalCount);