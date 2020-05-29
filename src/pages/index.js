import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Background from "./assets/bg.jpg";
import { auth } from "../firebase_config"
import { Redirect } from 'react-router-dom'
import { AuthContext } from "./UserProviders";

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

export default function Index() {
  const classes = useStyles();

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onChangeHandler = (event) => {
    const {name, value} = event.currentTarget;

    if(name === 'userEmail') {
        setEmail(value);
    } else if(name === 'userPassword'){
        setPassword(value);
    }
};

  const signInHandler = () => {
      auth.signInWithEmailAndPassword(email, password).then(() =>{
          
      });
  }

  const { currentUser } = React.useContext(AuthContext);

  if (currentUser) {

    return <Redirect to="/status"/>
    

  } else {

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
                    <h3>SafeBox IT KMITL</h3>
                  </Grid>
                  <Grid item>
                    <TextField
                      id="outlined-multiline-static"
                      label="Email"
                      name="userEmail"
                      value = {email}
                      variant="outlined"
                      onChange = {(event) => onChangeHandler(event)}
                      style={{ margin: 5 }}
                    />
                    <TextField
                      id="outlined-multiline-static"
                      label="Password"
                      type="password"
                      name="userPassword"
                      value = {password}
                      variant="outlined"
                      onChange = {(event) => onChangeHandler(event)}
                      style={{ margin: 5 }}
                    />
                  </Grid>
    
                  <Grid item style={{ paddingTop: 15 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      style={{ margin: 5, paddingLeft: 100, paddingRight: 100 }}
                      onClick={(event) => {signInHandler()}}
                    >
                      Login
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="secondary"
                      style={{ margin: 5, paddingLeft: 83, paddingRight: 83 }}
                    >
                      Register
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </div>
      );

    
  } 
  
}
