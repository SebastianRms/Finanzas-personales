// --- 1. ESTADO DE LA APLICACIÓN ---
let transacciones = [];

// --- 2. SELECTORES DEL DOM ---
const formulario = document.getElementById('finance-form');
const tablaCuerpo = document.getElementById('lista-transacciones');
const displayIngresos = document.getElementById('total-ingresos');
const displayEgresos = document.getElementById('total-egresos');
const displayBalance = document.getElementById('balance-total');
const inputTipoOculto = document.getElementById('tipo'); // El input hidden que guarda el valor

// --- 3. LÓGICA DE LOS BOTONES DE TIPO ---
function seleccionarTipo(valor, elemento) {
    // Actualizamos el valor para el formulario
    inputTipoOculto.value = valor;

    // Quitamos la clase 'active' de todos y se la damos al clicado
    document.querySelectorAll('.btn-tipo').forEach(btn => {
        btn.classList.remove('active');
    });
    elemento.classList.add('active');
}

// --- 4. PERSISTENCIA (LOCAL STORAGE) ---
function guardarEnStorage() {
    localStorage.setItem('finanzas_data', JSON.stringify(transacciones));
}

function cargarDeStorage() {
    const datos = localStorage.getItem('finanzas_data');
    if (datos) {
        transacciones = JSON.parse(datos);
        renderizarApp();
    }
}

// --- 5. EXPORTACIÓN (CSV) ---
function exportarCSV() {
    if (transacciones.length === 0) return alert("No hay datos para exportar");

    let csvContent = "Descripcion,Tipo,Monto\n";
    transacciones.forEach(t => {
        csvContent += `${t.descripcion},${t.tipo},${t.monto}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mis_finanzas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// --- 6. LÓGICA DE NEGOCIO ---
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
                <button onclick="eliminarTransaccion(${item.id})" style="background:none; border:none; cursor:pointer; color:#94a3b8;">Eliminar</button>
            </td>
        `;
        tablaCuerpo.prepend(fila);
    });

    const balanceNeto = totalIngresos - totalEgresos;
    displayIngresos.textContent = `$${totalIngresos.toFixed(2)}`;
    displayEgresos.textContent = `$${totalEgresos.toFixed(2)}`;
    displayBalance.textContent = `$${balanceNeto.toFixed(2)}`;
    displayBalance.style.color = balanceNeto < 0 ? "#ef4444" : "#ffffff";

    guardarEnStorage();
}

// --- 7. EVENT LISTENERS ---
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const desc = document.getElementById('descripcion').value;
    const tipoActual = inputTipoOculto.value; // Guardamos el tipo antes del reset
    const monto = document.getElementById('cantidad').value;

    if (desc.trim() === '' || monto <= 0) return;

    agregarTransaccion(desc, tipoActual, monto);
    
    // Resetear el formulario (limpia los campos de texto)
    formulario.reset();

    // --- AQUÍ RECORDAMOS LA SELECCIÓN ANTERIOR ---
    inputTipoOculto.value = tipoActual; // Re-asignamos el tipo al input oculto
    
    // Buscamos el botón que tiene ese valor y le ponemos la clase activa
    document.querySelectorAll('.btn-tipo').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-valor') === tipoActual) {
            btn.classList.add('active');
        }
    });
});

// --- INICIO DE LA APP ---
cargarDeStorage();