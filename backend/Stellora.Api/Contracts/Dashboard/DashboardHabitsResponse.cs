namespace Stellora.Api.Contracts.Dashboard;

public sealed record DashboardHabitsResponse(
    int TotalCount,
    int CompletedTodayCount,
    int ScheduledTodayCount,
    int CompletedScheduledTodayCount,
    List<DashboardHabitResponse> Items);