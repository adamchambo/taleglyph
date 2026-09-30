using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/scenes")]
public sealed class ScenesController(IStoryService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<SceneResponse>>> List([FromQuery] Guid chapterId, CancellationToken ct) => (await service.GetChapterAsync(chapterId, ct)) is null ? NotFound() : Ok((await service.GetScenesAsync(chapterId, ct)));
    [HttpGet("{id:guid}")] public async Task<ActionResult<SceneResponse>> Get(Guid id, CancellationToken ct) => (await service.GetSceneAsync(id, ct)) is { } scene ? Ok(scene) : NotFound();
    [HttpGet("{id:guid}/adaptations")] public async Task<ActionResult<IReadOnlyList<AdaptationLinkResponse>>> Adaptations(Guid id, CancellationToken ct) => (await service.GetSceneAsync(id, ct)) is null ? NotFound() : Ok((await service.GetAdaptationsAsync(id, ct)));
}
