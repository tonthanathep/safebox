import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Background from "./assets/bg.jpg";
import LaptopIcon from '@material-ui/icons/Laptop';
import {Link, Redirect} from 'react-router-dom';
import axios from "axios";
import { auth } from "../firebase_config";

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

export default function Return() {
  const classes = useStyles();

  const [locker, setLocker] = React.useState(3);
  const [device, setDevice] = React.useState("")
  const [lockID, setLockID] = React.useState("");
  const [date, setDate] = React.useState("");



  React.useEffect(() => {
    auth.currentUser.getIdToken(true).then((idToken) => {
      axios
        .get("http://localhost:5000/status/", {
          headers: { Authorization: idToken },
        })
        .then((response) => {
          setDevice(response.data.device)
          setLocker(response.data.number)

          var localDate = new Date(response.data.lastBorrow)
          setDate(localDate.toLocaleString())
        });

    });
  }, []);

  const confirmHandler = () => {
    let time = new Date;
    auth.currentUser.getIdToken(true).then((idToken) => {
      axios
        .post("http://localhost:5000/lockbox/return", {
          device: device,
          borrowedTime: time,
          lockbox: lockID
        } , {
          headers: { Authorization: idToken },
        })
        .then((response) => {
        
        });
    });
  }

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
              <Grid item style={{ margin: 10 }}>
                <p style={{ margin: -5 , marginBottom: -13}}>Returning Device</p>
                <h3>Your device belongs in Locker {locker}</h3>
                
              </Grid>
              
                <div>
                  <Card>
                    <CardContent>
                    <LaptopIcon fontSize='large'/>
                      <Typography variant="h5" component="h2">
                        {device}
                      </Typography>
                      <Typography color="textSecondary" component="p">
                        You borrowed since {date}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Grid container direction="column">
                    <Grid item>
                      <Button
                        variant="contained"
                        color="secondary"
                        style={{
                          marginTop: 20,
                          paddingLeft: 100,
                          paddingRight: 100,
                        }}
                      >
                        Confirm return
                      </Button>
                    </Grid>
                    <Grid item>
                    <Link to="/status" style={{ textDecoration: 'none' }}>
                      <Button variant="outlined" style={{ marginTop: 10, paddingLeft: 137, paddingRight: 137 }}>Cancel</Button>
                      </Link>
                    </Grid>
                  </Grid>
                </div>
              
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
