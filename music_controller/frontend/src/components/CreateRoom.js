import React, { Component } from "react";
import { Link } from "react-router-dom";
import endpoints from "./BackendApiLinks";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

export default class CreateRoom extends Component {
  static defaultProps = {
    guestCanPause: true,
    votesToSkip: 2,
    roomCode: null,
    update: false,
    updateCallback: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      resMsg: {
        msg: "",
        type: ""
      }
    };

    this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    this.handleVotesToSkipChange = this.handleVotesToSkipChange.bind(this);
    this.handleCreateBtnClicked = this.handleCreateBtnClicked.bind(this);
    this.handleUpdateBtnClicked = this.handleUpdateBtnClicked.bind(this);
  }

  handleGuestCanPauseChange(e) {
    this.setState({
      guestCanPause: e.target.value === "true" ? true : false
    });
  }

  handleVotesToSkipChange(e) {
    this.setState({
      votesToSkip: e.target.value
    });
  }

  handleCreateBtnClicked() {
    const requestInfo = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause
      })
    };

    endpoints().then((endpoint) => {
      fetch(endpoint.createRoom, requestInfo)
        .then((response) => response.json())
        .then((data) => {
          //this.props.roomCode = data.code;
          this.props.history.push("/room/" + data.code);
        });
    });
  }

  handleUpdateBtnClicked() {
    const requestInfo = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
        code: this.props.roomCode
      })
    };

    endpoints().then((endpoint) => {
      fetch(endpoint.updateRoom, requestInfo).then((response) => {
        let _msg = "";
        let _type;
        if (response.ok) {
          _msg = "Room details updated successfully!";
          _type = "success";
        } else {
          _msg = `There was an error when trying to update the room with code <${this.props.roomCode}>`;
          _type = "error";
        }
        this.setState({
          resMsg: {
            msg: _msg,
            type: _type
          }
        });
        this.props.updateCallback();
      });
    });
  }

  renderCreateButtons() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="secondary"
            variant="contained"
            onClick={this.handleCreateBtnClicked}
          >
            Create a Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="primary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderUpdateButtons() {
    return (
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={this.handleUpdateBtnClicked}
        >
          Update Room
        </Button>
      </Grid>
    );
  }

  render() {
    const title = this.props.update ? "Update a Room" : "Create a Room";
    return (
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} align="center">
          <Collapse in={this.state.resMsg.msg != ""}>
            <Alert
              severity={this.state.resMsg.type}
              onClose={() => {
                this.setState({
                  resMsg: { msg: "", type: "" }
                });
              }}
            >
              {this.state.resMsg.msg}
            </Alert>
          </Collapse>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            {title}
          </Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText>
              <div align="center">Playback state controlled by Guest</div>
            </FormHelperText>

            <RadioGroup
              row
              defaultValue={this.props.guestCanPause.toString()}
              onChange={this.handleGuestCanPauseChange}
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Play | Pause"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="secondary" />}
                label="No Control"
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} align="center">
          <FormControl>
            <TextField
              required={true}
              type="number"
              onChange={this.handleVotesToSkipChange}
              defaultValue={this.state.votesToSkip}
              inputProps={{ min: 1, style: { textAlign: "center" } }}
            />
            <FormHelperText>
              <div align="center">Number of Votes Required to Skip a Song</div>
            </FormHelperText>
          </FormControl>
        </Grid>
        {this.props.update
          ? this.renderUpdateButtons()
          : this.renderCreateButtons()}
      </Grid>
    );
  }
}
