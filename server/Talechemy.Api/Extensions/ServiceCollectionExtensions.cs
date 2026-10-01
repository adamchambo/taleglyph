using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Providers.AI;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Repositories;
using Talechemy.Api.Services;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTalechemy(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("Talechemy")
            ?? throw new InvalidOperationException("Configure ConnectionStrings:Talechemy using user secrets or the ConnectionStrings__Talechemy environment variable.");
        services.AddDbContext<TalechemyDbContext>(options => options.UseNpgsql(connection));
        services.AddScoped<IWorldRepository, WorldRepository>();
        services.AddScoped<IStoryRepository, StoryRepository>();
        services.AddScoped<IComicRepository, ComicRepository>();
        services.AddScoped<IAssetRepository, AssetRepository>();
        services.AddSingleton<IAiProvider, SampleAiProvider>();
        services.AddScoped<IWorldService, WorldService>();
        services.AddScoped<IStoryService, StoryService>();
        services.AddScoped<IComicService, ComicService>();
        services.AddScoped<IAssetService, AssetService>();
        services.AddScoped<IExplorationService, ExplorationService>();
        services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
        services.AddScoped<AuthoringService>();
        services.AddScoped<AdaptationService>();
        services.AddScoped<AssetUploadService>();
        services.AddSingleton<Talechemy.Api.Providers.Adaptation.IAdaptationPlanner, Talechemy.Api.Providers.Adaptation.ManualAdaptationPlanner>();
        services.AddScoped<ILibraryRepository, LibraryRepository>();
        services.AddScoped<LibraryService>();
        services.AddScoped<ISpaceRepository, SpaceRepository>();
        services.AddScoped<SpaceService>();
        return services;
    }
}
