namespace Stellora.Api.Models;

public sealed class Category
{
    public int Id { get; set; }

    public required string Code { get; set; }

    public required string Name { get; set; }

    public int SortOrder { get; set; }
}