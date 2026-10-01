using Talechemy.Api.DTOs.Library;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Assets;
namespace Talechemy.Api.Repositories.Interfaces;
public interface ILibraryRepository
{
    Task<LibrarySnapshot> Snapshot(CancellationToken ct);
    Task<StoryCard?> Card(Guid id, CancellationToken ct);
    Task<Story?> Story(Guid id, CancellationToken ct);
    Task<World?> Space(Guid id, CancellationToken ct);
    Task<Asset?> Asset(Guid id, CancellationToken ct);
    Task<Series?> Series(Guid id, CancellationToken ct);
    Task<Guid?> StoryFor(string kind, Guid id, CancellationToken ct);
    void Add<T>(T entity) where T:class;
    Task Save(CancellationToken ct);
}
