import * as React from "react";
import {stylesListToClassNames} from "../../lib/utils";

const classes = stylesListToClassNames({
    container: {
        top: 10,
        right: 10,
        position: "absolute",
        zIndex: 1000,
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-around",
        height: "20px",
    },
    button: {
        fontSize: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "7px",
    },
    info: {
        marginBottom: "10px",
        float: "right",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
        padding: "8px 8px",
        borderRadius: "5px",
        transition: "width 2s",
    },
    langRow: {
        width: "100%",
        display: "flex",
        cursor: "pointer",
        fontSize: "12px",
    },
    legendColor: {
        width: "8px",
        height: "8px",
        float: "left",
        boxShadow: "1px 2px rgba(0, 0, 0, 0.2)",
        margin: "2px 8px 2px 4px",
        border: "1px solid black",
    },
    legendKey: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    legendKeyDisabled: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: "#B2B2B2",
    },
    showHideButton: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        fontSize: "12px",
        margin: "4px",
        borderRadius: "5px",
        minWidth: "20px",
        minHeight: "20px",
        justifyContent: "center",
    },
});

class Legend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minimized: false,
        };
    }

    createLegendList = (colors) => {
        const itemList = [];
        for (var langKey in colors) {
            const arg = langKey;
            itemList.push(
                <div
                    key={langKey}
                    className={classes.langRow}
                    id="legend-ele"
                    onClick={() => {
                        this.props.filterClick(arg);
                    }}
                >
                    <div
                        className={classes.legendColor}
                        style={{background: this.props.filteredLangs.includes(`"${langKey}"`) ? "#000000" : colors[langKey]}}
                    />
                    <span id="noselect" className={this.props.filteredLangs.includes(`"${langKey}"`) ? classes.legendKeyDisabled : classes.legendKey}>
                        {this.props.langKeyToStr[langKey]}
                    </span>
                    <br />
                </div>
            );
        }

        return itemList;
    };

    render() {
        return (
            <div className={classes.container}>
                <div className={classes.info}>
                    {this.state.minimized ? <React.Fragment /> : this.createLegendList(this.props.langColors)}
                    <div className={classes.buttonContainer}>
                        {this.state.minimized ? (
                            <React.Fragment />
                        ) : (
                            <React.Fragment>
                                <div className={classes.button} id="selectButton" onClick={() => this.props.filterClick("", true, false)}>
                                    Select All
                                </div>
                                <div className={classes.button} id="selectButton" onClick={() => this.props.filterClick("", false, true)}>
                                    Deselect All
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                    <div className={classes.showHideButton} id="legend-ele" onClick={() => this.setState({minimized: !this.state.minimized})}>
                        {this.state.minimized ? <i className="fas fa-expand" /> : <i className="far fa-window-minimize" />}
                    </div>
                </div>
            </div>
        );
    }
}

export default Legend;
