import { BrowserRouter, useLocation, useNavigationType } from "react-router-dom";
import Header from "./components/Header";
import { AppRouter, routes } from "./router/router";

function AppContent() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentRoute = routes.find(route => route.path === location.pathname);

  const direction =
    location.state?.navigationDirection ||
    (navigationType === "POP" ? "down" : "up");

  return (
    <div className="app">
      <Header
        route={currentRoute}
        navigationDirection={direction}
      />
      <AppRouter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;