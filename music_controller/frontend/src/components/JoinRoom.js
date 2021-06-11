import React, { Component } from "react";
import { Grid, Typography, Button, TextField } from "@material-ui/core";
import { Link } from "react-router-dom";
import endpoints from "./BackendApiLinks";

export default class JoinRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: "",
      error: ""
    };
    this.handleEnterRoomBtnClick = this.handleEnterRoomBtnClick.bind(this);
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
  }

  handleTextFieldChange(e) {
    this.setState({
      roomCode: e.target.value
    });
  }

  handleEnterRoomBtnClick() {
    const requestInfo = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: this.state.roomCode
      })
    };

    endpoints().then((endpoint) => {
      fetch(endpoint.joinRoom, requestInfo)
        .then((response) => {
          if (response.ok) {
            this.props.history.push(`/room/${this.state.roomCode}`);
          } else {
            this.setState({
              error: "Room not found"
            });
          }
        })
        .catch((error) => console.log(error));
    });
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            Join a Room
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <TextField
            label="Code"
            placeholder="Enter a Room Code"
            error={this.state.error}
            variant="standard"
            value={this.state.roomCode}
            helperText={this.state.error}
            onChange={this.handleTextFieldChange}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleEnterRoomBtnClick}
          >
            Enter Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}
