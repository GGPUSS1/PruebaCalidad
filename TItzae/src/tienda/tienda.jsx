import React, { useEffect, useState } from 'react';
import './tienda.css';
import { AgregarProducto } from '../tienda/addProduct/addProduct.jsx';
import logo from "../assets/preview.jpg";
import noEncontrado from "../assets/noEncontrado.png";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

export const Tienda = () => {
  const [productos, setProductos] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [busqueda, setBusqueda] = useState("");

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
          fetchProductos(localStorage.getItem("token"));
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
          fetchProductos(localStorage.getItem("token"));
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
        window.location.href = "/login"; // Redirige al login
      }
    });
  };

  const Tienda = () =>{
    window.location.href = "/store";
  }
  
  const Home = () =>{
    window.location.href = "/home"
  }

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
            <li><span>📊</span> Ventas</li>
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
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador-input"
          />
          <AgregarProducto onProductoCreado={() => fetchProductos(localStorage.getItem("token"))} />
        </div>

        <div className="products-list">
          {productos.map((prod) => {
            const visible = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
            return (
              <div
                key={prod.id_producto}
                className="product-card"
                style={{ display: visible ? 'block' : 'none' }}
              >
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
            );
          })}
        </div>
      </main>
    </div>
  );
};
