using Talechemy.Api.Services;
using Xunit;

namespace Talechemy.Tests;

public class LinkRulesTests
{
    private static readonly Guid Space = Guid.NewGuid();

    [Theory]
    [InlineData("novel", "story")]
    [InlineData("comic", "arc")]
    [InlineData("note", "story")]
    public void AllowsWorksAndNotesToPointAtStoriesAndArcs(string from, string to) =>
        Assert.Null(LinkRules.Check(from, Space, to, Space));

    [Theory]
    [InlineData("story", "novel")]
    [InlineData("novel", "novel")]
    [InlineData("chapter", "story")]
    public void RejectsUnsupportedDirections(string from, string to) =>
        Assert.Equal(400, LinkRules.Check(from, Space, to, Space)?.Status);

    [Fact]
    public void RejectsLinksAcrossSpaces() =>
        Assert.Equal(400, LinkRules.Check("novel", Space, "story", Guid.NewGuid())?.Status);

    [Fact]
    public void ReportsMissingEndAsNotFound() =>
        Assert.Equal(404, LinkRules.Check("novel", Space, "arc", null)?.Status);
}
