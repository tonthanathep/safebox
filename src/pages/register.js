import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Background from "./assets/bg.jpg";
import { auth } from "../firebase_config";
import { Redirect } from "react-router-dom";
import axios from 'axios';

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

export default function Register() {
  const classes = useStyles();

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.currentTarget;

    if (name === "userEmail") {
      setEmail(value);
    } else if (name === "userPassword") {
      setPassword(value);
    } else if (name === "userName") {
      setName(value);
    } else if (name === "userConfirmPassword") {
      setConfirmPassword(value);
    }
  };

  const signupHandler = (event) => {

    
    if (password === confirmPassword){
        try {
            auth.createUserWithEmailAndPassword(email, password).then(currentUser => {
                console.log('user created!');
                auth.currentUser.getIdToken(true).then(idToken => {
                    axios.post('http://localhost:5000/auth/register',{
                        fullname: name
                    }, { headers: {
                        'Authorization': idToken,
                        'Content-type': 'application/json'
                    }}).then((response) => {
                        console.log('request posted');
                    }).catch((error) => {
                        console.log(error);
                    })
                })
            })
        } catch (error) {
        console.log(error)
        }
    }
    
}

  if (!auth.currentUser) {
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
                <Grid item>
                  <h3>Register your account</h3>
                </Grid>
                <Grid item>
                  <TextField
                    id="outlined-multiline-static"
                    label="Name"
                    name="userName"
                    value={name}
                    variant="outlined"
                    onChange={(event) => onChangeHandler(event)}
                    style={{ margin: 5 }}
                  />
                  <TextField
                    id="outlined-multiline-static"
                    label="Email"
                    name="userEmail"
                    value={email}
                    variant="outlined"
                    onChange={(event) => onChangeHandler(event)}
                    style={{ margin: 5 }}
                  />
                </Grid>
                <Grid item style={{marginTop: 20}}>
                <TextField
                    id="outlined-multiline-static"
                    label="Password"
                    type="password"
                    name="userPassword"
                    value={password}
                    variant="outlined"
                    onChange={(event) => onChangeHandler(event)}
                    style={{ margin: 5 }}
                  />
                                    <TextField
                    id="outlined-multiline-static"
                    label="Confirm Password"
                    type="password"
                    name="userConfirmPassword"
                    value={confirmPassword}
                    variant="outlined"
                    onChange={(event) => onChangeHandler(event)}
                    style={{ margin: 5 }}
                  />
                </Grid>

                <Grid item style={{ paddingTop: 15 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{ margin: 5, paddingLeft: 100, paddingRight: 100 }}
                    onClick={(event) => {
                      signupHandler();
                    }}
                  >
                    Register
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    style={{ margin: 5, paddingLeft: 100, paddingRight: 100 }}
                  >
                    Back
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  } else {
    return <Redirect to="/status" />;
  }
}
