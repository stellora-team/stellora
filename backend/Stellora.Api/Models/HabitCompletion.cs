namespace Stellora.Api.Models;

public sealed class HabitCompletion
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid HabitId { get; set; }

    public DateOnly CompletedOn { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}