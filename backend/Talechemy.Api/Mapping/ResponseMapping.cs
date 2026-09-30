using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.DTOs.Worlds;
using Talechemy.Api.DTOs.Characters;
using Talechemy.Api.DTOs.Locations;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.DTOs.Comics;
using Talechemy.Api.DTOs.Assets;
namespace Talechemy.Api.Mapping;

public static class ResponseMapping
{
    public static WorldResponse ToResponse(this World value) => new(value.Id, value.Name, value.Description, value.Theme);
    public static LoreEntryResponse ToResponse(this LoreEntry value) => new(value.Id, value.WorldId, value.Title, value.Content, value.CanonStatus);
    public static RelationshipResponse ToResponse(this Relationship value) => new(value.Id, value.WorldId, value.FromCharacterId, value.ToCharacterId, value.Kind, value.Description);
    public static NoteResponse ToResponse(this Note value) => new(value.Id, value.WorldId, value.Title, value.Content);
    public static CharacterResponse ToResponse(this Character value) => new(value.Id, value.WorldId, value.Name, value.Role, value.Description, value.Motivation, value.CanonStatus);
    public static LocationResponse ToResponse(this Location value) => new(value.Id, value.WorldId, value.Name, value.Description);
    public static StoryResponse ToResponse(this Story value) => new(value.Id, value.WorldId, value.Title, value.Synopsis);
    public static ChapterResponse ToResponse(this Chapter value) => new(value.Id, value.StoryId, value.Title, value.Order);
    public static SceneResponse ToResponse(this Scene value) => new(value.Id, value.ChapterId, value.Title, value.Prose, value.Order, value.Revision);
    public static AdaptationLinkResponse ToResponse(this AdaptationLink value) => new(value.Id, value.SceneId, value.ComicPageId, value.Notes);
    public static ComicResponse ToResponse(this Comic value) => new(value.Id, value.StoryId, value.Title);
    public static ComicPageResponse ToResponse(this ComicPage value) => new(value.Id, value.ComicId, value.Number, value.Layout);
    public static PanelResponse ToResponse(this Panel value) => new(value.Id, value.PageId, value.Title, value.Order);
    public static LayerResponse ToResponse(this Layer value) => new(value.Id, value.PanelId, value.Name, value.Kind, value.X, value.Y, value.Visible, value.Locked, value.AssetId, value.Text);
    public static AssetResponse ToResponse(this Asset value) => new(value.Id, value.WorldId, value.Name, value.Kind, value.Description, value.ImageFileName is null ? null : $"/api/assets/{value.Id}/image");
    public static AssetVersionResponse ToResponse(this AssetVersion value) => new(value.Id, value.AssetId, value.Version, value.Source, value.Prompt);
}
