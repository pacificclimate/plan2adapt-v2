import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';


export const ExternalTextsContext = React.createContext(
  null
);


export class WithExternalTexts extends React.Component {
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
      <ExternalTextsContext.Provider value={this.state.texts}>
        {this.props.children}
      </ExternalTextsContext.Provider>
    );
  }
}


export function evaluateAsTemplateLiteral(s, context={}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)
  const evaluator = new Function(...Object.keys(context), 'return `' + s + '`');
  return evaluator(...Object.values(context));
}


class ExternalText extends React.Component {
  static propTypes = {
    item: PropTypes.string,
    context: PropTypes.object,  // Context in which to evaluate item's text.
  };

  render() {
    const texts = this.context;
    const { item, context } = this.props;
    const text = (texts && texts[item]) || `{{${item}}}`;
    const source = evaluateAsTemplateLiteral(text, context);
    return (
      <ReactMarkdown source={source}/>
    );
  }
}
ExternalText.contextType = ExternalTextsContext;

export default ExternalText;