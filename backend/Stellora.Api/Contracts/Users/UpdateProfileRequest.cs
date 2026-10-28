using System.ComponentModel.DataAnnotations;
using Stellora.Api.Validation;

namespace Stellora.Api.Contracts.Users;

public sealed class UpdateProfileRequest
{
    private string _displayName = string.Empty;
    private string _email = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string DisplayName
    {
        get => _displayName;
        set => _displayName = value?.Trim() ?? string.Empty;
    }

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email
    {
        get => _email;
        set => _email = value?.Trim() ?? string.Empty;
    }

    [StringLength(128)]
    public string? CurrentPassword { get; set; }
    
    private string _timeZone = string.Empty;

    [Required]
    [StringLength(100)]
    [IanaTimeZone]
    public string TimeZone
    {
        get => _timeZone;
        set => _timeZone = value?.Trim() ?? string.Empty;
    }
}