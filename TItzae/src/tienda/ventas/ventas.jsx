import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {jwtDecode} from "jwt-decode"; // corregí importación, sin llaves
import logo from "../../assets/preview.jpg";
import "./ventas.css";

const Ventas = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [ventas, setVentas] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState(null);
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [ventasDelMes, setVentasDelMes] = useState([]);
  const [totalDia, setTotalDia] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const ventasPorPagina = 6;

  // Estado para guardar fecha actual usada en filtro
  const [fechaGuardada, setFechaGuardada] = useState({
    dia: new Date().getDate(),
    mes: new Date().getMonth(),
    anio: new Date().getFullYear(),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setNombreUsuario(decoded.nombreU);
        obtenerVentas(token);
      } catch (err) {
        console.error("Token inválido:", err);
      }
    }
  }, []);

  // Este efecto controla la verificación periódica del cambio de día/mes/año
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const intervalo = setInterval(() => {
      const ahora = new Date();
      const diaActual = ahora.getDate();
      const mesActual = ahora.getMonth();
      const anioActual = ahora.getFullYear();

      if (
        diaActual !== fechaGuardada.dia ||
        mesActual !== fechaGuardada.mes ||
        anioActual !== fechaGuardada.anio
      ) {
        obtenerVentas(token);
        setFechaGuardada({ dia: diaActual, mes: mesActual, anio: anioActual });
      }
    }, 60000); // revisa cada minuto

    return () => clearInterval(intervalo);
  }, [fechaGuardada]);

  const obtenerVentas = async (token) => {
    try {
      const res = await fetch("http://localhost:4000/tienda/sales/listar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVentas(data);
        filtrarTotales(data);
      } else {
        console.error("Error al obtener ventas");
      }
    } catch (err) {
      console.error("Error de red:", err);
    }
  };

  const filtrarTotales = (ventas) => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const ventasHoy = ventas.filter((v) => {
      const fecha = new Date(v.fecha);
      return (
        fecha.getDate() === hoy.getDate() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getFullYear() === hoy.getFullYear()
      );
    });

    const ventasMes = ventas.filter((v) => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    const totalHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);

    setVentasDelDia(ventasHoy);
    setVentasDelMes(ventasMes);
    setTotalDia(totalHoy);
    setTotalMes(totalMes);
  };

  const verDetalle = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:4000/tienda/sales/listar/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDetalleVenta(data);
      } else {
        Swal.fire("Error", data.error || "No se pudo obtener el detalle", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error de red al obtener detalle", "error");
    }
  };

  const cerrarSesion = () => {
    Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  };

  const irAInicio = () => (window.location.href = "/home");
  const irAProductos = () => (window.location.href = "/store");

  // Paginación
  const totalPaginas = Math.ceil(ventas.length / ventasPorPagina);
  const ventasPaginadas = ventas.slice(
    (paginaActual - 1) * ventasPorPagina,
    paginaActual * ventasPorPagina
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img className="sidebar-logo" src={logo} alt="logo" />
          <h2 className="sidebar-title">{nombreUsuario}</h2>
        </div>
        <ul className="sidebar-nav">
          <li onClick={irAInicio}>
            <span>🏠</span> Inicio
          </li>
          <li onClick={irAProductos}>
            <span>🛒</span> Productos
          </li>
          <li>
            <span>📊</span> Ventas
          </li>
          <li>
            <span>👥</span> Usuarios
          </li>
          <li onClick={cerrarSesion}>
            <span>🚪</span> Cerrar sesión
          </li>
        </ul>
      </aside>

      <main className="ventas-main">
        <h2 className="ventas-title">📊 Historial de Ventas</h2>

        <div className="ventas-resumen">
          <div className="resumen-card">
            <h4>🗓️ Total de Hoy</h4>
            <p>S/ {totalDia.toFixed(2)}</p>
            <p>{ventasDelDia.length} venta(s)</p>
          </div>
          <div className="resumen-card">
            <h4>📅 Total del Mes</h4>
            <p>S/ {totalMes.toFixed(2)}</p>
            <p>{ventasDelMes.length} venta(s)</p>
          </div>
        </div>

        <div className="ventas-contenedor">
          <div className="ventas-grid">
            {ventasPaginadas.map((venta) => (
              <div
                key={venta.id_venta}
                className="venta-card"
                onClick={() => verDetalle(venta.id_venta)}
              >
                <h4>Venta #{venta.id_venta}</h4>
                <p>📅 {new Date(venta.fecha).toLocaleString()}</p>
                <p>💳 Pago: {venta.pago}</p>
                <p>💰 Total: S/ {venta.total?.toFixed(2)}</p>
                <p>💵 Recibido: S/ {venta.monto_entregado?.toFixed(2)}</p>
                <p>🤑 Vuelto: S/ {venta.monto_recibido?.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {detalleVenta && (
            <div className="detalle-card">
              <h3>🧾 Detalle Venta #{detalleVenta.id_venta}</h3>
              <p>
                <strong>Fecha:</strong> {new Date(detalleVenta.fecha).toLocaleString()}
              </p>
              <p>
                <strong>Forma de pago:</strong> {detalleVenta.pago}
              </p>
              <p>
                <strong>Total:</strong> S/ {detalleVenta.total?.toFixed(2)}
              </p>
              <p>
                <strong>Recibido:</strong> S/ {detalleVenta.monto_entregado?.toFixed(2)}
              </p>
              <p>
                <strong>Vuelto:</strong> S/ {detalleVenta.monto_recibido?.toFixed(2)}
              </p>
              <hr />
              <ul>
                {detalleVenta.productos?.map((prod, i) => (
                  <li key={i}>
                    {prod.nombre} — Cant: {prod.cantidad} — S/ {prod.precio_unitario}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="paginacion">
          <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
            ◀ Anterior
          </button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente ▶
          </button>
        </div>
      </main>
    </div>
  );
};

export default Ventas;
