namespace Talechemy.Api.Models.Exploration;

public sealed class Experiment
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Prompt { get; set; } = "";
    public string Kind { get; set; } = "";
}
