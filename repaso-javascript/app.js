// --- 1. ESTADO DE LA APLICACIÓN ---
let transacciones = [];

// --- 2. SELECTORES DEL DOM ---
const formulario = document.getElementById('finance-form');
const tablaCuerpo = document.getElementById('lista-transacciones');
const displayIngresos = document.getElementById('total-ingresos');
const displayEgresos = document.getElementById('total-egresos');
const displayBalance = document.getElementById('balance-total');

// --- 3. FUNCIONES DE PERSISTENCIA (LOCAL STORAGE) ---

function guardarEnStorage() {
    // Guardamos el array convertido en texto
    localStorage.setItem('finanzas_data', JSON.stringify(transacciones));
}

function cargarDeStorage() {
    const datos = localStorage.getItem('finanzas_data');
    if (datos) {
        // Convertimos el texto de vuelta a un array de objetos
        transacciones = JSON.parse(datos);
        renderizarApp();
    }
}

// --- 4. FUNCIÓN DE EXPORTACIÓN (CSV) ---

function exportarCSV() {
    if (transacciones.length === 0) return alert("No hay datos para exportar");

    // Cabecera del CSV
    let csvContent = "Descripcion,Tipo,Monto\n";

    // Unimos los datos
    transacciones.forEach(t => {
        csvContent += `${t.descripcion},${t.tipo},${t.monto}\n`;
    });

    // Creamos el archivo y lo descargamos
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mis_finanzas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// --- 5. LÓGICA DE NEGOCIO ---

function agregarTransaccion(descripcion, tipo, monto) {
    const nuevaTransaccion = {
        id: Date.now(),
        descripcion,
        tipo,
        monto: parseFloat(monto)
    };

    transacciones.push(nuevaTransaccion);
    renderizarApp();
}

function eliminarTransaccion(id) {
    // Filtramos para quitar el ID seleccionado
    transacciones = transacciones.filter(item => item.id !== id);
    renderizarApp();
}

function renderizarApp() {
    tablaCuerpo.innerHTML = '';
    let totalIngresos = 0;
    let totalEgresos = 0;

    transacciones.forEach(item => {
        if (item.tipo === 'ingreso') totalIngresos += item.monto;
        else totalEgresos += item.monto;

        const fila = document.createElement('tr');
        const colorMonto = item.tipo === 'ingreso' ? '#22c55e' : '#ef4444';
        
        fila.innerHTML = `
            <td>${item.descripcion}</td>
            <td>${item.tipo.toUpperCase()}</td>
            <td style="color: ${colorMonto}; font-weight: bold;">
                ${item.tipo === 'ingreso' ? '+' : '-'}$${item.monto.toFixed(2)}
            </td>
            <td>
                <button onclick="eliminarTransaccion(${item.id})" style="background:none; border:none; cursor:pointer;">Eliminar</button>
            </td>
        `;
        tablaCuerpo.prepend(fila);
    });

    const balanceNeto = totalIngresos - totalEgresos;
    displayIngresos.textContent = `$${totalIngresos.toFixed(2)}`;
    displayEgresos.textContent = `$${totalEgresos.toFixed(2)}`;
    displayBalance.textContent = `$${balanceNeto.toFixed(2)}`;
    displayBalance.style.color = balanceNeto < 0 ? "#ef4444" : "#ffffff";

    // CADA VEZ QUE RENDERIZAMOS, GUARDAMOS EN EL NAVEGADOR
    guardarEnStorage();
}

// --- 6. EVENT LISTENERS ---

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('descripcion').value;
    const tipo = document.getElementById('tipo').value;
    const monto = document.getElementById('cantidad').value;

    if (desc.trim() === '' || monto <= 0) return;

    agregarTransaccion(desc, tipo, monto);
    formulario.reset();
});

// --- INICIO DE LA APP ---
// Al cargar el script, intentamos recuperar datos previos
cargarDeStorage();