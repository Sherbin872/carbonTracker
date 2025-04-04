import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TodaysEmission from "./pages/TodaysEmission";
import HistoricalAnalysis from "./pages/HistoricalAnalysis";
import ActivityLog from "./pages/ActivityLog";
import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todays-emission" element={ <PrivateRoute><TodaysEmission /></PrivateRoute>} />
        <Route path="/historical-analysis" element={<PrivateRoute><HistoricalAnalysis /></PrivateRoute>} />
        <Route path="/activity-log" element={<PrivateRoute><ActivityLog /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
