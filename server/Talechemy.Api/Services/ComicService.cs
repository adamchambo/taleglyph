using Talechemy.Api.DTOs.Comics;
using Talechemy.Api.Mapping;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Services;

public sealed class ComicService(IComicRepository repository) : IComicService
{
    public async Task<IReadOnlyList<ComicResponse>> GetComicsAsync(Guid storyId, CancellationToken ct = default) => (await repository.GetComicsAsync(storyId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<ComicResponse?> GetComicAsync(Guid id, CancellationToken ct = default) => (await repository.GetComicAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<ComicPageResponse>> GetPagesAsync(Guid comicId, CancellationToken ct = default) => (await repository.GetPagesAsync(comicId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<ComicPageResponse?> GetPageAsync(Guid id, CancellationToken ct = default) => (await repository.GetPageAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<PanelResponse>> GetPanelsAsync(Guid pageId, CancellationToken ct = default) => (await repository.GetPanelsAsync(pageId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<PanelResponse?> GetPanelAsync(Guid id, CancellationToken ct = default) => (await repository.GetPanelAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<LayerResponse>> GetLayersAsync(Guid panelId, CancellationToken ct = default) => (await repository.GetLayersAsync(panelId, ct)).Select(x => x.ToResponse()).ToArray();
}
