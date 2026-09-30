using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Repositories;

public sealed class AssetRepository(TalechemyDbContext db) : IAssetRepository
{
    public async Task<IReadOnlyList<Asset>> GetAssetsAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.Assets.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Name).ToArrayAsync(ct);
    }
    public async Task<Asset?> GetAssetAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Assets.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<AssetVersion>> GetVersionsAsync(Guid assetId, CancellationToken ct = default)
    {
        return await db.AssetVersions.AsNoTracking().Where(x => x.AssetId == assetId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
}
