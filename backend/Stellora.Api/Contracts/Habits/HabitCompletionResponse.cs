namespace Stellora.Api.Contracts.Habits;

public sealed record HabitCompletionResponse(
    Guid Id,
    DateOnly CompletedOn,
    DateTime CreatedAtUtc);