namespace Stellora.Api.Contracts.Users;

public sealed record UserProfileResponse(
    Guid Id,
    string Email,
    string DisplayName,
    DateTime CreatedAtUtc,
    string TimeZone);