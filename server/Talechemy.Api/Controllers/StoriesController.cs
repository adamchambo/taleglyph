using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/stories")]
public sealed class StoriesController(IStoryService service, IWorldService worlds) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<StoryResponse>>> List([FromQuery] Guid worldId, CancellationToken ct) => (await worlds.GetWorldAsync(worldId, ct)) is null ? NotFound() : Ok((await service.GetStoriesAsync(worldId, ct)));
    [HttpGet("{id:guid}")] public async Task<ActionResult<StoryResponse>> Get(Guid id, CancellationToken ct) => (await service.GetStoryAsync(id, ct)) is { } story ? Ok(story) : NotFound();
    [HttpGet("{id:guid}/chapters")] public async Task<ActionResult<IReadOnlyList<ChapterResponse>>> Chapters(Guid id, CancellationToken ct) => (await service.GetStoryAsync(id, ct)) is null ? NotFound() : Ok((await service.GetChaptersAsync(id, ct)));
}
