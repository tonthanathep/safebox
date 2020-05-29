import React from 'react';
import './App.css';
import { hot } from 'react-hot-loader/root'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Index from './pages/index'
import Status from './pages/status'
import Borrow from './pages/borrow'
import Return from './pages/return'
import Register from './pages/register'
import Logout from './pages/logout'
import { AuthProvider } from './pages/UserProviders'

function App() {
  return (
    <div className="App">
      <React.Fragment>
      <AuthProvider>
        <Router>
          <Switch>
            <Route exact path="/" component={Index}/>
            <Route exact path="/status" component={Status}/>
            <Route exact path="/borrow" component={Borrow}/>
            <Route exact path="/return" component={Return}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/logout" component={Logout}/>
          </Switch>
        </Router>
        </AuthProvider>
      </React.Fragment>
    </div>
  );
}

export default hot(App);
