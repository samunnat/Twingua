import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import {Pie} from 'react-chartjs-2'
import {stylesListToClassNames, getCountryName} from "../../lib/utils";


const classes = stylesListToClassNames({
    chartContainer: {
        display: "block",
        width: "50%",
        float: "left",
    }
});

const langKeyToStr = {
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

const colors = {
    en: "#BB0A21",
    ar: "#F44336",
    bn: "#880E4F",
    cs: "#F48FB1",
    da: "#AB47BC",
    de: "#7B1FA2",
    el: "#283593",
    es: "#9FA8DA",
    fa: "#1565C0",
    fi: "#003563",
    fil: "#0288D1",
    fr: "#60C2FF",
    he: "#80DEEA",
    hi: "#00897B",
    hu: "#80CBC4",
    id: "#A5D6A7",
    it: "#43A047",
    ja: "#FFEE58",
    ko: "#FFA000",
    msa: "#FFE0B2",
    nl: "#FF5722",
    no: "#D84315",
    pl: "#BCAAA4",
    pt: "#795548",
    ro: "#37474F",
    ru: "#B0BEC5",
    sv: "#004D40",
    th: "#827717",
    tr: "#880E4F",
    uk: "#FF6F00",
    ur: "#B71C1C",
    vi: "#C47D27",
    "zh-cn": "#5B295B",
    "zh-tw": "#E868E8",
};

class MaxWidthDialog extends React.Component {

    createPieCharts = () => {
        const countryList = [];
        const countries = this.props.countryData;
        countries.forEach((countryObj) => {
            const countryName = Object.keys(countryObj)[0];
            const labels = [];
            const backgroundColors = []
            const data = [];
            for(var lanCode in countryObj[countryName]) {
                if(
                    lanCode != "total" && 
                    lanCode != "geoTagCount" && 
                    lanCode != "non-eu" 
                ){
                    labels.push(langKeyToStr[lanCode.replace(/"/g, "")]);
                    backgroundColors.push(colors[lanCode.replace(/"/g, "")]);
                    data.push(countryObj[countryName][lanCode]);
                }
            }
            console.log(data);
            console.log(labels);
            const pieData = {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors
                }]
            }
            countryList.push(
                <div className={classes.chartContainer}>
                <h2>{countryName}</h2>
                <Pie data={pieData} />
                </div>
            );
        });
        return countryList;
    }

    //console.log(this.props.countryData);


    render() {
        return (
            <React.Fragment>
                <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
                    Open max-width dialog
                </Button>
                <Dialog fullWidth="true" maxWidth="xl" open="open" onClose={this.props.handleClose} aria-labelledby="max-width-dialog-title">
                    <DialogTitle id="max-width-dialog-title">Country Statistics</DialogTitle>
                    <DialogContent>
                        <DialogContentText>You can set my maximum width and whether to adapt or not.</DialogContentText>
                        {this.createPieCharts()}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.handleClose} color="primary">
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles()(MaxWidthDialog);
