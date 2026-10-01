namespace Talechemy.Api.DTOs.Locations;

public sealed record LocationResponse(Guid Id, Guid WorldId, string Name, string Description);
