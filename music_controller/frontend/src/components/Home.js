import React, { Component } from "react";
import JoinRoom from "./JoinRoom";
import CreateRoom from "./CreateRoom";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null
    };
    this.resetRoomCode = this.resetRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch("/api/current-room-code")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code
        });
      });
  }

  resetRoomCode() {
    this.setState({
      roomCode: null
    });
  }

  renderHomepage() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" compact="h3">
            Muzik Zone
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup variant="contained">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomepage()
              );
            }}
          />
          <Route path="/join" component={JoinRoom}></Route>
          <Route path="/create" component={CreateRoom}></Route>
          <Route
            path="/room/:roomCode"
            render={(props) => {
              return <Room {...props} leaveRoomCallback={this.resetRoomCode} />;
            }}
          ></Route>
        </Switch>
      </Router>
    );
  }
}
