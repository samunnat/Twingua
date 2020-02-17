import * as React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Visibility from "@material-ui/icons/Visibility";

import classNames from "classnames";


const styles = theme => ({
    categoryHeader: {
      paddingTop: 16,
      paddingBottom: 16
    },
    categoryHeaderPrimary: {
      color: theme.palette.common.white
    },
    item: {
      paddingTop: 4,
      paddingBottom: 4,
      color: "rgba(255, 255, 255, 0.7)"
    },
    itemCategory: {
      backgroundColor: "#232f3e",
      boxShadow: "0 -1px 0 #404854 inset",
      paddingTop: 16,
      paddingBottom: 16
    },
    firebase: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamily,
      color: theme.palette.common.white
    },
    itemActionable: {
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.08)"
      }
    },
    itemActiveItem: {
      color: "#4fc3f7"
    },
    itemPrimary: {
      color: "inherit",
      fontSize: theme.typography.fontSize,
      "&$textDense": {
        fontSize: theme.typography.fontSize
      }
    },
    textDense: {},
    divider: {
      marginTop: theme.spacing.unit * 2
    }
  });

/**
 * Will show an error message if the state.errorMessage contains some text
 */
export default function LabelButton(props) {

const { classes, ...other } = props;

  return (
      <div>
    <ListItem className={styles.categoryHeader}>
        <ListItemText
            classes={{
                primary: styles.categoryHeaderPrimary
            }}>
            {props.id}
        </ListItemText>
    </ListItem>
    <ListItem
        button={true}
        key={props.value}
        onClick={props.onClick}
        onChange={props.onChange}
        className={classNames(
                  styles.item,
                  styles.itemActionable,
                  styles.itemActiveItem
                )}
        >
        <ListItemIcon>{<Visibility />}</ListItemIcon>
        <ListItemText
            classes={{
                primary: styles.itemPrimary,
                textDense: styles.textDense
            }}
            >
            {props.value}
        </ListItemText>
    </ListItem>
    </div>
  );
}


// export default(RadioButton)