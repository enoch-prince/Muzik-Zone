import React, { Component } from "react";
import endpoints from "./BackendApiLinks";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoom from "./CreateRoom";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      isSpotifyAuthenticated: false
    };

    //Binding the methods to the 'this' keyword to make them available across components
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.leaveRoomBtnClicked = this.leaveRoomBtnClicked.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);

    this.roomCode = this.props.match.params.roomCode;
    this.getRoomDetails();
  }

  authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => {
        if (!response.ok) {
          // alert the user of failed authentication
        } else {
          //console.log(response);
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ isSpotifyAuthenticated: data.status });
        //console.log(data);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
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
          if (this.state.isHost && !this.state.isSpotifyAuthenticated) {
            this.authenticateSpotify();
          }
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

  updateShowSettings(value) {
    this.setState({
      showSettings: value
    });
  }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            this.updateShowSettings(true);
          }}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoom
            update={true}
            votesToSkip={this.state.votesToSkip}
            guestCanPause={this.state.guestCanPause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              this.updateShowSettings(false);
            }}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    if (this.state.showSettings) return this.renderSettings();
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
        {this.state.isHost ? this.renderSettingsButton() : null}
      </Grid>
    );
  }
}
