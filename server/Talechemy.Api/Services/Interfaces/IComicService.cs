using Talechemy.Api.DTOs.Comics;
namespace Talechemy.Api.Services.Interfaces;

public interface IComicService
{
    Task<IReadOnlyList<ComicResponse>> GetComicsAsync(Guid storyId, CancellationToken ct = default);
    Task<ComicResponse?> GetComicAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ComicPageResponse>> GetPagesAsync(Guid comicId, CancellationToken ct = default);
    Task<ComicPageResponse?> GetPageAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PanelResponse>> GetPanelsAsync(Guid pageId, CancellationToken ct = default);
    Task<PanelResponse?> GetPanelAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<LayerResponse>> GetLayersAsync(Guid panelId, CancellationToken ct = default);
}
