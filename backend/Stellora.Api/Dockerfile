FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/Stellora.Api/Stellora.Api.csproj backend/Stellora.Api/
RUN dotnet restore backend/Stellora.Api/Stellora.Api.csproj

COPY backend/Stellora.Api/ backend/Stellora.Api/

RUN dotnet publish backend/Stellora.Api/Stellora.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM build AS migrations
RUN dotnet tool install dotnet-ef \
    --version 10.0.13 \
    --tool-path /tools

ENTRYPOINT ["/tools/dotnet-ef", "database", "update", "--project", "backend/Stellora.Api", "--startup-project", "backend/Stellora.Api", "--configuration", "Release", "--no-build"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

USER $APP_UID

ENTRYPOINT ["dotnet", "Stellora.Api.dll"]