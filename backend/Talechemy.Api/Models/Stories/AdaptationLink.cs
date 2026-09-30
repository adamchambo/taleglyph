namespace Talechemy.Api.Models.Stories;

public sealed class AdaptationLink
{
    public Guid Id { get; set; }
    public Guid SceneId { get; set; }
    public Guid ComicPageId { get; set; }
    public string Notes { get; set; } = "";
    public int SourceRevision { get; set; }
    public int ReviewedRevision { get; set; }
    public string SourceTitle { get; set; } = "";
    public string SourceProse { get; set; } = "";
    public string Planner { get; set; } = "manual-v1";
}
