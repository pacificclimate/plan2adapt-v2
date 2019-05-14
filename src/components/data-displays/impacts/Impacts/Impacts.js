import PropTypes from 'prop-types';
import React from 'react';
import { Table, Accordion, Card } from 'react-bootstrap';
import { filter, flow, groupBy, map, mapValues, sortBy, uniq, toPairs, join } from 'lodash/fp';
import ReactMarkdown from 'react-markdown';
import ImpactIcon from '../ImpactIcon';
import './Impacts.css';


const sort = sortBy(x => x);


export default class Impacts extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    ruleValues: PropTypes.object.isRequired,
    groupKey: PropTypes.string.isRequired,
    itemKey: PropTypes.string.isRequired,
    groupHeading: PropTypes.element.isRequired,
    itemsHeading: PropTypes.element.isRequired,
  };

  render() {
    const rulesByGroupKey =
      groupBy(rule => rule[this.props.groupKey])(this.props.rulebase);

    const activeItemsByGroupKey =
      mapValues(
        flow(
          filter(rule => this.props.ruleValues[rule.id]),
          map(rule => rule[this.props.itemKey]),
          uniq,
          sort,
        )
      )(rulesByGroupKey);

    const sortedActiveItemsByGroupKey = flow(
      toPairs,
      sortBy(([category, sectors]) => category)
    )(activeItemsByGroupKey);

    return (
      <Table bordered hover className='Impacts-table'>
        <Accordion>
        <thead>
        <tr>
          <th>{this.props.groupHeading}</th>
          <th>{this.props.itemsHeading}</th>
        </tr>
        </thead>
        <tbody>
          {
            map(([key, items]) => (
              key.length > 0 && items.length > 0 &&
              <tr>
                <td>
                  <Card>
                    <Accordion.Toggle as={Card.Header} eventKey={key}>
                      <div>
                        <ImpactIcon kind={this.props.groupKey} icon={key}/>
                        {key}
                      </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={key}>
                      <Card.Body className='details'>
                        {
                          map(rule => (
                            <div>
                              ({rule.id})
                              <h3>
                                <ImpactIcon
                                  kind={this.props.itemKey}
                                  icon={rule[this.props.itemKey]}
                                />
                                {rule.effects}
                              </h3>
                              <ReactMarkdown source={rule.notes} escapeHtml={false}/>
                            </div>
                          ))(rulesByGroupKey[key])
                        }
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </td>
                <td>
                  {
                    map(item => (
                      <ImpactIcon kind={this.props.itemKey} icon={item}/>
                    ))(items)
                  }
                </td>
              </tr>
            ))(sortedActiveItemsByGroupKey)
          }
        </tbody>
        </Accordion>
      </Table>
    );
  }
}
