namespace Stellora.Api.Contracts.Categories;

public sealed record CategoryResponse(
    int Id,
    string Code,
    string Name,
    int SortOrder);