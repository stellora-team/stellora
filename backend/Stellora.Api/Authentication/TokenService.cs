using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Stellora.Api.Models;

namespace Stellora.Api.Authentication;

public sealed class TokenService
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly SigningCredentials _credentials;

    public int LifetimeMinutes { get; }

    public TokenService(IConfiguration configuration)
    {
        _issuer = configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT issuer is missing.");

        _audience = configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT audience is missing.");

        var signingKey = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("JWT signing key is missing.");

        var keyBytes = Convert.FromBase64String(signingKey);

        if (keyBytes.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT signing key must contain at least 32 bytes.");
        }

        LifetimeMinutes = configuration.GetValue<int>("Jwt:LifetimeMinutes");

        if (LifetimeMinutes is < 1 or > 1440)
        {
            throw new InvalidOperationException(
                "JWT lifetime must be between 1 and 1440 minutes.");
        }

        _credentials = new SigningCredentials(
            new SymmetricSecurityKey(keyBytes),
            SecurityAlgorithms.HmacSha256);
    }

    public string CreateAccessToken(UserSession session)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, session.UserId.ToString()),
            new Claim("sid", session.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: session.CreatedAtUtc,
            expires: session.ExpiresAtUtc,
            signingCredentials: _credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}