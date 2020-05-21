import React from 'react';
import PropTypes from 'prop-types';
import T from '../../temporary/external-text';
import { Col, Row } from 'react-bootstrap';
import NcwmsColourbar from '../maps/NcwmsColourbar';
import { getVariableInfo } from '../../utils/variables-and-units';
import styles from '../maps/NcwmsColourbar/NcwmsColourbar.module.css';

export default class DevColourbar extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  static propTypes = {
    region: PropTypes.string,
    historicalTimePeriod: PropTypes.object,
    futureTimePeriod: PropTypes.object,
    season: PropTypes.number,
    variable: PropTypes.object,
    metadata: PropTypes.array,
  };

  render() {
    if (!this.props.variable) {
      return null;
    }
    const variableSpec = this.props.variable.representative;
    const variable = variableSpec.variable_id;
    const variableConfig = this.getConfig('variables');
    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <NcwmsColourbar
              breadth={20}
              length={80}
              heading={<T
                path='colourScale.label'
                data={getVariableInfo(variableConfig, variable, 'absolute')}
                placeholder={null}
                className={styles.label}
              />}
              note={<T
                path={'colourScale.note'}
                placeholder={null}
                className={styles.note}
              />}
              variableSpec={variableSpec}
              displaySpec={this.getConfig('maps.displaySpec')}
            />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div>Other stuff</div>
          </Col>
        </Row>

        {/*<Row>*/}
        {/*  <Col lg={12}>*/}
        {/*    <NcwmsColourbar*/}
        {/*      breadth={20}*/}
        {/*      length={80}*/}
        {/*      heading={<T*/}
        {/*        path='colourScale.label'*/}
        {/*        data={getVariableInfo(variableConfig, variable, 'absolute')}*/}
        {/*        placeholder={null}*/}
        {/*        className={styles.label}*/}
        {/*      />}*/}
        {/*      note={<T*/}
        {/*        path={'colourScale.note'}*/}
        {/*        placeholder={null}*/}
        {/*        className={styles.note}*/}
        {/*      />}*/}
        {/*      variableSpec={variableSpec}*/}
        {/*      displaySpec={this.getConfig('maps.displaySpec')}*/}
        {/*    />*/}
        {/*  </Col>*/}
        {/*</Row>*/}
      </React.Fragment>
    );
  }
}