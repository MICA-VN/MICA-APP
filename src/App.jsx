import Header from "./components/Header";
import Home from "./pages/Home";

function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Home />
      </div>
    </div>
  );
}

export default App;