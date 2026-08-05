import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";

import EloBoost from "./pages/services/EloBoost";
import DuoBoost from "./pages/services/DuoBoost";
import Coaching from "./pages/services/Coaching";
import Placement from "./pages/services/Placement";

import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import Dashboard from "./pages/dashboard/Dashboard";
import Solicitar from "./pages/request/Solicitar";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/services/elo-boost" element={<EloBoost />} />
      <Route path="/services/duo-boost" element={<DuoBoost />} />
      <Route path="/services/coaching" element={<Coaching />} />
      <Route path="/services/placement" element={<Placement />} />

      <Route path="/entrar" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/solicitar"
        element={
          <ProtectedRoute>
            <Solicitar />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
