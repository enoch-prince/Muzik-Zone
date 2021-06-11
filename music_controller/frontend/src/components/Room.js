import React, { Component } from "react";
import endpoints from "./BackendApiLinks";
import { Grid, Button, Typography } from "@material-ui/core";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false
    };
    this.roomCode = this.props.match.params.roomCode;
    this.getRoomDetails();
    this.leaveRoomBtnClicked = this.leaveRoomBtnClicked.bind(this);
  }

  getRoomDetails() {
    endpoints().then((endpoint) => {
      fetch(endpoint.getRoom + "?code=" + this.roomCode)
        .then((response) => {
          if (!response.ok) {
            this.props.leaveRoomCallback();
            this.props.history.push("/");
          }
          return response.json();
        })
        .then((data) => {
          this.setState({
            votesToSkip: data.votes_to_skip,
            guestCanPause: data.guest_can_pause,
            isHost: data.is_host
          });
        });
    });
  }

  leaveRoomBtnClicked() {
    const requestInfo = {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    };

    endpoints().then((endpoint) => {
      fetch(endpoint.leaveRoom, requestInfo).then((_response) => {
        this.props.leaveRoomCallback();
        this.props.history.push("/");
      });
    });
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            You're currently in room {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Votes to skip a song: {this.state.votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Guests can pause songs: {this.state.guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            You're the host: {this.state.isHost.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            color="secondary"
            variant="contained"
            onClick={this.leaveRoomBtnClicked}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
