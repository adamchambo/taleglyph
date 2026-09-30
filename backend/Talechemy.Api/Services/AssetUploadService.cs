using Talechemy.Api.DTOs.Assets;
using Talechemy.Api.Mapping;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;

public sealed class AssetUploadService(IWorkspaceRepository repo, IWebHostEnvironment environment, IConfiguration configuration)
{
    private string Root => configuration["Storage:AssetDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "uploads");
    public async Task<AssetResponse> Upload(Guid worldId, string name, IFormFile file, CancellationToken ct)
    {
        if (!await repo.WorldExists(worldId, ct)) throw new WorkflowException(404, "World not found.");
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 120) throw new WorkflowException(400, "Supply an asset name of 1–120 characters.");
        if (file.Length is < 12 or > 8_388_608) throw new WorkflowException(400, "Choose a PNG, JPEG or WebP image under 8 MB.");
        using var memory = new MemoryStream(); await file.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();
        var ext = bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) ? ".png" :
            bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255 ? ".jpg" :
            System.Text.Encoding.ASCII.GetString(bytes, 0, 4) == "RIFF" && System.Text.Encoding.ASCII.GetString(bytes, 8, 4) == "WEBP" ? ".webp" : null;
        if (ext is null) throw new WorkflowException(400, "Unsupported image. Use PNG, JPEG or WebP.");
        Directory.CreateDirectory(Root);
        var fileName = Guid.NewGuid().ToString("N") + ext;
        var path = Path.Combine(Root, fileName);
        await File.WriteAllBytesAsync(path, bytes, ct);
        var asset = new Asset { Id = Guid.NewGuid(), WorldId = worldId, Name = name.Trim(), Kind = "Image", ImageFileName = fileName };
        repo.Add(asset); repo.Add(new AssetVersion { Id = Guid.NewGuid(), AssetId = asset.Id, Version = 1, Source = fileName });
        try { await repo.Save(ct); } catch { File.Delete(path); throw; }
        return asset.ToResponse();
    }
    public async Task<(string Path, string ContentType)> Image(Guid id, CancellationToken ct)
    {
        var asset = await repo.Asset(id, ct);
        if (asset?.ImageFileName is not { } fileName) throw new WorkflowException(404, "Image not found.");
        var path = Path.Combine(Root, Path.GetFileName(fileName));
        if (!File.Exists(path)) throw new WorkflowException(404, "Image file is unavailable.");
        return (path, Path.GetExtension(path) switch { ".png" => "image/png", ".webp" => "image/webp", _ => "image/jpeg" });
    }
}
