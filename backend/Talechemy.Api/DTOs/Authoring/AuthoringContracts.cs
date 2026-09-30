using System.ComponentModel.DataAnnotations;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Validation;
namespace Talechemy.Api.DTOs.Authoring;

public sealed record ChapterWorkspace(ChapterResponse Chapter, StoryResponse Story, IReadOnlyList<SceneResponse> Scenes);
public sealed class CreateStoryRequest
{
    [NonEmptyGuid] public Guid WorldId { get; init; }
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [StringLength(4000)] public string Synopsis { get; init; } = "";
}
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
