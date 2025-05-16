import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Tienda } from "./tienda/tienda";
import Login from "./login/login";
import RutaPrivada from "./components/routeSafe";
import Home from "./tienda/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaPrivada></RutaPrivada>} />
        <Route path="/home" element={<RutaPrivada><Home /></RutaPrivada>} /> 
        <Route path="/store" element={<RutaPrivada><Tienda /></RutaPrivada>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
