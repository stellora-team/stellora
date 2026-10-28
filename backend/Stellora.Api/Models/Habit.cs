namespace Stellora.Api.Models;

public sealed class Habit
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public int CategoryId { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }
    
    public int ScheduledDaysMask { get; set; } = 127;
}