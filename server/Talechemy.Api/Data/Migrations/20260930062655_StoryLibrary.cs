using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class StoryLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CoverAssetId",
                table: "Stories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Revision",
                table: "Stories",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<Guid>(
                name: "SeriesId",
                table: "Stories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StartingSection",
                table: "Stories",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "overview");

            migrationBuilder.AddColumn<string[]>(
                name: "Tags",
                table: "Stories",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedAt",
                table: "Stories",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.CreateTable(
                name: "Series",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorldId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Series", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Series_Worlds_WorldId",
                        column: x => x.WorldId,
                        principalTable: "Worlds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stories_CoverAssetId",
                table: "Stories",
                column: "CoverAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_SeriesId",
                table: "Stories",
                column: "SeriesId");

            migrationBuilder.CreateIndex(
                name: "IX_Series_WorldId",
                table: "Series",
                column: "WorldId");

            migrationBuilder.AddForeignKey(
                name: "FK_Stories_Assets_CoverAssetId",
                table: "Stories",
                column: "CoverAssetId",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Stories_Series_SeriesId",
                table: "Stories",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stories_Assets_CoverAssetId",
                table: "Stories");

            migrationBuilder.DropForeignKey(
                name: "FK_Stories_Series_SeriesId",
                table: "Stories");

            migrationBuilder.DropTable(
                name: "Series");

            migrationBuilder.DropIndex(
                name: "IX_Stories_CoverAssetId",
                table: "Stories");

            migrationBuilder.DropIndex(
                name: "IX_Stories_SeriesId",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "CoverAssetId",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "StartingSection",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Stories");
        }
    }
}
