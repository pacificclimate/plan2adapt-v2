import React from 'react';
import T from '../../temporary/external-text';


export default class NotesTabBody extends React.Component {
  static contextType = T.contextType;

  render() {
    throw new Error('Test exception in Notes tab')
    return <T path='notes.content'/>;
  }
}
