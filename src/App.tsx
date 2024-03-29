import React, { useEffect, useState } from 'react';
import { Switch, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import './scss/app.scss'
import { AppProvider } from './AppContext';
import ReactGA from 'react-ga4';

const App: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname
    })
  }, [location, window.location.pathname])

  return (
    <AppProvider>
      <Switch>
        <Route exact path="/">
            <Home />
        </Route>
        <Route>
            <Home />
        </Route>
      </Switch>
    </AppProvider>
  );
}

export default App;
