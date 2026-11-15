using System.ComponentModel.DataAnnotations;

namespace Stellora.Api.Contracts.Notes;

public sealed class SaveNoteRequest
{
    private string _title = string.Empty;
    private string _content = string.Empty;

    [Required]
    [StringLength(100)]
    public string Title
    {
        get => _title;
        set => _title = value?.Trim() ?? string.Empty;
    }

    [Required]
    [StringLength(10_000)]
    public string Content
    {
        get => _content;
        set => _content = value?.Trim() ?? string.Empty;
    }
}