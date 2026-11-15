namespace Stellora.Api.Contracts.Calendar;

public sealed record CalendarResponse(
    DateOnly From,
    DateOnly To,
    string TimeZone,
    List<CalendarDayResponse> Days);

public sealed record CalendarDayResponse(
    DateOnly Date,
    List<CalendarHabitResponse> Habits);

public sealed record CalendarHabitResponse(
    Guid Id,
    string Title,
    int CategoryId,
    bool IsScheduled,
    bool IsCompleted);