import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Dropdown from "../Dropdown";
import TurtleList from "../TurtleList";
import sendToServer from "../sendToServer";

// Used for translating the display value back into a sendable version
const COMMAND_VALUES = {
  "Role assigner on": "role_assigner_on",
  "Role assigner off": "role_assigner_off",
  "Pass demo": "pass_demo",
  "Penalty demo": "penalty_demo",
  "Ball Handling demo": "ball_handling_demo"
};

// Used for translating the sent command into a human viewable version
const COMMAND_DISPLAY_VALUES = {
  role_assigner_on: "Role assigner on",
  role_assigner_off: "Role assigner off",
  pass_demo: "Pass demo",
  penalty_demo: "Penalty demo",
  ball_handling_demo: "Ball handling demo"
};

/**
 * Show the settings of all turtles.
 * Author: H.E. van der Laan
 * Author: T.T.P. Franken
 *
 * Props:
 *  - command: the currently active command
 *  - turtles: an array of Turtles
 *  - session: a string which holds the password needed to connect to the SRRS
 */
const Settings = props => {
  const { command, turtles, session } = props;
  return (
    <SettingsWrapper>
      <TurtleList turtles={turtles} session={session} />
      <RoleDropdown
        id={"settings_role-dropdown"}
        currentValue={COMMAND_DISPLAY_VALUES[command]}
        values={Object.keys(COMMAND_VALUES)}
        onChange={value => {
          sendToServer(COMMAND_VALUES[value], "command", session);
        }}
        enabled={true}
      />
    </SettingsWrapper>
  );
};

Settings.propTypes = {
  command: PropTypes.oneOf(Object.keys(COMMAND_DISPLAY_VALUES)),
  turtles: PropTypes.objectOf(
    PropTypes.shape({
      enabled: PropTypes.bool.isRequired,
      batteryvoltage: PropTypes.number.isRequired,
      homegoal: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      teamcolor: PropTypes.string.isRequired
    })
  ).isRequired
};

const RoleDropdown = styled(Dropdown)`
  margin-left: auto;
  margin-right: auto;
  height: 4rem;
`;

const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Settings;
