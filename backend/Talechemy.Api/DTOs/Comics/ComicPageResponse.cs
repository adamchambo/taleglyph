namespace Talechemy.Api.DTOs.Comics;

public sealed record ComicPageResponse(Guid Id, Guid ComicId, int Number, string Layout);
