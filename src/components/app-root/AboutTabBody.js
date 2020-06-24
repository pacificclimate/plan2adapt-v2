import React from 'react';
import T from '../../temporary/external-text';
import Tabs from 'react-bootstrap/Tabs';
import map from 'lodash/fp/map';
import Tab from 'react-bootstrap/Tab';
import Cards from '../misc/Cards';


export default class AboutTabBody extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  render() {
    return (
      <Tabs id={'about'} defaultActiveKey={'Plan2Adapt'}>
        {
          map(
            tab => (
              <Tab
                eventKey={tab.tab}
                title={tab.tab}
              >
                <Cards items={tab.cards}/>
              </Tab>
            )
          )(T.get(
            this.context,
            'about.tabs',
            {version: process.env.REACT_APP_VERSION}
            )
          )
        }
      </Tabs>
    );
  }
}
