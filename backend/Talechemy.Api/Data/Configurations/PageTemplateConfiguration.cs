using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.World;
namespace Talechemy.Api.Data.Configurations;

public sealed class PageTemplateConfiguration : IEntityTypeConfiguration<PageTemplate>
{
    public void Configure(EntityTypeBuilder<PageTemplate> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.Name).HasMaxLength(120).IsRequired();
        b.Property(x => x.ContentJson).HasColumnType("jsonb").IsRequired();
        b.HasOne<World>().WithMany().HasForeignKey(x => x.WorldId).OnDelete(DeleteBehavior.Restrict);
    }
}
