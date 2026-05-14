import { useState, useEffect, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import Dashboard from "@/pages/Dashboard";
import ZakatPage from "@/pages/ZakatPage";
import WarisPage from "@/pages/WarisPage";
import NotFound from "@/pages/not-found";

function useHashLocation(): [string, (to: string, opts?: { replace?: boolean }) => void] {
  const getHash = () => window.location.hash.replace(/^#/, "") || "/";
  const [loc, setLoc] = useState(getHash);
  useEffect(() => {
    const handler = () => setLoc(getHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (opts?.replace) window.location.replace("#" + to);
    else window.location.hash = to;
  }, []);
  return [loc, navigate];
}

function App() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/zakat" component={ZakatPage} />
        <Route path="/waris" component={WarisPage} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
