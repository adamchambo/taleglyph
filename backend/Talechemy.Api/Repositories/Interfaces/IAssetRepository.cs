using Talechemy.Api.Models.Assets;
namespace Talechemy.Api.Repositories.Interfaces;

public interface IAssetRepository
{
    Task<IReadOnlyList<Asset>> GetAssetsAsync(Guid worldId, CancellationToken ct = default);
    Task<Asset?> GetAssetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AssetVersion>> GetVersionsAsync(Guid assetId, CancellationToken ct = default);
}
