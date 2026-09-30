using System.ComponentModel.DataAnnotations;
using Talechemy.Api.Validation;
namespace Talechemy.Api.DTOs.Comics;

public sealed class AdaptChapterRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [Required, MinLength(1), MaxLength(50)] public Guid[] SceneIds { get; init; } = [];
    public Guid? TemplateId { get; init; }
    [Range(1, 3)] public int PanelCount { get; init; } = 3;
}
public sealed class PageDraft
{
    [Range(1, int.MaxValue)] public int Revision { get; init; } = 1;
    [Required, MinLength(1), MaxLength(12)] public PanelDraft[] Panels { get; init; } = [];
}
public sealed class PanelDraft
{
    [Required, StringLength(120)] public string Title { get; init; } = "Panel";
    [Required, MaxLength(30)] public LayerDraft[] Layers { get; init; } = [];
}
public sealed class LayerDraft
{
    [Required, StringLength(120)] public string Name { get; init; } = "Layer";
    [Required, RegularExpression("^(Image|Text)$")] public string Kind { get; init; } = "Text";
    [Range(0, 95)] public double X { get; init; }
    [Range(0, 95)] public double Y { get; init; }
    [Range(5, 100)] public double Width { get; init; } = 70;
    public bool Visible { get; init; } = true;
    public bool Locked { get; init; }
    public Guid? AssetId { get; init; }
    [StringLength(4000)] public string? Text { get; init; }
}
public sealed record TemplateResponse(Guid Id, Guid WorldId, string Name, int PanelCount);
public sealed record SourceReference(Guid SceneId, Guid ChapterId, string ChapterTitle, string OriginalTitle, string OriginalProse, int SourceRevision, string CurrentTitle, string CurrentProse, int CurrentRevision, bool NeedsReview);
public sealed record EditablePage(Guid Id, int Number, int Revision, PanelDraft[] Panels, SourceReference? Source);
public sealed record ComicWorkspace(Guid Id, Guid WorldId, string Title, string StoryTitle, IReadOnlyList<EditablePage> Pages);

public sealed class TemplateRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [Range(1, int.MaxValue)] public int Revision { get; init; }
}
