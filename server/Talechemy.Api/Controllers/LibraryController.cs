using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Library;
using Talechemy.Api.Services;
namespace Talechemy.Api.Controllers;
[ApiController,Route("api/library")]
public sealed class LibraryController(LibraryService service):ControllerBase
{
    [HttpGet] public async Task<IActionResult> Get(CancellationToken ct)=>Ok(await service.Snapshot(ct));
    [HttpGet("stories/{id:guid}")] public async Task<IActionResult> Story(Guid id,CancellationToken ct)=>Ok(await service.Card(id,ct));
    [HttpPost("stories")] public async Task<IActionResult> Create(StorySetupRequest request,CancellationToken ct)
    {var story=await service.Create(request,ct);return CreatedAtAction(nameof(Story),new{id=story.Id},story);}
    [HttpPut("stories/{id:guid}")] public async Task<IActionResult> Update(Guid id,StorySetupRequest request,CancellationToken ct)=>Ok(await service.Update(id,request,ct));
    [HttpGet("context/{kind}/{id:guid}")] public async Task<IActionResult> Context(string kind,Guid id,CancellationToken ct)=>Ok(await service.Context(kind,id,ct));
}
