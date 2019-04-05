import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';

// Global variable that holds all current texts.
let texts = null;


export const setTexts = t => {
  texts = t;
};


export function evaluateTemplateLiteral(s, context={}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)
  const evaluator = new Function(...Object.keys(context), 'return `' + s + '`');
  return evaluator(...Object.values(context));
}


export default class ExternalText extends React.Component {
  static propTypes = {
    item: PropTypes.string,
    context: PropTypes.object,
  };

  render() {
    const text = (texts && texts[this.props.item]) || `{{${this.props.item}}}`;
    const source = evaluateTemplateLiteral(text, this.props.context);
    return (
      <ReactMarkdown source={source}/>
    );
  }
}

// export {
//   setTexts,
//   ExternalText as default,
// };
