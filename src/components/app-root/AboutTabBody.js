import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Cards from '../misc/Cards';
import map from 'lodash/fp/map';
import T from '../../temporary/external-text';


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
                className='pt-2'
              >
                <Cards items={tab.cards}/>
              </Tab>
            )
          )(T.get(
            this.context,
            'tabs.about.tabs',
            {version: process.env.REACT_APP_VERSION}
            )
          )
        }
      </Tabs>
    );
  }
}
