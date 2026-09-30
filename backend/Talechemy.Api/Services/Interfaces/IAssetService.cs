using Talechemy.Api.DTOs.Assets;
namespace Talechemy.Api.Services.Interfaces;

public interface IAssetService
{
    Task<IReadOnlyList<AssetResponse>> GetAssetsAsync(Guid worldId, CancellationToken ct = default);
    Task<AssetResponse?> GetAssetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AssetVersionResponse>> GetVersionsAsync(Guid assetId, CancellationToken ct = default);
}
