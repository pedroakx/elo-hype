import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import StaffRoute from "./components/staffRoute/StaffRoute";
import PageLoader from "./components/pageLoader/PageLoader";

// Páginas fora da Home só são baixadas pelo navegador quando o
// visitante realmente navega até elas (code-splitting por rota).
const EloBoost = lazy(() => import("./pages/services/EloBoost"));
const DuoBoost = lazy(() => import("./pages/services/DuoBoost"));
const Coaching = lazy(() => import("./pages/services/Coaching"));
const Placement = lazy(() => import("./pages/services/Placement"));

const Login = lazy(() => import("./pages/auth/Login"));
const Cadastro = lazy(() => import("./pages/auth/Cadastro"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Solicitar = lazy(() => import("./pages/request/Solicitar"));
const PagamentoRetorno = lazy(() => import("./pages/request/PagamentoRetorno"));

const StaffLogin = lazy(() => import("./pages/staff/StaffLogin"));
const StaffPanel = lazy(() => import("./pages/staff/StaffPanel"));
const StaffRanking = lazy(() => import("./pages/staff/StaffRanking"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));

const NotFound = lazy(() => import("./pages/notFound/NotFound"));
const Termos = lazy(() => import("./pages/legal/Termos"));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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

        <Route
          path="/pagamento/retorno"
          element={
            <ProtectedRoute>
              <PagamentoRetorno />
            </ProtectedRoute>
          }
        />

        <Route path="/equipe/entrar" element={<StaffLogin />} />

        <Route
          path="/equipe/painel"
          element={
            <StaffRoute>
              <StaffPanel />
            </StaffRoute>
          }
        />

        <Route
          path="/equipe/ranking"
          element={
            <StaffRoute>
              <StaffRanking />
            </StaffRoute>
          }
        />

        <Route
          path="/equipe/perfil"
          element={
            <StaffRoute>
              <StaffProfile />
            </StaffRoute>
          }
        />

        <Route path="/termos" element={<Termos />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
