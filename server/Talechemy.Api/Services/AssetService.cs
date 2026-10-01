using Talechemy.Api.DTOs.Assets;
using Talechemy.Api.Mapping;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Services;

public sealed class AssetService(IAssetRepository repository) : IAssetService
{
    public async Task<IReadOnlyList<AssetResponse>> GetAssetsAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetAssetsAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<AssetResponse?> GetAssetAsync(Guid id, CancellationToken ct = default) => (await repository.GetAssetAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<AssetVersionResponse>> GetVersionsAsync(Guid assetId, CancellationToken ct = default) => (await repository.GetVersionsAsync(assetId, ct)).Select(x => x.ToResponse()).ToArray();
}
