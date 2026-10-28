namespace Stellora.Api.Helpers;

public static class HabitSchedule
{
    public static bool IsValid(int[]? days)
    {
        return days is { Length: >= 1 and <= 7 }
               && days.All(day => day >= 1 && day <= 7)
               && days.Distinct().Count() == days.Length;
    }

    public static int ToMask(int[] days)
    {
        if (!IsValid(days))
        {
            throw new ArgumentException(
                "Select unique days from 1 to 7.",
                nameof(days));
        }

        var mask = 0;

        foreach (var day in days)
        {
            mask |= 1 << (day - 1);
        }

        return mask;
    }

    public static int[] ToDays(int mask)
    {
        return Enumerable.Range(1, 7)
            .Where(day => (mask & (1 << (day - 1))) != 0)
            .ToArray();
    }
    
    public static int GetDayMask(DateOnly date)
    {
        var dayNumber = date.DayOfWeek == DayOfWeek.Sunday
            ? 7
            : (int)date.DayOfWeek;

        return 1 << (dayNumber - 1);
    }
}