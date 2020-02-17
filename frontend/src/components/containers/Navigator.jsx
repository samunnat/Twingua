import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {withStyles} from "@material-ui/core/styles";

import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import HomeIcon from "@material-ui/icons/Home";
import PublicIcon from "@material-ui/icons/Public";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PieChart from "@material-ui/icons/PieChart";
import Language from "@material-ui/icons/Language";
import Autorenew from "@material-ui/icons/Autorenew";
import Place from "@material-ui/icons/Place";
import Terrain from "@material-ui/icons/Terrain";

import MaxWidthDialog from "./dialog.jsx";

const styles = (theme) => ({
    categoryHeader: {
        paddingTop: 16,
        paddingBottom: 16,
    },
    categoryHeaderPrimary: {
        color: theme.palette.common.white,
    },
    item: {
        paddingTop: 4,
        paddingBottom: 4,
        color: "rgba(255, 255, 255, 0.7)",
    },
    itemCategory: {
        backgroundColor: "#232f3e",
        boxShadow: "0 -1px 0 #404854 inset",
        paddingTop: 16,
        paddingBottom: 16,
    },
    firebase: {
        fontSize: 24,
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.common.white,
    },
    itemActionable: {
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
        },
    },
    itemActiveItem: {
        color: "#4fc3f7",
    },
    itemPrimary: {
        color: "inherit",
        fontSize: theme.typography.fontSize,
        "&$textDense": {
            fontSize: theme.typography.fontSize,
        },
    },
    textDense: {},
    divider: {
        marginTop: theme.spacing.unit * 2,
    },
});

class Navigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            piechartsOpened: false,
        };
    }

    categories = [
        {
            id: "Current View",
            children: [
                {id: "EU vs Non-EU languages", icon: <Place />, targetUrl: "/component1", active: true},
                {id: "Geo tag vs Non Geo tag", icon: <PublicIcon />, targetUrl: "/component2"},
                {id: "Language use RT & Likes", icon: <Autorenew />, targetUrl: "/storage"},
            ],
        },
        {
            id: "General View",
            children: [
                // { id: "Analytics", icon: <SettingsIcon />, targetUrl: "/analytics" },
                // { id: "Performance", icon: <TimerIcon />, targetUrl: "/performance" },
                // { id: "Test Lab", icon: <PhonelinkSetupIcon />, targetUrl: "/testlab" },
                {
                    id: "Language use percentages/counts",
                    icon: <Language />,
                    targetUrl: "/hosting",
                    onClick: () => {
                        console.log("hello");
                    },
                },
                {
                    id: "Countries",
                    icon: <Terrain />,
                    targetUrl: "/functions",
                    onClick: () => {
                        console.log("hello");
                    },
                },
                {
                    id: "Pie Charts",
                    icon: <PieChart />,
                    targetUrl: "/mlkit",
                    onClick: () => {
                        this.setState({piechartsOpened: true});
                        console.log(this);
                    },
                },
            ],
        },
        {
            id: "Labels",
            children: [{id: "Turn on", icon: <Visibility />, targetUrl: "/analytics"}, {id: "Turn off", icon: <VisibilityOff />, targetUrl: "/performance"}],
        },
    ];
    render() {
        const {classes, data, countryData, ...other} = this.props;

        return (
            <React.Fragment>
                <Drawer variant="permanent" {...other}>
                    <List disablePadding>
                        <ListItem className={classNames(classes.firebase, classes.item, classes.itemCategory)}>Twingua</ListItem>
                        <ListItem className={classNames(classes.item, classes.itemCategory)}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText
                                classes={{
                                    primary: classes.itemPrimary,
                                }}
                            >
                                Home
                            </ListItemText>
                        </ListItem>
                        {this.categories.map(({id, children}) => (
                            <React.Fragment key={id}>
                                <ListItem className={classes.categoryHeader}>
                                    <ListItemText
                                        classes={{
                                            primary: classes.categoryHeaderPrimary,
                                        }}
                                    >
                                        {id}
                                    </ListItemText>
                                </ListItem>
                                {children.map(({id: childId, icon, active, onClick, targetUrl}) => (
                                    <ListItem
                                        button
                                        dense
                                        key={childId}
                                        //component={Link}
                                        onClick={onClick}
                                        to={targetUrl}
                                        className={classNames(classes.item, classes.itemActionable, active && classes.itemActiveItem)}
                                    >
                                        <ListItemIcon>{icon}</ListItemIcon>
                                        <ListItemText
                                            classes={{
                                                primary: classes.itemPrimary,
                                                textDense: classes.textDense,
                                            }}
                                        >
                                            {childId}
                                        </ListItemText>
                                    </ListItem>
                                ))}
                                <Divider className={classes.divider} />
                            </React.Fragment>
                        ))}
                    </List>
                </Drawer>
                {this.state.piechartsOpened ? <MaxWidthDialog countryData={this.props.countryData} handleClose={() => this.setState({piechartsOpened: false})} /> : <React.Fragment />}
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Navigator);
