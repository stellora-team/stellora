using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Contracts.Habits;

public sealed class UpdateHabitRequest
{
    private string _title = string.Empty;
    private string? _description;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Title
    {
        get => _title;
        set => _title = value?.Trim() ?? string.Empty;
    }

    [StringLength(1000)]
    public string? Description
    {
        get => _description;
        set => _description = string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}