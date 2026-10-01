using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
namespace Talechemy.Api.Repositories.Interfaces;

public interface IWorkspaceRepository
{
    Task<bool> WorldExists(Guid id, CancellationToken ct);
    Task<Story?> Story(Guid id, CancellationToken ct);
    Task<Chapter?> Chapter(Guid id, CancellationToken ct);
    Task<Scene?> Scene(Guid id, CancellationToken ct);
    Task<Scene[]> Scenes(Guid chapterId, CancellationToken ct);
    Task<int> NextChapterOrder(Guid storyId, CancellationToken ct);
    Task<Comic?> Comic(Guid id, CancellationToken ct);
    Task<ComicPage?> Page(Guid id, CancellationToken ct);
    Task<ComicPage[]> Pages(Guid comicId, CancellationToken ct);
    Task<Panel[]> Panels(Guid pageId, CancellationToken ct);
    Task<Layer[]> Layers(Guid[] panelIds, CancellationToken ct);
    Task<AdaptationLink?> Source(Guid pageId, CancellationToken ct);
    Task<PageTemplate?> Template(Guid id, CancellationToken ct);
    Task<PageTemplate[]> Templates(Guid worldId, CancellationToken ct);
    Task<Asset?> Asset(Guid id, CancellationToken ct);
    Task<int> CountAssets(Guid worldId, Guid[] ids, CancellationToken ct);
    void Add<T>(T entity) where T : class;
    void RemoveLayers(IEnumerable<Layer> layers);
    void RemovePanels(IEnumerable<Panel> panels);
    Task Save(CancellationToken ct);
}
