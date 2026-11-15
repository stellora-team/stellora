namespace Stellora.Api.Contracts.Statistics;

public sealed record HabitStatisticsResponse(
    DateOnly From,
    DateOnly To,
    int? CategoryId,
    int TotalCompletions,
    int HabitsWithCompletions,
    List<HabitDailyStatisticsResponse> Days,
    List<HabitCompletionStatisticsResponse> Habits);

public sealed record HabitDailyStatisticsResponse(
    DateOnly Date,
    int CompletedCount);

public sealed record HabitCompletionStatisticsResponse(
    Guid HabitId,
    string Title,
    int CategoryId,
    int CompletedCount);