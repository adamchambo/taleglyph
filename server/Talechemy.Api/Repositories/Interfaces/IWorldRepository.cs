using Talechemy.Api.Models.World;
namespace Talechemy.Api.Repositories.Interfaces;

public interface IWorldRepository
{
    Task<World> AddWorldAsync(World world, CancellationToken ct = default);
    Task<IReadOnlyList<World>> GetWorldsAsync(CancellationToken ct = default);
    Task<World?> GetWorldAsync(Guid id, CancellationToken ct = default);
    Task<World?> UpdateCastSummaryAsync(Guid id, string summary, CancellationToken ct = default);
    Task<IReadOnlyList<Character>> GetCharactersAsync(Guid worldId, CancellationToken ct = default);
    Task<Character?> GetCharacterAsync(Guid id, CancellationToken ct = default);
    Task<Character> AddCharacterAsync(Character character, CancellationToken ct = default);
    Task<bool> UpdateCharacterAsync(Character character, CancellationToken ct = default);
    Task<IReadOnlyList<Location>> GetLocationsAsync(Guid worldId, CancellationToken ct = default);
    Task<IReadOnlyList<LoreEntry>> GetLoreAsync(Guid worldId, CancellationToken ct = default);
    Task<IReadOnlyList<Relationship>> GetRelationshipsAsync(Guid worldId, CancellationToken ct = default);
    Task<IReadOnlyList<Note>> GetNotesAsync(Guid worldId, CancellationToken ct = default);
}
