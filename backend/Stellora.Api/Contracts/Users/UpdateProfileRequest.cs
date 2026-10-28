using System.ComponentModel.DataAnnotations;

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
}