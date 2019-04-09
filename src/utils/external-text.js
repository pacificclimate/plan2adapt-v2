import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { get } from 'lodash/fp';


export const ExternalTextContext = React.createContext(
  null
);


export class Provider extends React.Component {
  static propTypes = {
    texts: PropTypes.object,
    loadTexts: PropTypes.func,
  };

  state = {
    texts: null,
  };

  setTexts = texts => {
    this.setState({ texts });
  };

  componentDidMount() {
    this.setTexts(this.props.texts);
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


export function evaluateAsTemplateLiteral(s, context={}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)
  const evaluator = t => new Function(...Object.keys(context), 'return `' + t + '`');
  const reevaluate = (prev, curr) =>
    prev === curr ? curr : reevaluate(curr, evaluator(curr)(...Object.values(context)))
  return reevaluate('', s);
}


class ExternalText extends React.Component {
  static propTypes = {
    item: PropTypes.string,
    context: PropTypes.object,  // Context in which to evaluate item's text.
    as: PropTypes.oneOf('raw string markup'.split()).isRequired,
  };

  static defaultProps = {
    as: 'markup',
  };

  render() {
    const texts = this.context;
    const { as, item, context } = this.props;

    const text = (texts && get(item, texts)) || `{{${item}}}`;
    if (as === 'raw') {
      return text;
    }

    const source = evaluateAsTemplateLiteral(text, { $$: texts, ...context});
    if (as === 'string') {
      return source;
    }

    return (
      <ReactMarkdown source={source}/>
    );
  }
}
ExternalText.contextType = ExternalTextContext;
ExternalText.Provider = Provider;


export default ExternalText;