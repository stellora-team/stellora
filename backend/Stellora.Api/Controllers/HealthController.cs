using Microsoft.AspNetCore.Mvc;

namespace Stellora.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    // перевіряє лише доступність API, без перевірки самої бд
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "ok", service = "stellora-backend" });
    }
}
