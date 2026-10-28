namespace Stellora.Api.Contracts.Habits;

public sealed record HabitResponse(
    Guid Id,
    string Title,
    string? Description,
    int CategoryId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);