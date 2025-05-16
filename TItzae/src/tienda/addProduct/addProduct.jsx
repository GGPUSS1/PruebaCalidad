import React, { useState } from "react";
import Swal from "sweetalert2";
import "./addProduct.css";

export const AgregarProducto = ({ onProductoCreado }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    imagen: "",
    precio: "",
    descripcion: "",
    cantidad: ""
  });

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:4000/tienda/product/crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(nuevoProducto)
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Producto agregado",
        showConfirmButton: false,
        timer: 1000
      });
      setMostrarModal(false);
      setNuevoProducto({
        nombre: "",
        imagen: "",
        precio: "",
        descripcion: "",
        cantidad: ""
      });
      onProductoCreado && onProductoCreado();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al agregar producto",
        text: "Intenta nuevamente"
      });
    }
  };

  return (
    <>
      <button className="crear-btn" onClick={() => setMostrarModal(true)}>
        + Agregar Producto
      </button>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Agregar Producto</h2>
            <form onSubmit={handleCrearProducto}>
              <input type="text" placeholder="Nombre" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} required />
              <input type="text" placeholder="URL Imagen" value={nuevoProducto.imagen} onChange={e => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })} required />
              <input type="number" placeholder="Precio" value={nuevoProducto.precio} onChange={e => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} required />
              <input type="text" placeholder="Descripción" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} required />
              <input type="number" placeholder="Cantidad" value={nuevoProducto.cantidad} onChange={e => setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })} required />
              <div className="modal-botones">
                <button type="submit" className="submit-btn">Guardar</button>
                <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
