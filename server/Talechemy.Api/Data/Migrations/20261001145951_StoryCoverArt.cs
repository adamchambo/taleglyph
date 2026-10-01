using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class StoryCoverArt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CoverAssetId",
                table: "Stories",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stories_CoverAssetId",
                table: "Stories",
                column: "CoverAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Stories_Assets_CoverAssetId",
                table: "Stories",
                column: "CoverAssetId",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stories_Assets_CoverAssetId",
                table: "Stories");

            migrationBuilder.DropIndex(
                name: "IX_Stories_CoverAssetId",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "CoverAssetId",
                table: "Stories");
        }
    }
}
