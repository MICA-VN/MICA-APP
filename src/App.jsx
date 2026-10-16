import Header from "./components/Header";
import DebugGuard from "./components/DebugGuard";
import Home from "./pages/Home";
import "./styles/App.css";

function App() {
  return (
    <div className="app">
      <DebugGuard />
      <Header />
      <div className="app-content">
        <Home />
      </div>
    </div>
  );
}

export default App;