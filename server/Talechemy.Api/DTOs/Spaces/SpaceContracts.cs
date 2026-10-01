using System.ComponentModel.DataAnnotations;
using Talechemy.Api.Validation;
namespace Talechemy.Api.DTOs.Spaces;

public sealed record WorkCard(Guid Id, string Kind, Guid SpaceId, string Title, Guid? CoverAssetId, DateTimeOffset UpdatedAt, int PartCount);
public sealed record SpaceWorks(IReadOnlyList<WorkCard> Novels, IReadOnlyList<WorkCard> Comics);
public sealed record ArcResponse(Guid Id, Guid StoryId, string Title, string Summary, int Order);
public sealed record LinkResponse(Guid Id, string FromKind, Guid FromId, string ToKind, Guid ToId);
public sealed record NoteCard(Guid Id, Guid SpaceId, string Title, string Content, DateTimeOffset UpdatedAt);

public sealed class SpaceUpdateRequest
{
    [Required, StringLength(120)] public string Name { get; init; } = "";
    [StringLength(4000)] public string Description { get; init; } = "";
    public Guid? CoverAssetId { get; init; }
}
public sealed class WorkUpdateRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    public Guid? CoverAssetId { get; init; }
}
public sealed class ArcRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [StringLength(4000)] public string Summary { get; init; } = "";
}
public sealed class ArcOrderRequest
{
    [Required, MinLength(1), MaxLength(200)] public Guid[] ArcIds { get; init; } = [];
}
public sealed class LinkRequest
{
    [Required, StringLength(16)] public string FromKind { get; init; } = "";
    [NonEmptyGuid] public Guid FromId { get; init; }
    [Required, StringLength(16)] public string ToKind { get; init; } = "";
    [NonEmptyGuid] public Guid ToId { get; init; }
}
public sealed class NoteRequest
{
    [Required, StringLength(120)] public string Title { get; init; } = "";
    [StringLength(20000)] public string Content { get; init; } = "";
}
