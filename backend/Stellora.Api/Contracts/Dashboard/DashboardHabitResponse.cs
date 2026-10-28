namespace Stellora.Api.Contracts.Dashboard;

public sealed record DashboardHabitResponse(
    Guid Id,
    string Title,
    int CategoryId,
    bool IsCompletedToday);