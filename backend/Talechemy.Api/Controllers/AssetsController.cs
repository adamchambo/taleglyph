using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Assets;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/assets")]
public sealed class AssetsController(IAssetService service, IWorldService worlds, Talechemy.Api.Services.AssetUploadService uploads) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<AssetResponse>>> List([FromQuery] Guid worldId, CancellationToken ct) => (await worlds.GetWorldAsync(worldId, ct)) is null ? NotFound() : Ok((await service.GetAssetsAsync(worldId, ct)));
    [HttpGet("{id:guid}")] public async Task<ActionResult<AssetResponse>> Get(Guid id, CancellationToken ct) => (await service.GetAssetAsync(id, ct)) is { } asset ? Ok(asset) : NotFound();
    [HttpGet("{id:guid}/versions")] public async Task<ActionResult<IReadOnlyList<AssetVersionResponse>>> Versions(Guid id, CancellationToken ct) => (await service.GetAssetAsync(id, ct)) is null ? NotFound() : Ok((await service.GetVersionsAsync(id, ct)));
    [HttpPost("upload"), RequestSizeLimit(9_000_000)]
    public async Task<IActionResult> Upload([FromForm] Guid worldId, [FromForm] string name, IFormFile file, CancellationToken ct) => Ok(await uploads.Upload(worldId, name, file, ct));
    [HttpGet("{id:guid}/image")]
    public async Task<IActionResult> Image(Guid id, CancellationToken ct)
    {
        var result = await uploads.Image(id, ct);
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return PhysicalFile(result.Path, result.ContentType);
    }
}
