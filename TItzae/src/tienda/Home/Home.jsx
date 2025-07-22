import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import ReactSelect from 'react-select';
import logo from "../../assets/preview.jpg";
import "./Home.css";

const Home = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [productos, setProductos] = useState([]);
  const [ventaItems, setVentaItems] = useState([
    { id: Date.now(), productoId: "", nombre: "", precio: 0, cantidad: 1 }
  ]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoEntregado, setMontoEntregado] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setNombreUsuario(decoded.nombreU);
        fetchProductos(token);
      } catch (err) {
        console.error("Token inválido:", err);
      }
    }
  }, []);

  const fetchProductos = async (token) => {
    try {
      const res = await fetch("http://localhost:4000/tienda/product/listar", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
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

  const Tienda = () => window.location.href = "/store";
  const Ventas = () => window.location.href = "/ventas";

  const agregarFila = () => {
    setVentaItems([
      ...ventaItems,
      { id: Date.now(), productoId: "", nombre: "", precio: 0, cantidad: 1 }
    ]);
  };

  const eliminarFila = (id) => {
    setVentaItems(ventaItems.filter(item => item.id !== id));
  };

  const handleCambioProducto = (index, productoId) => {
    const productoSeleccionado = productos.find(
      p => p.id_producto === parseInt(productoId)
    );
    const nuevosItems = [...ventaItems];
    nuevosItems[index] = {
      ...nuevosItems[index],
      productoId,
      nombre: productoSeleccionado?.nombre || "",
      precio: parseFloat(productoSeleccionado?.precio || 0),
      cantidad: 1,
    };
    setVentaItems(nuevosItems);
  };

  const handleCambioCantidad = (index, cantidad) => {
    const nuevosItems = [...ventaItems];
    nuevosItems[index].cantidad = cantidad;
    setVentaItems(nuevosItems);
  };

  const calcularSubtotal = (item) => {
    const cantidad = parseInt(item.cantidad);
    return item.precio * (isNaN(cantidad) ? 0 : cantidad);
  };

  const total = ventaItems.reduce((sum, item) => sum + calcularSubtotal(item), 0);
  const vueltoCalculado = parseFloat(montoEntregado || 0) - total;

  const registrarVenta = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No estás autenticado", "error");
      return;
    }

    const productosVenta = ventaItems
      .filter(item => item.productoId && item.cantidad > 0)
      .map(item => ({
        id_producto: parseInt(item.productoId),
        cantidad: parseInt(item.cantidad),
        precio_unitario: item.precio,
      }));

    if (productosVenta.length === 0) {
      Swal.fire("Error", "Debes agregar al menos un producto válido", "error");
      return;
    }
console.log('montoEntregado:', montoEntregado, 'total:', total);

    const montoNum = parseFloat(montoEntregado);
    if (isNaN(montoNum) || montoNum < total) {
      Swal.fire("Error", "El monto entregado debe ser mayor o igual al total", "error");
      return;
    }
    


    try {
      const res = await fetch("http://localhost:4000/tienda/sales/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productos: productosVenta,
          pago: metodoPago,
          montoE: parseFloat(montoEntregado),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Venta registrada", "Has registrado la venta correctamente", "success");
        setVentaItems([{ id: Date.now(), productoId: "", nombre: "", precio: 0, cantidad: 1 }]);
        setMetodoPago("efectivo");
        setMontoEntregado("");
      } else {
        Swal.fire("Error", data.error || "No se pudo registrar la venta", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error al conectar con el servidor", "error");
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
          <li><span>🏠</span> Inicio</li>
          <li onClick={Tienda} style={{ cursor: "pointer" }}><span>🛒</span> Productos</li>
          <li onClick={Ventas} style={{ cursor: "pointer"}}><span>📊</span> Ventas</li>
          <li><span>👥</span> Usuarios</li>
          <li onClick={cerrarSesion} style={{ cursor: "pointer" }}><span>🚪</span> Cerrar sesión</li>
        </ul>
      </aside>

      <main className="venta-main">
        <h2 className="venta-title">🧾 Registro de Venta</h2>

        <div className="venta-layout">
          <div className="venta-formulario">
            {ventaItems.map((item, index) => {
              const opciones = productos
                .filter(p => p.id_producto && p.nombre)
                .map(p => ({ value: p.id_producto, label: p.nombre }));

              const selectedOption = opciones.find(o => o.value === parseInt(item.productoId)) || null;

              return (
                <div key={item.id} className="venta-card">
                  <ReactSelect
                    options={opciones}
                    value={selectedOption}
                    onChange={(option) => handleCambioProducto(index, option ? option.value : "")}
                    placeholder="Seleccione producto"
                    isClearable
                    styles={{
                      container: base => ({ ...base, minWidth: 180, flexShrink: 0 }),
                      control: base => ({ ...base, fontSize: '1rem', borderRadius: '6px' }),
                    }}
                  />

                  <input type="text" readOnly value={`S/ ${item.precio.toFixed(2)}`} />
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={e => handleCambioCantidad(index, e.target.value)}
                  />
                  <input
                    type="text"
                    readOnly
                    value={`S/ ${calcularSubtotal(item).toFixed(2)}`}
                  />

                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarFila(item.id)}
                    title="Eliminar producto"
                  >
                    ✖
                  </button>
                </div>
              );
            })}

            <button className="btn-agregar" onClick={agregarFila}>+ Agregar Producto</button>
          </div>

          <div className="venta-ticket">
            <h3>🧾 Detalle de Venta</h3>
            {ventaItems.map((item) => (
              <div key={item.id} className="producto-ticket">
                <div>
                  <strong>{item.nombre}</strong>
                  <p>Cant: {item.cantidad} · S/ {item.precio.toFixed(2)} c/u</p>
                </div>
                <div>
                  <span>S/ {calcularSubtotal(item).toFixed(2)}</span>
                </div>
              </div>
            ))}

            <div className="venta-total">
              <strong>Total:</strong>
              <span>S/ {total.toFixed(2)}</span>
            </div>

            <div className="venta-pago">
              <label htmlFor="metodoPago">Forma de pago:</label>
              <select
                id="metodoPago"
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="yape">Yape</option>
              </select>
            </div>

            <div className="venta-pago">
              <label htmlFor="montoEntregado">Monto entregado:</label>
              <input
                type="number"
                id="montoEntregado"
                value={montoEntregado}
                onChange={e => setMontoEntregado(e.target.value)}
                min="0"
              />
            </div>

            <div className="venta-total">
              <strong>Vuelto:</strong>
              <span style={{ color: vueltoCalculado < 0 ? 'red' : 'black' }}>
                S/ {vueltoCalculado.toFixed(2)}
              </span>
            </div>

            <button
              className="btn-registrar"
              onClick={registrarVenta}
            >
              💾 Registrar Venta
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
