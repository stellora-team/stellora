namespace Stellora.Api.Contracts.Habits;

public sealed record HabitPageResponse(
    List<HabitResponse> Items,
    int Page,
    int PageSize,
    int TotalCount);