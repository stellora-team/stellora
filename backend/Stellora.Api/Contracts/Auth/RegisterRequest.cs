using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Contracts.Auth;

public sealed class RegisterRequest
{
    private string _email = string.Empty;
    private string _displayName = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email
    {
        get => _email;
        set => _email = value?.Trim() ?? string.Empty;
    }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string DisplayName
    {
        get => _displayName;
        set => _displayName = value?.Trim() ?? string.Empty;
    }

    [Required]
    [StringLength(128, MinimumLength = 12)]
    public string Password { get; set; } = string.Empty;
}