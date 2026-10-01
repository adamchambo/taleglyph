using Talechemy.Api.Models.Comics;
namespace Talechemy.Api.Repositories.Interfaces;

public interface IComicRepository
{
    Task<Comic?> GetComicAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ComicPage>> GetPagesAsync(Guid comicId, CancellationToken ct = default);
    Task<ComicPage?> GetPageAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Panel>> GetPanelsAsync(Guid pageId, CancellationToken ct = default);
    Task<Panel?> GetPanelAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Layer>> GetLayersAsync(Guid panelId, CancellationToken ct = default);
}
