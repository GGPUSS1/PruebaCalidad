import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/preview.jpg"
import Swal from 'sweetalert2';
import './login.css'


const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

const Login = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/tienda/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dni, contrasena }),
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        Toast.fire({
        icon: "success",
        title: "Logeado exitosamente",
});
  setTimeout(() => {
    navigate("/store");
  }, 1000);
} else {
        setMensaje(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div className="form">
      <form className="formM" onSubmit={handleSubmit}>
        <img className="logo" src={logo} alt="" />
        <input
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default Login;
