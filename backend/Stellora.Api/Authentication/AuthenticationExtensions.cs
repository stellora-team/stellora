using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Stellora.Api.Data;

namespace Stellora.Api.Authentication;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddStelloraAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];
        var signingKey = configuration["Jwt:SigningKey"];

        if (string.IsNullOrWhiteSpace(issuer) ||
            string.IsNullOrWhiteSpace(audience) ||
            string.IsNullOrWhiteSpace(signingKey))
        {
            throw new InvalidOperationException(
                "JWT issuer, audience and signing key must be configured.");
        }

        var keyBytes = Convert.FromBase64String(signingKey);

        if (keyBytes.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT signing key must contain at least 32 bytes.");
        }

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.IncludeErrorDetails = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = issuer,

                    ValidateAudience = true,
                    ValidAudience = audience,

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),

                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    RequireSignedTokens = true,

                    ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = "sub"
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var userIdClaim = context.Principal?
                            .FindFirst("sub")?.Value;

                        var sessionIdClaim = context.Principal?
                            .FindFirst("sid")?.Value;

                        if (!Guid.TryParse(userIdClaim, out var userId) ||
                            !Guid.TryParse(sessionIdClaim, out var sessionId))
                        {
                            context.Fail("Invalid token claims.");
                            return;
                        }

                        var dbContext = context.HttpContext.RequestServices
                            .GetRequiredService<AppDbContext>();

                        var now = DateTime.UtcNow;

                        var sessionIsActive = await dbContext.UserSessions
                            .AnyAsync(
                                session =>
                                    session.Id == sessionId &&
                                    session.UserId == userId &&
                                    session.RevokedAtUtc == null &&
                                    session.ExpiresAtUtc > now,
                                context.HttpContext.RequestAborted);

                        if (!sessionIsActive)
                        {
                            context.Fail("Session is inactive.");
                        }
                    }
                };
            });

        services.AddAuthorization();

        return services;
    }
}