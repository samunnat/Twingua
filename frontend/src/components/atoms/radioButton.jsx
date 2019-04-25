import * as React from "react";
import { stylesListToClassNames } from "../../lib/utils";

const classes = stylesListToClassNames({
  button: {}
});

/**
 * Will show an error message if the state.errorMessage contains some text
 */
export default function RadioButton(props) {
  return (
    <div className={classes.button}>
      <label>
        <input
          type="radio"
          value={props.value}
          checked={props.checked}
          onChange={props.onChange}
        />
        {props.text}
      </label>
    </div>
  );
}

// export default(RadioButton)
