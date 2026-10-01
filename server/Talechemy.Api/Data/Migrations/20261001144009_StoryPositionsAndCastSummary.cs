using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class StoryPositionsAndCastSummary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Stories_WorldId",
                table: "Stories");

            migrationBuilder.AddColumn<string>(
                name: "CastSummary",
                table: "Worlds",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Stories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                WITH ranked AS (
                    SELECT "Id", ROW_NUMBER() OVER (PARTITION BY "WorldId" ORDER BY "UpdatedAt" DESC, "Id") AS n
                    FROM "Stories"
                )
                UPDATE "Stories" AS s SET "Order" = ranked.n FROM ranked WHERE s."Id" = ranked."Id";
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Stories_WorldId_Order",
                table: "Stories",
                columns: new[] { "WorldId", "Order" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Stories_WorldId_Order",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "CastSummary",
                table: "Worlds");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "Stories");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_WorldId",
                table: "Stories",
                column: "WorldId");
        }
    }
}
