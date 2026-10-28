using System.ComponentModel.DataAnnotations;
using Stellora.Api.Helpers;

namespace Stellora.Api.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class ScheduledDaysAttribute : ValidationAttribute
{
    public ScheduledDaysAttribute()
    {
        ErrorMessage =
            "Select 1 to 7 unique days: 1 is Monday, 7 is Sunday.";
    }

    public override bool IsValid(object? value)
    {
        return value is int[] days && HabitSchedule.IsValid(days);
    }
}