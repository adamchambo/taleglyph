using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.World;
namespace Talechemy.Api.Repositories.Interfaces;

public interface IWorkspaceRepository
{
    Task<bool> WorldExists(Guid id, CancellationToken ct);
    Task<string?> SpaceName(Guid id, CancellationToken ct);
    Task<Novel?> Novel(Guid id, CancellationToken ct);
    Task<Chapter[]> Chapters(Guid novelId, CancellationToken ct);
    Task<Chapter?> Chapter(Guid id, CancellationToken ct);
    Task<Scene?> Scene(Guid id, CancellationToken ct);
    Task<Scene[]> Scenes(Guid chapterId, CancellationToken ct);
    Task<int> NextChapterOrder(Guid novelId, CancellationToken ct);
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
    Task<Link[]> LinksFrom(string kind, Guid id, CancellationToken ct);
    void Add<T>(T entity) where T : class;
    void RemoveLayers(IEnumerable<Layer> layers);
    void RemovePanels(IEnumerable<Panel> panels);
    Task Save(CancellationToken ct);
}
