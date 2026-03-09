# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore dependencies first (cached layer — only re-runs if .csproj changes)
COPY backend.csproj ./
RUN dotnet restore

# Copy source and publish
COPY . ./
RUN dotnet publish -c Release -o /app/out \
    --no-restore \
    /p:UseAppHost=false

# Runtime stage — slim image, no SDK
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Run as non-root user for security
RUN adduser --disabled-password --gecos "" appuser \
    && mkdir -p Uploads \
    && chown -R appuser:appuser /app

COPY --from=build /app/out .

USER appuser

EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "backend.dll"]
