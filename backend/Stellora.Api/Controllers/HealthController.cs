using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stellora.Api.Data;
using Microsoft.AspNetCore.Authorization;

namespace Stellora.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    // перевіряє лише доступність API, без перевірки самої бд
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            service = "stellora-backend"

        });
    }

    [HttpGet("db")]
    public async Task<IActionResult> CheckDatabase(
        [FromServices] AppDbContext dbContext,
        [FromServices] IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        // діагностичний маршрут доступний лише під час розробки
        if (!environment.IsDevelopment())
        {
            return NotFound();
        }

        var canConnect = await dbContext.Database
            .CanConnectAsync(cancellationToken);

        if (!canConnect)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "error",
                database = "unavailable"
            });
        }

        return Ok(new
        {
            status = "ok",
            database = "connected"
        });
    }
    [Authorize]
    [HttpGet("auth")]
    public IActionResult CheckAuthentication()
    {
        return Ok(new { status = "authenticated" });
    }
}

