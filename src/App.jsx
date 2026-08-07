import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import StaffRoute from "./components/staffRoute/StaffRoute";
import PageLoader from "./components/pageLoader/PageLoader";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";

// Páginas públicas
import Home from "./pages/home/Home";

// Serviços
const EloBoost = lazy(() => import("./pages/services/EloBoost"));
const DuoBoost = lazy(() => import("./pages/services/DuoBoost"));
const Coaching = lazy(() => import("./pages/services/Coaching"));
const Placement = lazy(() => import("./pages/services/Placement"));

// Auth
const Login = lazy(() => import("./pages/auth/Login"));
const Cadastro = lazy(() => import("./pages/auth/Cadastro"));
const RecuperarSenha = lazy(() => import("./pages/auth/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("./pages/auth/RedefinirSenha"));

// Cliente
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Solicitar = lazy(() => import("./pages/request/Solicitar"));
const PagamentoRetorno = lazy(() =>
  import("./pages/request/PagamentoRetorno")
);

// Staff
const StaffLogin = lazy(() => import("./pages/staff/StaffLogin"));
const StaffPanel = lazy(() => import("./pages/staff/StaffPanel"));
const StaffRanking = lazy(() => import("./pages/staff/StaffRanking"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));

// Outros
const NotFound = lazy(() => import("./pages/notFound/NotFound"));
const Termos = lazy(() => import("./pages/legal/Termos"));


function App() {
  const location = useLocation();

  const isStaffArea = location.pathname.startsWith("/equipe");


  return (
    <>
      {!isStaffArea && <Navbar />}

      <main className={!isStaffArea ? "app-content" : ""}>
        <ScrollToTop />

        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* Home */}
            <Route path="/" element={<Home />} />


            {/* Serviços */}
            <Route
              path="/services/elo-boost"
              element={<EloBoost />}
            />

            <Route
              path="/services/duo-boost"
              element={<DuoBoost />}
            />

            <Route
              path="/services/coaching"
              element={<Coaching />}
            />

            <Route
              path="/services/placement"
              element={<Placement />}
            />


            {/* Auth */}
            <Route
              path="/entrar"
              element={<Login />}
            />

            <Route
              path="/cadastro"
              element={<Cadastro />}
            />

            <Route
              path="/recuperar-senha"
              element={<RecuperarSenha />}
            />

            <Route
              path="/redefinir-senha"
              element={<RedefinirSenha />}
            />


            {/* Cliente */}
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


            {/* Staff */}
            <Route
              path="/equipe/entrar"
              element={<StaffLogin />}
            />


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


            {/* Legal */}
            <Route
              path="/termos"
              element={<Termos />}
            />


            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </Suspense>
      </main>
    </>
  );
}


export default App;