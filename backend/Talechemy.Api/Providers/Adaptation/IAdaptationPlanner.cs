using Talechemy.Api.Models.Stories;
using Talechemy.Api.DTOs.Comics;
namespace Talechemy.Api.Providers.Adaptation;

public sealed record PlannedPage(Scene Source, PanelDraft[] Panels);
// Future AI planners receive explicit source context and return a proposal; persistence stays in the service.
public interface IAdaptationPlanner
{
    string Name { get; }
    Task<IReadOnlyList<PlannedPage>> Plan(IReadOnlyList<Scene> scenes, PanelDraft[] template, CancellationToken ct);
}
public sealed class ManualAdaptationPlanner : IAdaptationPlanner
{
    public string Name => "manual-v1";
    public Task<IReadOnlyList<PlannedPage>> Plan(IReadOnlyList<Scene> scenes, PanelDraft[] template, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult<IReadOnlyList<PlannedPage>>(scenes.Select(scene => new PlannedPage(scene, template)).ToArray());
    }
}
