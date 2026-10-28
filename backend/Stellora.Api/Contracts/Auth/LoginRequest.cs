using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Contracts.Auth;

public sealed class LoginRequest
{
    private string _email = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email
    {
        get => _email;
        set => _email = value?.Trim() ?? string.Empty;
    }

    [Required]
    [StringLength(128)]
    public string Password { get; set; } = string.Empty;
}
