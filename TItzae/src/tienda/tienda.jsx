import React, { useEffect, useState } from 'react';
import './tienda.css';  // Asegúrate de importar el archivo CSS

export const Tienda = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      const token = localStorage.getItem("token");

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
    };

    fetchProductos();
  }, []);

  return (
    <div className="tienda-container">
      <h1>Productos Disponibles</h1>
      <div className="products-list">
        {productos.map((prod) => (
          <div key={prod.id_producto} className="product-card">
            <img src={prod.imagen} alt={prod.nombre} />
            <div className="product-name">{prod.nombre}</div>
            <div className="product-price">S/.{prod.precio}</div>
            <div className="product-description">{prod.descripcion}</div>
            <button className="add-to-cart-btn">Agregar</button>
          </div>
        ))}
      </div>
    </div>
  );
};
