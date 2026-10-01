using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Data;

public sealed class TalechemyDbContext(DbContextOptions<TalechemyDbContext> options) : DbContext(options)
{
    public DbSet<PageTemplate> PageTemplates => Set<PageTemplate>();
    public DbSet<Panel> Panels => Set<Panel>();
    public DbSet<Comic> Comics => Set<Comic>();
    public DbSet<ComicPage> ComicPages => Set<ComicPage>();
    public DbSet<Layer> Layers => Set<Layer>();
    public DbSet<World> Worlds => Set<World>();
    public DbSet<LoreEntry> LoreEntries => Set<LoreEntry>();
    public DbSet<Relationship> Relationships => Set<Relationship>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Character> Characters => Set<Character>();
    public DbSet<Experiment> Experiments => Set<Experiment>();
    public DbSet<Scene> Scenes => Set<Scene>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<Novel> Novels => Set<Novel>();
    public DbSet<Arc> Arcs => Set<Arc>();
    public DbSet<Link> Links => Set<Link>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<AdaptationLink> AdaptationLinks => Set<AdaptationLink>();
    public DbSet<AssetVersion> AssetVersions => Set<AssetVersion>();
    public DbSet<Asset> Assets => Set<Asset>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TalechemyDbContext).Assembly);
    }
}
