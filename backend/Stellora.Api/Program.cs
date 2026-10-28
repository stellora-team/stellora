using Microsoft.EntityFrameworkCore;
using Stellora.Api.Data;
using Microsoft.AspNetCore.Identity;
using Stellora.Api.Models;
using Stellora.Api.Authentication;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration
                           .GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException(
                           "Connection string 'DefaultConnection' is not configured!");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<TokenService>();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddStelloraAuthentication(builder.Configuration);
var app = builder.Build();

app.UseExceptionHandler();
app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();