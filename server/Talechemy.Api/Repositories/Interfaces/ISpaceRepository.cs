using Talechemy.Api.DTOs.Spaces;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
namespace Talechemy.Api.Repositories.Interfaces;

public interface ISpaceRepository
{
    Task<World?> Space(Guid id, CancellationToken ct);
    Task<Asset?> Asset(Guid id, CancellationToken ct);
    Task<WorkCard[]> Novels(Guid spaceId, CancellationToken ct);
    Task<WorkCard[]> Comics(Guid spaceId, CancellationToken ct);
    Task<Novel?> Novel(Guid id, CancellationToken ct);
    Task<Comic?> Comic(Guid id, CancellationToken ct);
    Task<Story?> Story(Guid id, CancellationToken ct);
    Task<Arc?> Arc(Guid id, CancellationToken ct);
    Task<ArcResponse[]> Arcs(Guid spaceId, CancellationToken ct);
    Task<Arc[]> StoryArcs(Guid storyId, CancellationToken ct);
    Task<LinkResponse[]> Links(Guid spaceId, CancellationToken ct);
    Task<Link?> Link(Guid id, CancellationToken ct);
    Task<bool> LinkExists(string fromKind, Guid fromId, string toKind, Guid toId, CancellationToken ct);
    Task<Link[]> LinksTouching(string kind, Guid id, CancellationToken ct);
    Task<Guid?> SpaceOf(string kind, Guid id, CancellationToken ct);
    Task<NoteCard[]> Notes(Guid spaceId, CancellationToken ct);
    Task<Note?> Note(Guid id, CancellationToken ct);
    void Add<T>(T entity) where T : class;
    void Remove<T>(T entity) where T : class;
    void RemoveRange<T>(IEnumerable<T> entities) where T : class;
    Task Save(CancellationToken ct);
}
