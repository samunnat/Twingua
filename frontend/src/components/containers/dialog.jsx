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

const styles = (theme) => ({
    form: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        width: "fit-content",
    },
    formControl: {
        marginTop: theme.spacing.unit * 2,
        minWidth: 120,
        minHeight: "90vh",
    },
    formControlLabel: {
        marginTop: theme.spacing.unit,
    },
});

class MaxWidthDialog extends React.Component {
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
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.handleClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(MaxWidthDialog);
