import { useState } from "react";
import Header from "./components/Header";
import DebugGuard from "./components/DebugGuard";
import Home from "./pages/Home";
import PeriodicTable from "./pages/PeriodicTable";
import "./styles/App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (event) => {
    const page = event.currentTarget.dataset.page;
    if (page === "home" || page === "periodic-table") {
      setCurrentPage(page);
    }
  };

  return (
    <div className="app">
      <DebugGuard />
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="app-content">
        {currentPage === "periodic-table" ? <PeriodicTable /> : <Home />}
      </div>
    </div>
  );
}

export default App;