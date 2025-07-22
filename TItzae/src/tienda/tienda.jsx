import React, { useEffect, useState } from 'react';
import './tienda.css';
import { AgregarProducto } from '../tienda/addProduct/addProduct.jsx';
import logo from "../assets/preview.jpg";
import campana from "../assets/campana.png";
import noEncontrado from "../assets/noEncontrado.png";
import {jwtDecode} from "jwt-decode";
import Swal from "sweetalert2";

export const Tienda = () => {
  const [productos, setProductos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setNombreUsuario(decoded.nombreU);
      } catch (err) {
        console.error("Token inválido:", err);
      }

      fetchProductos(token);
    }
  }, []);

  const fetchProductos = async (token) => {
    try {
      const res = await fetch("http://localhost:4000/tienda/product/listar", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProductos(data);

        const bajos = data.filter(p => p.cantidad <= 4);
        setProductosBajoStock(bajos);
      } else {
        console.error("No autorizado o error en el servidor");
      }
    } catch (err) {
      console.error("Error al obtener productos:", err);
    }
  };

  const eliminarProducto = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/tienda/product/eliminar/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Eliminado", data.menssage || "Producto eliminado correctamente", "success");
          fetchProductos(token);
        } else {
          Swal.fire("Error", data.menssage || "No se pudo eliminar", "error");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Error del servidor al eliminar", "error");
      }
    }
  };

  const actualizarProducto = async (producto) => {
    const { value: formValues } = await Swal.fire({
      title: "Actualizar producto",
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre" value="${producto.nombre}">
        <input id="imagen" class="swal2-input" placeholder="Imagen URL" value="${producto.imagen}">
        <input id="precio" type="number" class="swal2-input" placeholder="Precio" value="${producto.precio}">
        <input id="descripcion" class="swal2-input" placeholder="Descripción" value="${producto.descripcion}">
        <input id="cantidad" type="number" class="swal2-input" placeholder="Cantidad" value="${producto.cantidad}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          nombre: document.getElementById("nombre").value,
          imagen: document.getElementById("imagen").value,
          precio: parseFloat(document.getElementById("precio").value),
          descripcion: document.getElementById("descripcion").value,
          cantidad: parseInt(document.getElementById("cantidad").value),
        };
      },
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/tienda/product/actualizar/${producto.id_producto}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(formValues),
        });

        const data = await res.json();
        if (res.ok) {
          Swal.fire("Actualizado", data.menssage || "Producto actualizado correctamente", "success");
          fetchProductos(token);
        } else {
          Swal.fire("Error", data.menssage || "No se pudo actualizar", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Error del servidor al actualizar", "error");
      }
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

  const Tienda = () => {
    window.location.href = "/store";
  };

  const Home = () => {
    window.location.href = "/home";
  };
  const Ventas = () => {
    window.location.href = "/ventas";
  };

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación: cálculo del índice de productos a mostrar
  const indexUltimoProducto = paginaActual * productosPorPagina;
  const indexPrimerProducto = indexUltimoProducto - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexPrimerProducto, indexUltimoProducto);

  // Número total de páginas
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  // Cambiar página
  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina < 1) numeroPagina = 1;
    else if (numeroPagina > totalPaginas) numeroPagina = totalPaginas;
    setPaginaActual(numeroPagina);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img className="sidebar-logo" src={logo} alt="logo" />
          <h2 className="sidebar-title">{nombreUsuario}</h2>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li onClick={Home} style={{ cursor: "pointer" }}><span>🏠</span> Inicio</li>
            <li onClick={Tienda} style={{ cursor: "pointer" }}><span>🛒</span> Productos</li>
            <li onClick={Ventas} style={{ cursor: "pointer" }}><span>📊</span> Ventas</li>
            <li><span>👥</span> Usuarios</li>
            <li onClick={cerrarSesion} style={{ cursor: "pointer" }}>
              <span>🚪</span> Cerrar sesión
            </li>
          </ul>
        </nav>
      </aside>

      <main className="tienda-container">
        <div className="buscador-container">
          <input
            type="text"
            placeholder="🔍 Buscar producto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1); // Resetear página al hacer búsqueda
            }}
            className="buscador-input"
          />
          <AgregarProducto onProductoCreado={() => fetchProductos(localStorage.getItem("token"))} />

          {/* Campana de notificación usando imagen */}
          <div
            className="notificacion-bajo-stock"
            onClick={() => setShowModal(true)}
            style={{ position: 'relative', cursor: 'pointer', width: '38px', height: '38px' }}
            title={productosBajoStock.length > 0 ? `${productosBajoStock.length} productos con bajo stock` : 'No hay notificaciones'}
          >
            <img
              src={campana}
              alt="Notificaciones"
              style={{
                width: '28px',
                height: '28px',
                filter: productosBajoStock.length > 0 ? 'drop-shadow(0 0 4px #ff3b3b)' : 'grayscale(100%)',
                animation: productosBajoStock.length > 0 ? 'shake 0.5s infinite' : 'none',
                userSelect: 'none',
                transition: 'filter 0.3s ease',
              }}
            />
            {productosBajoStock.length > 0 && (
              <span
                className="notificacion-badge"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#ff3b3b',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '3px 7px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                {productosBajoStock.length}
              </span>
            )}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-notificaciones" onClick={(e) => e.stopPropagation()}>
              <h3>📦 Notificaciones</h3>
              {productosBajoStock.length === 0 ? (
                <p>No hay productos con stock bajo.</p>
              ) : (
                <ul>
                  {productosBajoStock.map((prod) => (
                    <li key={prod.id_producto}>
                      {prod.nombre} — Stock: {prod.cantidad}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        <div className="products-list">
          {productosPaginados.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src={noEncontrado} alt="No encontrado" style={{ width: "150px" }} />
              <p>No se encontraron productos.</p>
            </div>
          ) : (
            productosPaginados.map((prod) => (
              <div key={prod.id_producto} className="product-card">
                <img
                  src={prod.imagen}
                  alt={prod.nombre}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = noEncontrado;
                  }}
                />
                <div className="product-name">{prod.nombre}</div>
                <div className="product-price">S/.{prod.precio}</div>
                <div className='product-name'>Stock: {prod.cantidad}</div>
                <div className="product-description">{prod.descripcion}</div>
                <div className="product-buttons">
                  <button className="btn-edit" onClick={() => actualizarProducto(prod)}>Actualizar</button>
                  <button className="btn-delete" onClick={() => eliminarProducto(prod.id_producto)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controles de paginación */}
        {totalPaginas > 1 && (
          <div className="pagination">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="pagination-btn"
            >
              &laquo; Anterior
            </button>

            {/* Botones para cada página */}
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => cambiarPagina(i + 1)}
                className={`pagination-btn ${paginaActual === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="pagination-btn"
            >
              Siguiente &raquo;
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
