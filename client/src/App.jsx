import React from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";

import AuthPage from "./pages/AuthPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <>
      <Switch>
        <Route path="/login" component={AuthPage} />

        <Route component={NotFoundPage} />
      </Switch>

      <Toaster position="top-right" richColors />
    </>
  );
};

export default App;
