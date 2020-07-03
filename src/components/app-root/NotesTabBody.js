import React from 'react';
import T from '../../temporary/external-text';


export default class NotesTabBody extends React.PureComponent {
  static contextType = T.contextType;

  render() {
    return <T path='tabs.notes.content'/>;
  }
}
