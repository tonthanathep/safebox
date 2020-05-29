import React, { Component, createContext } from "react";
import { auth, messaging } from "../firebase_config";
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [pending, setPending] = React.useState(true);
  const [currentToken, setToken] = React.useState(null);

  // messaging.usePublicVapidKey("BOJ0fBzBZAGTU9Nc_BM1X-YKmSFdDDaILw6Tu2sFulr24HdRzlVxuStQSkQ8QPvimhASei8Zl9I5_gb-9e-wGSE");

  React.useEffect(() => {
    console.log('Provider active')

    // Authentication
     auth.onAuthStateChanged((user) => {
          setCurrentUser(user);
          setPending(false)
      
    });

  }, []);

  if(pending){
    return (
      <Grid item md={12} xs={12} style={{textAlign: 'center', paddingTop:50}}> 
        <CircularProgress style={{color:'#fecd6e'}}/>
        <h3  hrefclassName="text-instruc" style={{textAlign:'center'}}>กำลังโหลดข้อมูล...</h3>
        <p   style={{textAlign:'center', fontSize:'14px', marginTop:'-10'}}>กรุณารอสักครู่ หากใช้เวลานานเกินไปโปรดลอง Refresh</p>
      </Grid>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser, currentToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};