using Talechemy.Api.DTOs.Worlds;
using Talechemy.Api.DTOs.Characters;
using Talechemy.Api.DTOs.Locations;
using Talechemy.Api.Models.World;
using Talechemy.Api.Mapping;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Services;

public sealed class WorldService(IWorldRepository repository) : IWorldService
{
    public async Task<IReadOnlyList<WorldResponse>> GetWorldsAsync(CancellationToken ct = default) => (await repository.GetWorldsAsync(ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<WorldResponse?> GetWorldAsync(Guid id, CancellationToken ct = default) => (await repository.GetWorldAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<CharacterResponse>> GetCharactersAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetCharactersAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<CharacterResponse?> GetCharacterAsync(Guid id, CancellationToken ct = default) => (await repository.GetCharacterAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<LocationResponse>> GetLocationsAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetLocationsAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<IReadOnlyList<LoreEntryResponse>> GetLoreAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetLoreAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<IReadOnlyList<RelationshipResponse>> GetRelationshipsAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetRelationshipsAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<IReadOnlyList<NoteResponse>> GetNotesAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetNotesAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();

    public async Task<WorldResponse> CreateWorldAsync(CreateWorldRequest request, CancellationToken ct = default)
    {
        var world = new World { Id = Guid.NewGuid(), Name = request.Name.Trim(), Description = request.Description.Trim(), Theme = request.Theme };
        return (await repository.AddWorldAsync(world, ct)).ToResponse();
    }
    public async Task<CharacterResponse?> CreateCharacterAsync(CreateCharacterRequest request, CancellationToken ct = default)
    {
        if (await repository.GetWorldAsync(request.WorldId, ct) is null) return null;
        var character = new Character { Id = Guid.NewGuid(), WorldId = request.WorldId, Name = request.Name.Trim(), Role = request.Role.Trim(), Description = request.Description.Trim(), Motivation = request.Motivation.Trim(), CanonStatus = request.CanonStatus };
        return (await repository.AddCharacterAsync(character, ct)).ToResponse();
    }
    public async Task<CharacterResponse?> UpdateCharacterAsync(Guid id, UpdateCharacterRequest request, CancellationToken ct = default)
    {
        var character = await repository.GetCharacterAsync(id, ct);
        if (character is null) return null;
        character.Name = request.Name.Trim(); character.Role = request.Role.Trim();
        character.Description = request.Description.Trim(); character.Motivation = request.Motivation.Trim(); character.CanonStatus = request.CanonStatus;
        return await repository.UpdateCharacterAsync(character, ct) ? character.ToResponse() : null;
    }
}
