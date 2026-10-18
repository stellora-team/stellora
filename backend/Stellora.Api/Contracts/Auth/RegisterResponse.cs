namespace Stellora.Api.Contracts.Auth;

public sealed record RegisterResponse(
    Guid Id,
    string Email,
    string DisplayName,
    DateTime CreatedAtUtc);