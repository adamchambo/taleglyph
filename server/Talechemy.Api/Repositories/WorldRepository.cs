using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Repositories;

public sealed class WorldRepository(TalechemyDbContext db) : IWorldRepository
{
    public async Task<World> AddWorldAsync(World world, CancellationToken ct = default)
    {
        db.Worlds.Add(world); await db.SaveChangesAsync(ct); return world;
    }
    public async Task<IReadOnlyList<World>> GetWorldsAsync(CancellationToken ct = default)
    {
        return await db.Worlds.AsNoTracking().OrderBy(x => x.Name).ToArrayAsync(ct);
    }
    public async Task<World?> GetWorldAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Worlds.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<World?> UpdateCastSummaryAsync(Guid id, string summary, CancellationToken ct = default)
    {
        var world = await db.Worlds.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (world is null) return null;
        world.CastSummary = summary;
        await db.SaveChangesAsync(ct);
        return world;
    }
    public async Task<IReadOnlyList<Character>> GetCharactersAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.Characters.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Name).ToArrayAsync(ct);
    }
    public async Task<Character?> GetCharacterAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Characters.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<Character> AddCharacterAsync(Character character, CancellationToken ct = default)
    {
        db.Characters.Add(character); await db.SaveChangesAsync(ct); return character;
    }
    public async Task<bool> UpdateCharacterAsync(Character character, CancellationToken ct = default)
    {
        var current = await db.Characters.FindAsync([character.Id], ct);
        if (current is null) return false;
        db.Entry(current).CurrentValues.SetValues(character);
        await db.SaveChangesAsync(ct);
        return true;
    }
    public async Task<IReadOnlyList<Location>> GetLocationsAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.Locations.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Name).ToArrayAsync(ct);
    }
    public async Task<IReadOnlyList<LoreEntry>> GetLoreAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.LoreEntries.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
    public async Task<IReadOnlyList<Relationship>> GetRelationshipsAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.Relationships.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
    public async Task<IReadOnlyList<Note>> GetNotesAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.Notes.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
}
