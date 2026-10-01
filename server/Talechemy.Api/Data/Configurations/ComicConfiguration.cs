using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
namespace Talechemy.Api.Data.Configurations;

public sealed class ComicConfiguration : IEntityTypeConfiguration<Comic>
{
    public void Configure(EntityTypeBuilder<Comic> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Title).IsRequired().HasMaxLength(120);
        builder.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.HasOne<World>().WithMany().HasForeignKey(x => x.WorldId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Asset>().WithMany().HasForeignKey(x => x.CoverAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
