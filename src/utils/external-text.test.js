import React from "react";
import renderer from "react-test-renderer";
import each from "jest-each";

import ExternalText, {
  evaluateTemplateLiteral,
  setTexts
} from "./external-text";

describe("evaluateTemplateLiteral", () => {
  it("works without interpolation", () => {
    expect(evaluateTemplateLiteral("Hello")).toBe("Hello");
  });

  it("works with simple interpolation", () => {
    expect(evaluateTemplateLiteral("Hello, ${name}", { name: "world" })).toBe(
      "Hello, world"
    );
  });

  it("works with complex interpolation", () => {
    expect(
      evaluateTemplateLiteral(
        "${greeting}, ${name}. ${values.x} + ${values.y} = ${ values.x + values.y }",
        {
          greeting: "Bonjour",
          name: "world",
          values: { x: 5, y: 3 }
        }
      )
    ).toBe("Bonjour, world. 5 + 3 = 8");
  });
});

describe("ExternalText", () => {
  beforeAll(() => {
    setTexts({
      greeting: "Hello, ${name}",
      heading1: "# Heading 1",
      heading2: "## Heading 2",
      heading3: "### Heading 3",
      composite: `
# Impressive Title

An introductory remark.

## First subtopic

First content.

## Second subtopic

Second content.
      `
    });
  });

  it("renders the key when no such item exists", () => {
    const tree = renderer.create(<ExternalText item={"foo"} />).toJSON();
    expect(tree).toMatchInlineSnapshot(`
<p>
  {{foo}}
</p>
`);
  });

  it("handles a simple case", () => {
    const tree = renderer
      .create(<ExternalText item={"greeting"} context={{ name: "world" }} />)
      .toJSON();
    expect(tree).toMatchInlineSnapshot(`
<p>
  Hello, world
</p>
`);
  });

  each([[1], [2], [3]]).it("handles heading level %d", level => {
    const tree = renderer
      .create(<ExternalText item={`heading${level}`} />)
      .toJSON();
    expect(tree.type).toBe(`h${level}`);
    expect(tree.children).toEqual([`Heading ${level}`]);
  });

  it("handles a composite MD case", () => {
    const tree = renderer.create(<ExternalText item={"composite"} />).toJSON();
    expect(tree).toMatchInlineSnapshot(`
Array [
  <h1>
    Impressive Title
  </h1>,
  <p>
    An introductory remark.
  </p>,
  <h2>
    First subtopic
  </h2>,
  <p>
    First content.
  </p>,
  <h2>
    Second subtopic
  </h2>,
  <p>
    Second content.
      
  </p>,
]
`);
  });

  it("re-renders when texts are changed", () => {
    const context = { name: "world" };

    const component = renderer.create(
      <ExternalText item={"greeting"} context={context} />
    );
    const tree1 = component.toJSON();
    expect(tree1).toMatchInlineSnapshot(`
<p>
  Hello, world
</p>
`);

    setTexts({ greeting: "Bonjour, ${name}" });

    const tree2 = component.toJSON();
    expect(tree2).toMatchInlineSnapshot(`
<p>
  Bonjour, world
</p>
`);
  });
});
