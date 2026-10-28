namespace Stellora.Api.Contracts.Auth;

public sealed record LoginResponse(
    string AccessToken,
    string TokenType,
    DateTime ExpiresAtUtc);