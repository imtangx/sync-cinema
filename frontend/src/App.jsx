import { useState } from "react";
import "./App.css";
import EnterRoomCard from "./components/EnterRoomCard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage.jsx";

function App() {
  return (
    <div className="App">
      <Router basename="/sync-cinema">
        <Routes>
          <Route path="/" element={<EnterRoomCard />} />
          <Route path="/room/:id" element={<RoomPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
