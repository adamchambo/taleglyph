using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Stories;
namespace Talechemy.Api.Data.Configurations;

public sealed class StoryConfiguration : IEntityTypeConfiguration<Story>
{
    public void Configure(EntityTypeBuilder<Story> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Tags).HasColumnType("text[]");
        builder.Property(x => x.Revision).HasDefaultValue(1).IsConcurrencyToken();
        builder.Property(x => x.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Title).IsRequired().HasMaxLength(120);
        builder.Property(x => x.Synopsis).IsRequired();
        builder.HasOne<World>().WithMany().HasForeignKey(x => x.WorldId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Asset>().WithMany().HasForeignKey(x => x.CoverAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.WorldId, x.Order }).IsUnique();
    }
}
