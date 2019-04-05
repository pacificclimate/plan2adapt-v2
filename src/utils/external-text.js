import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';

// Global variable that holds all current texts.
let _texts = null;


export const setTexts = texts => {
  _texts = texts;
  console.log('setTexts', _texts);
};


// HOC that injects `texts` into props of `WrappedComponent`.
const withTexts = WrappedComponent => (
  props => (
    <WrappedComponent texts={_texts} {...props}/>
  )
);


export function evaluateTemplateLiteral(s, context={}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)
  const evaluator = new Function(...Object.keys(context), 'return `' + s + '`');
  return evaluator(...Object.values(context));
}


class MarkdownText extends React.Component {
  static propTypes = {
    texts: PropTypes.object,
    item: PropTypes.string,
    context: PropTypes.object,
  };

  render() {
    const { texts, item, context } = this.props;
    const text = (texts && texts[item]) || `{{${item}}}`;
    const source = evaluateTemplateLiteral(text, context);
    return (
      <ReactMarkdown source={source}/>
    );
  }
}


const ExternalText = withTexts(MarkdownText);
ExternalText.setTexts = setTexts;

export default ExternalText;

