import PropTypes from "prop-types";
import React from "react";
import Dropdown from "../Dropdown";
import Battery from "../Battery";
import styled from "styled-components";
import sendToServer from "../sendToServer";

/*
 * The following values are used in the Turtle refbox.
 * The property name (or key) is shown in the UI,
 * while its value will be sent over to the TRC.
 */
const TEAM_VALUES = { Magenta: "magenta", Cyan: "cyan" };
const HOME_VALUES = { "Yellow home": "yellow", "Blue home": "blue" };
const ROLE_VALUES = {
  INACTIVE: "inactive",
  ROLE_NONE: "none",
  "Att main": "attacker_main",
  "Att assist": "attacker_assist",
  "Def main": "defender_main",
  "Def assist": "defender_assist",
  "Def assist 2": "defender_assist2",
  Goalkeeper: "goalkeeper"
};

// The following values are used for translating the sent command into a human viewable version. They should be the reverse of the table above.
const TEAM_DISPLAY_VALUES = { magenta: "Magenta", cyan: "Cyan" };
const HOME_DISPLAY_VALUES = { yellow: "Yellow home", blue: "Blue home" };
const ROLE_DISPLAY_VALUES = {
  inactive: "INACTIVE",
  none: "ROLE_NONE",
  attacker_main: "Att main",
  attacker_assist: "Att assist",
  defender_main: "Def main",
  defender_assist: "Def assist",
  defender_assist2: "Def assist 2",
  goalkeeper: "Goalkeeper"
};

const onChange = (id, propName, propValue, session) => {
  const body = {};
  body[id] = {};
  body[id][propName] = propValue;
  sendToServer(body, "turtles", session).catch(error => console.error(error));
};

/**
 * Show all details for a turtle.
 * Author: H.E. van der Laan
 *
 * Props:
 *  - turtle: an object containing the following turtle details:
 *   - batteryvoltage: the current battery status of the turtle
 *   - homegoal: the current home goal of this turtle
 *   - role: the current role of this turtle
 *   - teamcolor: the current team of this turtle
 *  - editable: whether this turtle's properties can be edited
 *  - id: identifier of a turtle
 */
const Turtle = props => {
  const { batteryvoltage, homegoal, role, teamcolor } = props.turtle;
  const { editable, id, session } = props;
  return (
    <DefaultTurtle>
      <BatterySection>
        <Battery percentage={batteryvoltage} />
      </BatterySection>
      <SubSection>
        <p>Turtle {id}</p>
      </SubSection>
      <DropDownSection>
        <Dropdown
          id={`turtle${id}__role`}
          currentValue={ROLE_DISPLAY_VALUES[role]}
          enabled={editable}
          values={Object.keys(ROLE_VALUES)}
          onChange={value => {
            onChange(id, "role", ROLE_VALUES[value], session);
          }}
        />
        <Dropdown
          id={`turtle${id}__home`}
          currentValue={HOME_DISPLAY_VALUES[homegoal]}
          enabled={editable}
          values={Object.keys(HOME_VALUES)}
          onChange={value => {
            onChange(id, "homegoal", HOME_VALUES[value], session);
          }}
        />
        <Dropdown
          id={`turtle${id}__team`}
          currentValue={TEAM_DISPLAY_VALUES[teamcolor]}
          enabled={editable}
          values={Object.keys(TEAM_VALUES)}
          onChange={value => {
            onChange(id, "teamcolor", TEAM_VALUES[value], session);
          }}
        />
      </DropDownSection>
    </DefaultTurtle>
  );
};

Turtle.propTypes = {
  turtle: PropTypes.shape({
    batteryvoltage: PropTypes.number,
    homegoal: PropTypes.string,
    role: PropTypes.string,
    teamcolor: PropTypes.string
  }).isRequired,
  id: PropTypes.string.isRequired,
  editable: PropTypes.bool
};

const BatterySection = styled.div`
  min-width: 9.5rem;
  flex-basis: 35%;
  display: flex;
  justify-content: center;
`;

const SubSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-basis: 35%;
  padding: 0 0.5rem;
`;

const DropDownSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-basis: 30%;
`;

const DefaultTurtle = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 1.5rem 0;
  border-style: solid;
  border: 0.25rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 2rem;
`;

export default Turtle;
