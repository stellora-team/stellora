using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;

namespace Stellora.Api.Authentication;

public sealed class DummyPasswordVerifier
{
    private readonly object _dummyUser = new();
    private readonly PasswordHasher<object> _hasher = new();
    private readonly string _passwordHash;

    public DummyPasswordVerifier()
    {
        var randomPassword = Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(32));

        _passwordHash = _hasher.HashPassword(
            _dummyUser,
            randomPassword);
    }

    public void Verify(string password)
    {
        _ = _hasher.VerifyHashedPassword(
            _dummyUser,
            _passwordHash,
            password);
    }
}