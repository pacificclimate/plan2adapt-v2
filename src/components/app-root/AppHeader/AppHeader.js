import React from "react";
import { Row, Col } from "react-bootstrap";
import pcicLogo from "../../../assets/pcic-logo.png";
import p2aLogo from "../../../assets/p2a-logo.png";
// eslint-disable-next-line no-unused-vars
import css from "./AppHeader.css";

export default class AppHeader extends React.Component {
  static propTypes = {};

  render() {
    return (
      <Row className={"AppHeader justify-content-center"}>
        <Col lg={"auto"} md={"auto"} sm={"auto"}>
          <a href="https://pacificclimate.org/" className={"logo"}>
            <img
              src={pcicLogo}
              width="328"
              height="38"
              alt="Pacific Climate Impacts Consortium"
            />
          </a>
          <img
            src={p2aLogo}
            width="328"
            height="38"
            alt="Pacific Climate Impacts Consortium"
          />
        </Col>
      </Row>
    );
  }
}
