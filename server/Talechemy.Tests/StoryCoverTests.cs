using Talechemy.Api.DTOs.Library;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Services;
using Xunit;

namespace Talechemy.Tests;

public class StoryCoverTests
{
    [Fact]
    public async Task DetailsSaveAndClearCoverAndReturnItOnCard()
    {
        var repo = new CoverRepository();
        var service = new LibraryService(repo);
        var created = await service.Create(new() { SpaceId = repo.World.Id, Title = "Story" }, default);
        Assert.Null(created.CoverAssetId);
        var updated = await service.Update(created.Id, new()
        {
            SpaceId = repo.World.Id, Title = "Story", CoverAssetId = repo.Art.Id, Revision = created.Revision
        }, default);
        Assert.Equal(repo.Art.Id, updated.CoverAssetId);
        Assert.Equal(repo.Art.Id, repo.SavedStory!.CoverAssetId);
        var cleared = await service.Update(created.Id, new()
        {
            SpaceId = repo.World.Id, Title = "Story", CoverAssetId = null, Revision = updated.Revision
        }, default);
        Assert.Null(cleared.CoverAssetId);
        Assert.Null(repo.SavedStory.CoverAssetId);
    }

    [Theory]
    [InlineData("missing")]
    [InlineData("other-space")]
    [InlineData("not-image")]
    public async Task RejectsInvalidArtworkOnCreateAndUpdate(string reason)
    {
        var repo = new CoverRepository();
        var service = new LibraryService(repo);
        var created = await service.Create(new() { SpaceId = repo.World.Id, Title = "Story" }, default);
        if (reason == "other-space") repo.Art.WorldId = Guid.NewGuid();
        if (reason == "not-image") repo.Art.ImageFileName = null;
        var request = new StorySetupRequest
        {
            SpaceId = repo.World.Id, Title = "Story", Revision = created.Revision,
            CoverAssetId = reason == "missing" ? Guid.NewGuid() : repo.Art.Id
        };
        await Assert.ThrowsAsync<WorkflowException>(() => service.Create(request, default));
        await Assert.ThrowsAsync<WorkflowException>(() => service.Update(created.Id, request, default));
        Assert.Null(repo.SavedStory!.CoverAssetId);
    }

    private sealed class CoverRepository : ILibraryRepository
    {
        public World World { get; } = new() { Id = Guid.NewGuid(), Name = "Space" };
        public Asset Art { get; }
        public Story? SavedStory { get; private set; }
        public CoverRepository() => Art = new() { Id = Guid.NewGuid(), WorldId = World.Id, ImageFileName = "cover.png" };
        public Task<Asset?> Asset(Guid id, CancellationToken ct) => Task.FromResult(id == Art.Id ? Art : null);
        public Task<World?> Space(Guid id, CancellationToken ct) => Task.FromResult<World?>(World);
        public Task<Story?> Story(Guid id, CancellationToken ct) => Task.FromResult(SavedStory);
        public Task<List<Story>> Stories(Guid spaceId, CancellationToken ct) => Task.FromResult(new List<Story>());
        public Task<StoryCard?> Card(Guid id, CancellationToken ct)
        {
            var s = SavedStory!;
            return Task.FromResult<StoryCard?>(new(s.Id, s.WorldId, World.Name, s.Title, s.Synopsis,
                s.Tags, s.UpdatedAt, s.Revision, 0, s.Order, s.CoverAssetId));
        }
        public void Add<T>(T entity) where T : class => SavedStory = (Story)(object)entity;
        public Task Save(CancellationToken ct) => Task.CompletedTask;
        public Task<LibrarySnapshot> Snapshot(CancellationToken ct) => throw new NotSupportedException();
        public Task<Guid?> SpaceFor(string kind, Guid id, CancellationToken ct) => throw new NotSupportedException();
    }
}
