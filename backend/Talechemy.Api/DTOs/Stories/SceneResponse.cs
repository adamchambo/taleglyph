namespace Talechemy.Api.DTOs.Stories;

public sealed record SceneResponse(Guid Id, Guid ChapterId, string Title, string Prose, int Order, int Revision);
