using System.ComponentModel.DataAnnotations;
using Talechemy.Api.Validation;
namespace Talechemy.Api.DTOs.Library;
public sealed record SpaceCard(Guid Id, string Name, string Description, Guid? CoverAssetId, int StoryCount, int NovelCount,
    int ComicCount, int CharacterCount, int AssetCount, int NoteCount);
public sealed record StoryCard(Guid Id, Guid SpaceId, string SpaceName, string Title, string Overview, string[] Tags,
    DateTimeOffset UpdatedAt, int Revision, int ArcCount);
public sealed record LibrarySnapshot(IReadOnlyList<SpaceCard> Spaces, IReadOnlyList<StoryCard> Stories);
public sealed class StorySetupRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [StringLength(4000)] public string Overview { get; init; } = "";
    [NonEmptyGuid] public Guid SpaceId { get; init; }
    [Required, MaxLength(12)] public string[] Tags { get; init; } = [];
    [Range(1, int.MaxValue)] public int Revision { get; init; } = 1;
}
public sealed record LibraryRouteContext(Guid SpaceId);
