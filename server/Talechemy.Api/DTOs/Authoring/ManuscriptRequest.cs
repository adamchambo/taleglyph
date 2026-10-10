using System.ComponentModel.DataAnnotations;
namespace Talechemy.Api.DTOs.Authoring;
public sealed record ManuscriptRequest([Required] string DocumentJson, string? ExpectedDocumentJson);
