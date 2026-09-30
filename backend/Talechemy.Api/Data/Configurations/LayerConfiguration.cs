using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Data.Configurations;

public sealed class LayerConfiguration : IEntityTypeConfiguration<Layer>
{
    public void Configure(EntityTypeBuilder<Layer> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Width).HasDefaultValue(70);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(120);
        builder.Property(x => x.Kind).IsRequired().HasMaxLength(32);
        builder.HasOne<Panel>().WithMany().HasForeignKey(x => x.PanelId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Asset>().WithMany().HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
