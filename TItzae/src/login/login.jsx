import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/preview.jpg";
import Swal from 'sweetalert2';
import './login.css';

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

export var nombreU = undefined;

const Login = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [contrasena, setContrasena] = useState("");

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
          navigate("/home");
        }, 1000);
      } else {
        Toast.fire({
          icon: "error",
          title: "Error al iniciar sesión",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#d33"
      });
    }
  };

  return (
    <div className="form">
      <form className="formM" onSubmit={handleSubmit}>
        <img className="logo" src={logo} alt="imagen" />
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
    </div>
  );
};

export default Login;
