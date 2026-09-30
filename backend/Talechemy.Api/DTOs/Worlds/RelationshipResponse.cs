namespace Talechemy.Api.DTOs.Worlds;

public sealed record RelationshipResponse(Guid Id, Guid WorldId, Guid FromCharacterId, Guid ToCharacterId, string Kind, string Description);
