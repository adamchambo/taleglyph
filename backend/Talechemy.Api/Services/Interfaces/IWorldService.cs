using Talechemy.Api.DTOs.Worlds;
using Talechemy.Api.DTOs.Characters;
using Talechemy.Api.DTOs.Locations;
namespace Talechemy.Api.Services.Interfaces;

public interface IWorldService
{
    Task<WorldResponse> CreateWorldAsync(CreateWorldRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<WorldResponse>> GetWorldsAsync(CancellationToken ct = default);
    Task<WorldResponse?> GetWorldAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<CharacterResponse>> GetCharactersAsync(Guid worldId, CancellationToken ct = default);
    Task<CharacterResponse?> GetCharacterAsync(Guid id, CancellationToken ct = default);
    Task<CharacterResponse?> CreateCharacterAsync(CreateCharacterRequest request, CancellationToken ct = default);
    Task<CharacterResponse?> UpdateCharacterAsync(Guid id, UpdateCharacterRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<LocationResponse>> GetLocationsAsync(Guid worldId, CancellationToken ct = default);
    Task<IReadOnlyList<LoreEntryResponse>> GetLoreAsync(Guid worldId, CancellationToken ct = default);
    Task<IReadOnlyList<RelationshipResponse>> GetRelationshipsAsync(Guid worldId, CancellationToken ct = default);
    Task<IReadOnlyList<NoteResponse>> GetNotesAsync(Guid worldId, CancellationToken ct = default);
}
