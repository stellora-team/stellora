using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Contracts.Users;

public sealed class ChangePasswordRequest
{
    [Required]
    [StringLength(128)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 12)]
    public string NewPassword { get; set; } = string.Empty;
}