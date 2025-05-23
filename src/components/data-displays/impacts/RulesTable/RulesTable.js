import PropTypes from "prop-types";
import React from "react";
import { Table } from "react-bootstrap";
import { map } from "lodash/fp";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import classnames from "classnames";
import T from "../../../../temporary/external-text";
import "./RulesTable.css";
import Button from "react-bootstrap/Button";

export default class RulesTable extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    ruleValues: PropTypes.object.isRequired,
  };

  state = {
    showInactiveRules: true,
  };

  toggleShowInactiveRules = () =>
    this.setState((prevState) => ({
      showInactiveRules: !prevState.showInactiveRules,
    }));

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.toggleShowInactiveRules}>
          <T
            as="string"
            path={`tabs.impacts.rulesLogic.table.showInactiveRulesButton.${this.state.showInactiveRules}`}
          />
        </Button>

        <Table bordered className="Rules-table">
          <thead>
            <tr>
              <th>
                <T path="tabs.impacts.rulesLogic.table.heading.ruleId" />
              </th>
              <th>
                <T path="tabs.impacts.rulesLogic.table.heading.condition" />
              </th>
              <th>
                <T path="tabs.impacts.rulesLogic.table.heading.category" />
              </th>
              <th>
                <T path="tabs.impacts.rulesLogic.table.heading.sector" />
              </th>
              <th>
                <T path="tabs.impacts.rulesLogic.table.heading.effects" />
              </th>
              <th>
                <T path="tabs.impacts.rulesLogic.table.heading.notes" />
              </th>
            </tr>
          </thead>
          <tbody>
            {map((rule) => {
              const active = this.props.ruleValues[rule.id];
              return (
                (this.state.showInactiveRules || active) && (
                  <tr className={classnames({ "active-rule": active })}>
                    <td>{rule.id}</td>
                    <td>{rule.condition}</td>
                    <td>{rule.category}</td>
                    <td>{rule.sector}</td>
                    <td>{rule.effects}</td>
                    <td>
                      <Markdown rehypePlugins={[rehypeRaw]}>
                        {rule.notes}
                      </Markdown>
                    </td>
                  </tr>
                )
              );
            })(this.props.rulebase)}
          </tbody>
        </Table>
      </React.Fragment>
    );
  }
}
