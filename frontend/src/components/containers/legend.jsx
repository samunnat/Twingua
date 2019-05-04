import * as React from "react";
import {stylesListToClassNames} from "../../lib/utils";

const languages = {
    en: "English",
    ar: "Arabic",
    bn: "Bengali",
    cs: "Czech",
    da: "Danish",
    de: "German",
    el: "Greek",
    es: "Spanish",
    fa: "Persian",
    fi: "Finnish",
    fil: "Filipino",
    fr: "French",
    he: "Hebrew",
    hi: "Hindi",
    hu: "Hungarian",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    msa: "Malay",
    nl: "Dutch",
    no: "Norwegian",
    pl: "Polish",
    pt: "Portuguese",
    ro: "Romanian",
    ru: "Russian",
    sv: "Swedish",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    ur: "Urdu",
    vi: "Vietnamese",
    "zh-cn": "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
};

const classes = stylesListToClassNames({
    container: {
        top: 10,
        right: 10,
        position: "absolute",
        zIndex: 1000,
    },
    info: {
        marginBottom: "10px",
        float: "right",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
        padding: "8px 8px",
        borderRadius: "5px",
    },
    legendColor: {
        width: "18px",
        height: "18px",
        float: "left",
        marginRight: "8px",
        opacity: "0.7",
    },
    showHideButton: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        fontSize: "12px",
        margin: "4px",
        borderRadius: "5px",
        minWidth: "25px",
        minHeight: "25px",
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
            itemList.push(
                <React.Fragment key={langKey}>
                    <i className={classes.legendColor} style={{background: colors[langKey]}} />
                    {languages[langKey]}
                    <br />
                </React.Fragment>
            );
        }

        return itemList;
    };

    render() {
        return (
            <div className={classes.container}>
                <div className={classes.info}>
                    {this.state.minimized
                        ? {
                              /* <React.Fragment /> */
                          }
                        : this.createLegendList(this.props.langColors)}
                    <div className={classes.showHideButton} id="legend-min" onClick={() => this.setState({minimized: !this.state.minimized})}>
                        {this.state.minimized ? <i className="fas fa-expand" /> : <i className="far fa-window-minimize" />}
                    </div>
                </div>
            </div>
        );
    }
}

export default Legend;
