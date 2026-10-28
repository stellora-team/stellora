using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Stellora.Api.OpenApi;

public sealed class PublicEndpointsOperationFilter : IOperationFilter
{
    public void Apply(
        OpenApiOperation operation,
        OperationFilterContext context)
    {
        var metadata = context.ApiDescription
            .ActionDescriptor.EndpointMetadata;

        var allowsAnonymous = metadata
            .OfType<IAllowAnonymous>()
            .Any();

        var requiresAuthorization = metadata
            .OfType<IAuthorizeData>()
            .Any();

        if (allowsAnonymous || !requiresAuthorization)
        {
            operation.Security = [];
        }
    }
}