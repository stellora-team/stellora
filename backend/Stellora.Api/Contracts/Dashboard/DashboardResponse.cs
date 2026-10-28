namespace Stellora.Api.Contracts.Dashboard;

public sealed record DashboardResponse(
    string DisplayName,
    string TimeZone,
    DateOnly Today,
    DateTimeOffset LocalNow,
    DashboardHabitsResponse Habits);