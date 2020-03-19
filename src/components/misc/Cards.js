import React from 'react';
import Card from 'react-bootstrap/Card';
import T from 'pcic-react-external-text';
import isArray from 'lodash/fp/isArray';
import map from 'lodash/fp/map';
import CardGroup from 'react-bootstrap/CardGroup';
import CardColumns from 'react-bootstrap/CardColumns';

export function Item({ header, body }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>{header}</Card.Title>
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
  return (
    <CardGroup>
      { map(item => <Item {...item}/>)(items) }
    </CardGroup>
  );
  return map(item => <Item {...item}/>)(items);
}

Cards.Item = Item;
