namespace Stellora.Api.Contracts.Moods;

public sealed record MoodResponse(
    Guid Id,
    DateOnly RecordedOn,
    int Score,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);