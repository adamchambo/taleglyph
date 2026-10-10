using Talechemy.Api.Services;
using Xunit;

namespace Talechemy.Tests;

public class ManuscriptValidationTests
{
    private static string Doc(string blocks) => $$"""{"type":"doc","content":[{{blocks}}]}""";
    private const string Chapter = """{"type":"heading","attrs":{"level":2,"id":"a","summary":"","sourceArcId":null,"textAlign":"center"},"content":[{"type":"text","text":"One"}]}""";

    [Fact]
    public void AcceptsRichDocument()
    {
        var json = Doc(Chapter + """
            ,
            {"type":"paragraph","attrs":{"textAlign":"justify"},"content":[
              {"type":"text","text":"Hi","marks":[{"type":"bold"},{"type":"italic"},{"type":"underline"},{"type":"strike"}]},
              {"type":"hardBreak","marks":[{"type":"bold"}]}]},
            {"type":"paragraph","attrs":{"textAlign":null}},
            {"type":"horizontalRule"},
            {"type":"pageBreak"},
            {"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"Quote"}]}]},
            {"type":"bulletList","content":[{"type":"listItem","content":[
              {"type":"paragraph","content":[{"type":"text","text":"one"}]},
              {"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph"}]}]}]}]}
            """);
        ManuscriptValidation.Validate(json);
    }

    [Theory]
    [InlineData("""{"type":"codeBlock","content":[{"type":"text","text":"x"}]}""")]
    [InlineData("""{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"image"}]}]}""")]
    [InlineData("""{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":"link"}]}]}""")]
    [InlineData("""{"type":"paragraph","attrs":{"textAlign":"start"}}""")]
    [InlineData("""{"type":"blockquote","content":[{"type":"heading","attrs":{"level":2,"id":"n","summary":""}}]}""")]
    [InlineData("""{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph"}]},{"type":"paragraph"}]}""")]
    [InlineData("""{"type":"horizontalRule","content":[]}""")]
    [InlineData("""{"type":"bulletList","content":[]}""")]
    public void RejectsUnknownOrMisplacedNodes(string block)
    {
        var ex = Assert.Throws<WorkflowException>(() => ManuscriptValidation.Validate(Doc(block)));
        Assert.Equal(400, ex.Status);
    }

    [Fact]
    public void RejectsDuplicateHeadingIds()
    {
        Assert.Throws<WorkflowException>(() => ManuscriptValidation.Validate(Doc($"{Chapter},{Chapter}")));
    }
}
