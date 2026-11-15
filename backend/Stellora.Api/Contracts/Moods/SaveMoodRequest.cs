using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Contracts.Moods;

public sealed class SaveMoodRequest
{
    [Required]
    [Range(1, 5)]
    public int? Score { get; set; }
}