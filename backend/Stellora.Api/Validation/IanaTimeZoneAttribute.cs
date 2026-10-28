using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class IanaTimeZoneAttribute : ValidationAttribute
{
    public IanaTimeZoneAttribute()
    {
        ErrorMessage =
            "Use a supported IANA time zone, such as Europe/Prague, or UTC.";
    }

    public override bool IsValid(object? value)
    {
        // Відсутнє значення перевіряє атрибут Required.
        if (value is null)
        {
            return true;
        }

        if (value is not string timeZoneId)
        {
            return false;
        }

        if (timeZoneId == "UTC")
        {
            return true;
        }

        if (!TimeZoneInfo.TryConvertIanaIdToWindowsId(timeZoneId, out _))
        {
            return false;
        }

        try
        {
            _ = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
        catch (InvalidTimeZoneException)
        {
            return false;
        }
    }
}