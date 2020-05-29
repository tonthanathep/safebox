import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Background from "./assets/bg.jpg";
import { Link, Redirect } from "react-router-dom";
import { auth } from "../firebase_config";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function Status() {
  const classes = useStyles();

  const [name, setName] = React.useState("");
  const [isBorrow, setBorrow] = React.useState(false);
  const [freeBox, setFree] = React.useState("");
  const [device, setDevice] = React.useState("");
  const [date, setDate] = React.useState("");


  const signOutHandler = () => {
    auth.signOut().then(() => {
      console.log("success");
    });
  };

  React.useEffect(() => {
    auth.currentUser.getIdToken(true).then((idToken) => {
      axios
        .get("http://localhost:5000/status/", {
          headers: { Authorization: idToken },
        })
        .then((response) => {
          setBorrow(response.data.isBorrow);
          setName(auth.currentUser.displayName);
          setDevice(response.data.device)

          var localDate = new Date(response.data.lastBorrow)
          setDate(localDate.toLocaleString())
        });

      axios
        .get("http://localhost:5000/lockbox/", {
          headers: { Authorization: idToken },
        })
        .then((response) => {
          setFree(response.data);
        });
    });
  }, []);

  return (
    <div style={{ backgroundImage: `url(${Background})` }}>
      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item>
          <Paper elevation={4} style={{ padding: 20 }}>
            <Grid
              container
              direction="column"
              alignItems="center"
              justify="center"
            >
              <Grid item style={{ padding: 10 }}>
              <p style={{ margin: -5 , marginBottom: -13}}>SafeBox ITKMITL</p>
                <h3>Welcome Back, {name}</h3>
              </Grid>
              {isBorrow ? (
                <div>
                  <Card>
                    <CardContent>
                      <Typography variant="p" color="secondary">
                        You're now borrowing
                      </Typography>
                      <Typography variant="h5" component="h2">
                        {device}
                      </Typography>
                      <Typography variant="p" >
                        Borrowed since {date}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Grid container direction="column">
                    <Grid item>
                      <Link to="/return" style={{ textDecoration: "none" }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          style={{
                            marginTop: 20,
                            paddingLeft: 100,
                            paddingRight: 100,
                          }}
                        >
                          Return Device
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link to="/logout" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="outlined"
                          style={{
                            marginTop: 10,
                            paddingLeft: 129,
                            paddingRight: 129,
                          }}
                        >
                          Logout
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>
                </div>
              ) : (
                <div>
                  <Card>
                    <CardContent>
                    <Typography variant="p" color="secondary">
                        You're not currently borrowing
                      </Typography>
                      <Typography variant="h5">
                        Your last device is {device}
                      </Typography>
                      <Typography variant="p">
                        Borrowed since {date}
                      </Typography>
                    </CardContent>
                  </Card>
                  {freeBox > 0 ? (
                    <Card variant="outlined" style={{ marginTop: 10 , marginBottom: 10}}>
                      <CardContent>
                        <Typography variant="p">
                          {freeBox} Device available for borrow
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="outlined" style={{ marginTop: 10, marginBottom: 10 }}>
                      <CardContent>
                        <Typography variant="p">
                          No device available for borrow
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  <Grid container direction="column">
                    {freeBox > 0 ? (
                      <Grid item>
                        <Link to="/borrow" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          style={{
                    
                            paddingLeft: 100,
                            paddingRight: 100,
                          }}
                        >
                          Borrow Device
                        </Button>
                        </Link>
                      </Grid>
                    ) : null}

                    <Grid item>
                      <Link to="/logout" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="outlined"
                          style={{
                            marginTop: 10,
                            paddingLeft: 137,
                            paddingRight: 137,
                          }}
                        >
                          Logout
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>
                </div>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
