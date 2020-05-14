import PropTypes from 'prop-types';
import React from 'react';
import { Accordion, Card, CardGroup, Button } from 'react-bootstrap';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import sortBy from 'lodash/fp/sortBy';
import uniq from 'lodash/fp/uniq';
import toPairs from 'lodash/fp/toPairs';
import ReactMarkdown from 'react-markdown';
import ImpactIcon from '../ImpactIcon';
import './Impacts.css';


export default class Impacts extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    region: PropTypes.object.isRequired,
    futureTimePeriod: PropTypes.object.isRequired,
    ruleValues: PropTypes.object.isRequired,
    groupKey: PropTypes.string.isRequired,
    itemKey: PropTypes.string.isRequired,
    groupHeading: PropTypes.element.isRequired,
    itemsHeading: PropTypes.element.isRequired,
  };

  render() {
    const rulesByGroupKey = flow(
      groupBy(rule => rule[this.props.groupKey]),
      mapValues(sortBy(this.props.itemKey))
    )(this.props.rulebase);

    const activeItemsByGroupKey =
      mapValues(
        // Values are rules with given groupKey (e.g., 'category')
        flow(
          // Pass only active rules
          filter(rule => this.props.ruleValues[rule.id]),
          // Map to items selected by itemKey (e.g., 'sector')
          map(rule => rule[this.props.itemKey]),
          // There may be repetitions in items
          uniq,
        )
      )(rulesByGroupKey);

    const sortedActiveItemsByGroupKey = flow(
      toPairs,
      sortBy(([key, items]) => key)
    )(activeItemsByGroupKey);

    return (
      <CardGroup className='Impacts-table'>
        <Accordion>
          <Card>
            <Accordion.Toggle as={Card.Body} eventKey={'none'} className='clearfix'>
              <div className='float-left mr-5'>{this.props.groupHeading}</div>
              <div className='float-right'>{this.props.itemsHeading}</div>
            </Accordion.Toggle>
          </Card>

          {
            map(([key, items]) => (
              key.length > 0 && items.length > 0 &&
                  <Card>
                    <Accordion.Toggle as={Button} variant={'outline-primary'} eventKey={key} className='clearfix'>
                      <div className='float-left mr-5'>
                        <ImpactIcon kind={this.props.groupKey} icon={key}/>
                        {key}
                      </div>
                      <div className='float-right'>
                        {
                          map(item => (
                            <ImpactIcon kind={this.props.itemKey} icon={item}/>
                          ))(items)
                        }
                      </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={key}>
                      <Card.Body className='details p-2'>
                        {
                          map(rule => (
                            <Card className='mb-1'>
                              <Card.Header>
                                <ImpactIcon
                                  kind={this.props.itemKey}
                                  icon={rule[this.props.itemKey]}
                                />
                                {rule.effects} ({rule.id})
                              </Card.Header>
                              <Card.Body>
                                <ReactMarkdown source={rule.notes} escapeHtml={false}/>
                              </Card.Body>
                            </Card>
                          ))(rulesByGroupKey[key])
                        }
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
            ))(sortedActiveItemsByGroupKey)
          }
        </Accordion>
      </CardGroup>
      );
  }
}
