using System.ComponentModel.DataAnnotations;
using Talechemy.Api.DTOs.Stories;
namespace Talechemy.Api.DTOs.Authoring;

public sealed record ChapterWorkspace(ChapterResponse Chapter, NovelResponse Novel, IReadOnlyList<SceneResponse> Scenes);
public sealed class TitleRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
}
public sealed class SceneDraft
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [StringLength(100000)] public string Prose { get; init; } = "";
    [Range(1, int.MaxValue)] public int Revision { get; init; } = 1;
}
