// TODO: Integrate this minor change (in fn `get`) into pcic-react-external-text
//  and replace usage of this module with that package again. This module is a
//  temporary expedient for fast dev.

import PropTypes from "prop-types";
import React from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import _ from "lodash";
import addMapDeep from "deepdash/addMapDeep";
import styles from "./external-text.module.css";

addMapDeep(_);

export const ExternalTextContext = React.createContext(null);

export class Provider extends React.Component {
  // Data provider for component `ExternalText`, which accesses this data
  // via the React context API.
  //
  // This component performs two tasks:
  // - loads the source data into this component's state
  // - wraps its children in a React context provider whose value is set
  //   from the source data

  static propTypes = {
    defaultTexts: PropTypes.object,
    // Default, non-asynchronous data source.

    loadTexts: PropTypes.func,
    // Callback for loading data asynchronously.
  };

  state = {
    texts: null,
  };

  setTexts = (texts) => {
    this.setState({ texts });
  };

  componentDidMount() {
    if (!_.isUndefined(this.props.defaultTexts)) {
      this.setTexts(this.props.defaultTexts);
    }
    if (this.props.loadTexts) {
      this.props.loadTexts(this.setTexts);
    }
  }

  render() {
    return (
      <ExternalTextContext.Provider value={this.state.texts}>
        {this.props.children}
      </ExternalTextContext.Provider>
    );
  }
}

// Backticks must be escaped during processing, then unescaped when the
// final string is returned. This is because backtick (which incidentally
// is also important in Markdown) delimits template strings, and template
// strings are the core of the evaluator. Hence `escape` and `unescape`.
// Does not escape an already escaped backtick.

export const escape = (s) =>
  _.map(s, (c, i, t) =>
    c !== "`" || (i > 0 && t[i - 1] === `\\`) ? c : "\\`",
  ).join("");
// This negative lookbehind formulation is tighter, but it lookbehind isn't
// supported (yet) in many browsers. It does work in Node.js and Chrome.
// export const escape = s => s.replace(/(?<!\\)`/g, '\\`');

// And the inverse.
export const unescape = (s) => s.replace(/\\`/g, "`");

export function evaluateAsTemplateLiteral(s, context = {}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)

  // `evaluator` constructs a function that evaluates a template string
  // constructed from the ordinary string passed in (by enclosing it in
  // backticks). The argument(s) of the returned evaluator are the context
  // values.
  const makeEvaluator = (s) =>
    // eslint-disable-next-line no-new-func
    new Function(...Object.keys(context), "return `" + s + "`");

  // `reevaluate` recursively makes and invokes an evaluator for the string.
  // A different string, containing further interpolations (`${...}`), may
  // result from interpolation of other strings into the evaluated string.
  // `reevaluate` stops reevaluating when two successive evaluations return
  // the same string. It also applies backtick escaping at each new evaluation,
  // for the same reason.
  const reevaluate = (prev, curr) => {
    const e = escape(curr);
    return prev === e
      ? e
      : reevaluate(e, makeEvaluator(e)(...Object.values(context)));
  };

  // It's important that `Object.keys(x)` and `Object.values(x)` are guaranteed
  // to return their results in the same order for any given `x`. That order
  // is arbitrary, but it is shared between them.

  // Kick off the evaluation(s), and strip escaping after all is done.
  return unescape(reevaluate("", s));
}

function whenErrorResponse(as, whenError, message) {
  // What to do when an error occurs in `get`.

  if (whenError === "null") {
    return null;
  }
  if (whenError === "throw") {
    throw new Error(message);
  }
  // whenError == 'render'
  if (as === "raw" || as === "string") {
    return message;
  }
  return <div className={styles.externalTextError}>{message}</div>;
}

export function get(
  texts,
  path,
  data = {},
  as = "string",
  whenError = "null", // ??
  // eslint-disable-next-line no-template-curly-in-string
  placeholder = "{{${$path}}}",
  props,
) {
  // This is the core of `ExternalText`.
  //
  // It gets the object selected by `path` from `texts` and maps
  // the function of (optionally) evaluation and rendering as Markdown
  // over all strings in the object's leaf (non-object) members.
  //
  // Argument `as` controls what function (identity, evaluation as a template
  // literal, or evaluation and rendering as Markdown) is applied to each
  // leaf member. The values 'raw', 'string', and 'markdown', respectively,
  // correspond to these mappings.
  //
  // Component `ExternalText` simply invokes this function on its context
  // and props. The simplest case is when `path` selects a single string
  // and it returns a single rendered React element.
  //
  // This function is exposed as a static so that more complicated use can
  // be made of it. This should be done only if there is no simpler way to
  // do it using <ExternalText/> elements. For example, if `'path.to.array'`
  // selects an array of items from `texts`, then prefer this
  //
  // ```
  //  <div>
  //    <ExternalText path='path.to.array' />
  //  </div>
  // ```
  //
  // over this equivalent but unnecessarily complicated code
  //
  // ```
  //  <div>
  //    { ExternalText.get(this.context, 'path.to.array') }
  //  </div>
  // ```

  if (!(texts && _.has(texts, path))) {
    return whenErrorResponse(
      as,
      whenError,
      `Path '${path}' not found in external text.`,
    );
  }

  const render = (value) => {
    try {
      if (as === "raw") {
        return value;
      }
      const source = evaluateAsTemplateLiteral(_.toString(value), {
        $$: texts,
        $path: path,
        ...data,
      });
      if (as === "string") {
        return source;
      }
      return <Markdown rehypePlugins={[rehypeRaw]}>{source}</Markdown>;
    } catch (e) {
      return whenErrorResponse(
        as,
        whenError,
        `Error in external text '${path}': ${e.toString()}.`,
      );
    }
  };

  return _.mapDeep(_.get(texts, path), render, { leavesOnly: true });
}

export default class ExternalText extends React.Component {
  // Core component of external texts module.
  //
  // This component renders an external text (source texts provided through
  // the React context API via `ExternalText.Provider`) selected by `path`,
  // using the data context `data` and rendered according to `as`.
  // See static function `get` for more details.
  //
  // Supporting components and functions are both exported by the module
  // and added as properties of `ExternalText`.

  static propTypes = {
    path: PropTypes.string,
    // Path (JS standard notation) selecting text item from source texts.
    data: PropTypes.object,
    // Data context in which to evaluate item's text.
    as: PropTypes.oneOf(["raw", "string", "markdown"]),
    // How to render the item's text.
    whenError: PropTypes.oneOf(["null", "render", "throw"]),
    // How to handle errors. When 'null' return null. When 'render' render an
    // error message or placeholder.
    placeholder: PropTypes.string,
    // What to render when path is not found in texts and whenError is 'render'
  };

  static defaultProps = {
    as: "markdown",
    whenError: "render",
    // eslint-disable-next-line no-template-curly-in-string
    placeholder: "{{${$path}}}",
  };

  render() {
    const texts = this.context;
    const { path, data, as, whenError, placeholder, ...rest } = this.props;
    return get(texts, path, data, as, whenError, placeholder, rest);
  }
}

ExternalText.contextType = ExternalTextContext;
ExternalText.Provider = Provider;
ExternalText.get = get;
ExternalText.Markdown = Markdown;
