import React from 'react';
import Card from 'react-bootstrap/Card';
import T from '../../temporary/external-text';
import isArray from 'lodash/fp/isArray';
import map from 'lodash/fp/map';
import CardColumns from 'react-bootstrap/CardColumns';

export function Item({ header, title, body, bg, border, text }) {
  return (
    <Card bg={bg} border={border} text={text}>
      {header && <Card.Header><T.Markdown source={header}/></Card.Header>}
      <Card.Body>
        {title && <Card.Title><T.Markdown source={title}/></Card.Title>}
        <Card.Text>
          <T.Markdown source={body}/>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default function Cards({ items }) {
  if (!isArray(items)) {
    return null;
  }
  return (
    <CardColumns>
      { map(item => <Item {...item}/>)(items) }
    </CardColumns>
  );
}

Cards.Item = Item;
