namespace Stellora.Api.Contracts.Dashboard;

public sealed record DashboardHabitsResponse(
    int TotalCount,
    int CompletedTodayCount,
    List<DashboardHabitResponse> Items);