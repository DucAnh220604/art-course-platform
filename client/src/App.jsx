import React from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import { LandingPage } from "./pages/LandingPage";

const App = () => {
  return (
    <>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/" component={LandingPage} />

        <Route component={NotFoundPage} />
      </Switch>

      <Toaster position="top-right" richColors />
    </>
  );
};

export default App;
