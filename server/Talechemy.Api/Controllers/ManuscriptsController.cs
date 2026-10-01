using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Authoring;
using Talechemy.Api.Services;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/manuscripts")]
public sealed class ManuscriptsController(AuthoringService service) : ControllerBase
{
    [HttpPost("stories")]
    public async Task<IActionResult> Story(CreateStoryRequest request, CancellationToken ct) => Ok(await service.CreateStory(request, ct));
    [HttpGet("novels/{id:guid}")]
    public async Task<IActionResult> Novel(Guid id, CancellationToken ct) => Ok(await service.GetNovel(id, ct));
    [HttpPost("novels/{id:guid}/chapters")]
    public async Task<IActionResult> Chapter(Guid id, TitleRequest request, CancellationToken ct) => Ok(await service.CreateChapter(id, request, ct));
    [HttpGet("chapters/{id:guid}")]
    public async Task<IActionResult> GetChapter(Guid id, CancellationToken ct) => Ok(await service.GetChapter(id, ct));
    [HttpPost("chapters/{id:guid}/scenes")]
    public async Task<IActionResult> Scene(Guid id, SceneDraft request, CancellationToken ct) => Ok(await service.CreateScene(id, request, ct));
    [HttpPut("scenes/{id:guid}")]
    public async Task<IActionResult> UpdateScene(Guid id, SceneDraft request, CancellationToken ct) => Ok(await service.UpdateScene(id, request, ct));
}
