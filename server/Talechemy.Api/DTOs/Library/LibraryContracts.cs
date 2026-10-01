using System.ComponentModel.DataAnnotations;
namespace Talechemy.Api.DTOs.Library;
public sealed record SpaceSummary(Guid Id, string Name, string Description);
public sealed record SeriesSummary(Guid Id, Guid SpaceId, string Name);
public sealed record StoryCard(Guid Id, Guid SpaceId, string SpaceName, string Title, string Overview, string[] Tags,
    Guid? SeriesId, string? SeriesName, Guid? CoverAssetId, DateTimeOffset UpdatedAt, string StartingSection, int Revision,
    int ChapterCount, int ComicCount, int CharacterCount, int AssetCount);
public sealed record LibrarySnapshot(IReadOnlyList<StoryCard> Stories, IReadOnlyList<SpaceSummary> Spaces, IReadOnlyList<SeriesSummary> Series);
public sealed class StorySetupRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [StringLength(4000)] public string Overview { get; init; } = "";
    public Guid? SpaceId { get; init; }
    [StringLength(120)] public string? NewSpaceName { get; init; }
    [Required, MaxLength(12)] public string[] Tags { get; init; } = [];
    [Required, RegularExpression("^(overview|notes|characters|world|plan|novel|comic|assets)$")]
    public string StartingSection { get; init; } = "overview";
    public Guid? CoverAssetId { get; init; }
    public Guid? SeriesId { get; init; }
    [Range(1, int.MaxValue)] public int Revision { get; init; } = 1;
}
public sealed class SeriesSetupRequest
{
    public Guid SpaceId { get; init; }
    [Required, StringLength(120)] public string Name { get; init; } = "";
}
public sealed record LibraryRouteContext(Guid StoryId, Guid SpaceId);
