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



export default function Borrow() {

  const [locker, setLocker] = React.useState("");
  const [device, setDevice] = React.useState("");
  const [lockID, setLockID] = React.useState("");
  const [borrowed, setBorrow] = React.useState(false);

  React.useEffect(() => {
    auth.currentUser.getIdToken(true).then((idToken) => {
      axios
        .get("http://localhost:5000/lockbox/borrow", {
          headers: { Authorization: idToken },
        })
        .then((response) => {
          setDevice(response.data.device);
          setLocker(response.data.number);
          setLockID(response.data.lock_id)
        });
    });
  }, []);

  const confirmHandler = () => {
    let time = new Date;
    auth.currentUser.getIdToken(true).then((idToken) => {
      axios
        .post("http://localhost:5000/lockbox/borrow", {
          
          number: locker,
          device: device,
          borrowedTime: time,
          lock_id: lockID
        } , {
          headers: { Authorization: idToken },
        })
        .then((response) => {
        
            setBorrow(true)
          
        });
    });
  }

  if (borrowed != true){
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
              <p style={{ margin: -5 , marginBottom: -13}}>Borrowing Device</p>
                <h3>Your requesting device is at Locker {locker}</h3>
                
              </Grid>
              
                <div>
                  <Card>
                    <CardContent>
                    <LaptopIcon fontSize='large'/>
                      <Typography variant="h5" component="h2">
                        {device}
                      </Typography>
                      <Typography color="textSecondary" component="p">
                        Please check your detail again
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
                        onClick={(event) => {confirmHandler()}}
                      >
                        Confirm and open locker
                      </Button>
                    </Grid>
                    <Grid item>
                      <Link to="/status" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" style={{ marginTop: 10, paddingLeft: 176, paddingRight: 176 }}>Cancel</Button>
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
                      } else {
                        return <Redirect to="/"/>
                      }
}
