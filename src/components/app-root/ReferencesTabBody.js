import React from 'react';
import T from '../../temporary/external-text';


export default class ReferencesTabBody extends React.Component {
  static contextType = T.contextType;

  render() {
    return <T path='references.content'/>;
  }
}
