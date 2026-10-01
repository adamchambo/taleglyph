namespace Talechemy.Api.DTOs.Characters;

public sealed record CharacterResponse(Guid Id, Guid WorldId, string Name, string Role, string Description, string Motivation, string CanonStatus);
