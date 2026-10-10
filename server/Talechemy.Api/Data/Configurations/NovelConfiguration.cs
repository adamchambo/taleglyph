using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;

namespace Talechemy.Api.Data.Configurations;

public sealed class NovelConfiguration : IEntityTypeConfiguration<Novel>
{
    public void Configure(EntityTypeBuilder<Novel> builder)
    {
        builder.Property(x => x.ManuscriptJson).IsConcurrencyToken();
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Title).IsRequired().HasMaxLength(120);
        builder.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.HasOne<World>().WithMany().HasForeignKey(x => x.WorldId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Asset>().WithMany().HasForeignKey(x => x.CoverAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
