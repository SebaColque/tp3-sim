import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    lotePedido: 10,
    stockInicialA: 40,
    stockInicialB: 40,
    diasEntrePedidosA: 7,
    diasEntrePedidosB: 10,
    diasASimularA: 120,
    diasASimularB: 120,
    costoMantenimientoA: 3,
    costoMantenimientoB: 3,
    costoStockOutA: 4,
    costoStockOutB: 4
  });

  const [mostrarTablas, setMostrarTablas] = useState(false);

  const [tablaSimulacionA, setTablaSimulacionA] = useState([]);
  const [tablaSimulacionB, setTablaSimulacionB] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('Datos del formulario:', formData);
    generarTablaSimulacionA();
    generarTablaSimulacionB();
    setMostrarTablas(true);
  };


  const calcularDemanda = (random) => {
    const probabilidades = [
      { demanda: 0, desde: 0.00, hasta: 0.049 },
      { demanda: 10, desde: 0.05, hasta: 0.169 },
      { demanda: 20, desde: 0.17, hasta: 0.349 },
      { demanda: 30, desde: 0.35, hasta: 0.599 },
      { demanda: 40, desde: 0.60, hasta: 0.819 },
      { demanda: 50, desde: 0.82, hasta: 0.999 }
    ];

    for (let i = 0; i < probabilidades.length; i++) {
      if (random >= probabilidades[i].desde && random <= probabilidades[i].hasta) {
        return probabilidades[i].demanda;
      }
    }
    return null; // Por si acaso el random no cae en ningún intervalo, aunque no debería suceder.
  };

  const calcularDemora = (random) => {
    const probabilidadesDemora = [
      { demora: 1, desde: 0.00, hasta: 0.149 },
      { demora: 2, desde: 0.15, hasta: 0.349 },
      { demora: 3, desde: 0.35, hasta: 0.749 },
      { demora: 4, desde: 0.75, hasta: 0.999 }
    ];

    for (let i = 0; i < probabilidadesDemora.length; i++) {
      if (random >= probabilidadesDemora[i].desde && random <= probabilidadesDemora[i].hasta) {
        return probabilidadesDemora[i].demora;
      }
    }
    return null; // Por si acaso el random no cae en ningún intervalo, aunque no debería suceder.
  };

  const calcularCostoPedido = (demanda) => {
    const decenasPedidas = [
      { costo: 20, desde: 0, hasta: 20},
      { costo: 25, desde: 21, hasta: 40},
      { costo: 30, desde: 41, hasta: 99999999},
    ]

    for (let i = 0; i < decenasPedidas.length; i++) {
      if (demanda >= decenasPedidas[i].desde && demanda <= decenasPedidas[i].hasta) {
        return decenasPedidas[i].costo;
      }
    }
    return null; // Por si acaso el random no cae en ningún intervalo, aunque no debería suceder
  }

  const handleCalcular = () => {
    const randomDemanda = Math.random();
    const randomDemora = Math.random();
    const randomDecenasPedidas = 15;
    const demanda = calcularDemanda(randomDemanda);
    const demora = calcularDemora(randomDemora);
    const costoPedido = calcularCostoPedido(randomDecenasPedidas)
    console.log(`Random Demanda: ${randomDemanda}, Demanda: ${demanda}`);
    console.log(`Random Demora: ${randomDemora}, Demora: ${demora}`);
    console.log(`Decenas Pedidas: ${randomDecenasPedidas}, Costo: ${costoPedido}`);
  };

  const generarTablaSimulacionA = () => {
    const tabla = [];
    let stock = parseInt(formData.stockInicialA); // Inicializar el stock
    let diaLlegadaPedido;
    let cantidadProductosPedidos;

    for (let i = 1; i <= parseInt(formData.diasASimularA); i++) {
      const randomDemanda = Math.random();
      const demanda = calcularDemanda(randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2));

      const pedido = i % parseInt(formData.diasEntrePedidosA) === 0;

      const randomDemora = Math.random();
      const demora = calcularDemora(randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2));

      const llegadaPedido = pedido ? i + demora : '-';
      
      const lotePedido = pedido ? parseInt(formData.lotePedido) : 0;
      if(pedido){
        diaLlegadaPedido = llegadaPedido;
        cantidadProductosPedidos = lotePedido;
      }

      const costoPedido = pedido ? calcularCostoPedido(parseInt(formData.lotePedido)) : 0;
      const costoMantenimiento = (stock-demanda) <= 0 ? 0 : (stock-demanda) * parseInt(formData.costoMantenimientoA)*10;
      const costoStockOut = i==diaLlegadaPedido 
                            ? (demanda > stock ? (demanda - stock - cantidadProductosPedidos) * parseInt(formData.costoStockOutA)*10 : 0)
                            : (demanda > stock ? (demanda - stock) * parseInt(formData.costoStockOutA)*10 : 0);
      const costoTotal = costoPedido + costoMantenimiento + costoStockOut;

      const stockInicioDia = (i==diaLlegadaPedido) ? (stock + cantidadProductosPedidos) : stock;
      stock = (stock - demanda + (i==diaLlegadaPedido ? parseInt(formData.lotePedido) : 0)) <= 0 
              ? 0 
              : (stock - demanda + (i==diaLlegadaPedido ? parseInt(formData.lotePedido) : 0));

      tabla.push({
        reloj: i,
        rndDemanda: randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2),
        demanda,
        rndDemora: pedido ? (randomDemora.toFixed(2)==1.00 ? 0.99 : randomDemora.toFixed(2)) : '-',
        demora: pedido ? demora : '-',
        pedido: pedido ? 'Sí' : 'No',
        llegadaPedido,
        stockInicioDia,
        stock,
        costoPedido,
        costoMantenimiento,
        costoStockOut,
        costoTotal,
        costoAcumulado: tabla.reduce((acc, curr) => acc + curr.costoTotal, costoTotal)
      });
    }

    setTablaSimulacionA(tabla);
  };


  const generarTablaSimulacionB = () => {
    const tabla = [];
    let stock = parseInt(formData.stockInicialB); // Inicializar el stock
    let diaLlegadaPedido;
    let cantidadProductosPedidos;
    let acumuladorDemanda = 0;
    let yaSePidio = false;

    for (let i = 1; i <= parseInt(formData.diasASimularB); i++) {
      const randomDemanda = Math.random();
      const demanda = calcularDemanda(randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2));

      const pedido = i % parseInt(formData.diasEntrePedidosB) === 0;

      const randomDemora = Math.random();
      const demora = calcularDemora(randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2));

      const llegadaPedido = pedido ? i + demora : '-';
      
      // const lotePedido = pedido ? parseInt(formData.lotePedido) : 0;
      if(!pedido){
        if(yaSePidio){
          acumuladorDemanda = 0;
          yaSePidio = false;
        }
      }
      if(pedido){
        diaLlegadaPedido = llegadaPedido;
        acumuladorDemanda += demanda
        cantidadProductosPedidos = acumuladorDemanda;
        yaSePidio = true;
      } else {
        acumuladorDemanda += demanda
      }

      const costoPedido = pedido ? calcularCostoPedido(parseInt(cantidadProductosPedidos)) : 0;
      const costoMantenimiento = (stock-demanda) <= 0 ? 0 : (stock-demanda) * parseInt(formData.costoMantenimientoB)*10;
      const costoStockOut = i==diaLlegadaPedido 
                            ? (demanda > stock ? (demanda - stock - cantidadProductosPedidos) * parseInt(formData.costoStockOutB)*10 : 0)
                            : (demanda > stock ? (demanda - stock) * parseInt(formData.costoStockOutB)*10 : 0);
      const costoTotal = costoPedido + costoMantenimiento + costoStockOut;

      const stockInicioDia = (i==diaLlegadaPedido) ? (stock + cantidadProductosPedidos) : stock;
      
      stock = (stock - demanda + (i==diaLlegadaPedido ? cantidadProductosPedidos : 0)) <= 0 
              ? 0 
              : (stock - demanda + (i==diaLlegadaPedido ? cantidadProductosPedidos : 0));

      // console.log('Dia: ' + i,
      //   'SID: '+ stockInicioDia,
      //             'stock: ' + stock,
      //             'DLLP:' + diaLlegadaPedido, 
      //             'CPP: '+ cantidadProductosPedidos,
      //             'ACD: ' + acumuladorDemanda)

      tabla.push({
        reloj: i,
        rndDemanda: randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2),
        demanda,
        rndDemora: pedido ? (randomDemanda.toFixed(2)==1.00 ? 0.99 : randomDemanda.toFixed(2)) : '-',
        demora: pedido ? demora : '-',
        pedido: pedido ? 'Sí' : 'No',
        llegadaPedido,
        stockInicioDia,
        stock,
        costoPedido,
        costoMantenimiento,
        costoStockOut,
        costoTotal,
        costoAcumulado: tabla.reduce((acc, curr) => acc + curr.costoTotal, costoTotal),
        acumuladorDemanda
      });
    }

    setTablaSimulacionB(tabla);
  };


  return (
    <div>
      <h1>Política A</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Lote de Pedido:
          <input type="number" name="lotePedido" value={formData.lotePedido} onChange={handleChange} />
        </label>
        <br />
        <label>
          Stock Inicial:
          <input type="number" name="stockInicialA" value={formData.stockInicialA} onChange={handleChange} />
        </label>
        <br />
        <label>
          Cantidad de Días entre Pedidos:
          <input type="number" name="diasEntrePedidosA" value={formData.diasEntrePedidosA} onChange={handleChange} />
        </label>
        <br />
        <label>
          Cuántos Días se Quieren Simular:
          <input type="number" name="diasASimularA" value={formData.diasASimularA} onChange={handleChange} />
        </label>
        <br />
        <label>
          Costo de Mantenimiento (por unidad):
          <input type="number" name="costoMantenimientoA" value={formData.costoMantenimientoA} onChange={handleChange} />
        </label>
        <br />
        <label>
          Costo de Stock Out (por unidad):
          <input type="number" name="costoStockOutA" value={formData.costoStockOutA} onChange={handleChange} />
        </label>

        <h1>Política B</h1>
        <label>
          Stock Inicial:
          <input type="number" name="stockInicialB" value={formData.stockInicialB} onChange={handleChange} />
        </label>
        <br />
        <label>
          Cantidad de Días entre Pedidos:
          <input type="number" name="diasEntrePedidosB" value={formData.diasEntrePedidosB} onChange={handleChange} />
        </label>
        <br />
        <label>
          Cuántos Días se Quieren Simular:
          <input type="number" name="diasASimularB" value={formData.diasASimularB} onChange={handleChange} />
        </label>
        <br />
        <label>
          Costo de Mantenimiento (por unidad):
          <input type="number" name="costoMantenimientoB" value={formData.costoMantenimientoB} onChange={handleChange} />
        </label>
        <br />
        <label>
          Costo de Stock Out (por unidad):
          <input type="number" name="costoStockOutB" value={formData.costoStockOutB} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">Enviar Formularios</button>
      </form>

      {/* <button onClick={handleCalcular}>Calcular Demanda</button> */}

      {mostrarTablas &&
      <>
      
        <h2>Política A - Tabla de Simulación</h2>
        <div className="table-wrapper-A">
          <table>
            <thead>
              <tr>
                <th>Reloj</th>
                <th>RND Demanda</th>
                <th>Demanda</th>
                <th>RND Demora</th>
                <th>Demora</th>
                <th>Orden/Pedido</th>
                <th>Llegada Pedido</th>
                <th>Stock Inicio Dia</th>
                <th>Stock Final</th>
                <th>KO</th>
                <th>KM</th>
                <th>KS</th>
                <th>Costo Total</th>
                <th>Costo Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {tablaSimulacionA.map((fila, index) => (
                <tr key={index} className={(fila.pedido=='Sí') ? 'dia-llegada-pedido' : ''}>
                  <td>{fila.reloj}</td>
                  <td>{fila.rndDemanda}</td>
                  <td>{fila.demanda}</td>
                  <td>{fila.rndDemora}</td>
                  <td>{fila.demora}</td>
                  <td>{fila.pedido}</td>
                  <td>{fila.llegadaPedido}</td>
                  <td>{fila.stockInicioDia}</td>
                  <td>{fila.stock}</td>
                  <td>{fila.costoPedido}</td>
                  <td>{fila.costoMantenimiento}</td>
                  <td>{fila.costoStockOut}</td>
                  <td>{fila.costoTotal}</td>
                  <td>{fila.costoAcumulado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <h2>Política B - Tabla de Simulación</h2>
        <div className="table-wrapper-B">
          <table>
            <thead>
              <tr>
                <th>Reloj</th>
                <th>RND Demanda</th>
                <th>Demanda</th>
                <th>RND Demora</th>
                <th>Demora</th>
                <th>Orden/Pedido</th>
                <th>Llegada Pedido</th>
                <th>Stock Inicio Dia</th>
                <th>Stock Final</th>
                <th>KO</th>
                <th>KM</th>
                <th>KS</th>
                <th>Costo Total</th>
                <th>Costo Acumulado</th>
                <th>Acumulado Demanda</th>
              </tr>
            </thead>
            <tbody>
              {tablaSimulacionB.map((fila, index) => (
                // (console.log(index, formData.diasEntrePedidosB, fila.pedido, fila.pedido=='Sí'))
                <tr key={index} className={(fila.pedido=='Sí') ? 'dia-llegada-pedido' : ''}>
                  <td>{fila.reloj}</td>
                  <td>{fila.rndDemanda}</td>
                  <td>{fila.demanda}</td>
                  <td>{fila.rndDemora}</td>
                  <td>{fila.demora}</td>
                  <td>{fila.pedido}</td>
                  <td>{fila.llegadaPedido}</td>
                  <td>{fila.stockInicioDia}</td>
                  <td>{fila.stock}</td>
                  <td>{fila.costoPedido}</td>
                  <td>{fila.costoMantenimiento}</td>
                  <td>{fila.costoStockOut}</td>
                  <td>{fila.costoTotal}</td>
                  <td>{fila.costoAcumulado}</td>
                  <td>{fila.acumuladorDemanda}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
      }


    </div>
  )
}

export default App
