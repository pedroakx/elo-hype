import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";

import EloBoost from "./pages/services/EloBoost";
import DuoBoost from "./pages/services/DuoBoost";
import Coaching from "./pages/services/Coaching";
import Placement from "./pages/services/Placement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/services/elo-boost" element={<EloBoost />} />
      <Route path="/services/duo-boost" element={<DuoBoost />} />
      <Route path="/services/coaching" element={<Coaching />} />
      <Route path="/services/placement" element={<Placement />} />
    </Routes>
  );
}

export default App;