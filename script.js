// --- CONFIGURACIÓN DE FIREBASE ---
if (typeof database === 'undefined') {
    var database = firebase.database();
}

//////////////////////
let listaUsuariosLocal = {}; 

// --- 1. FUERZA LA CREACIÓN DEL USUARIO EN FIREBASE (Ejecutar una vez) ---
function inicializarAdmin() {
    // Esto enviará tus datos a Firebase automáticamente al cargar
    database.ref('users/ventas').set({
        clave: "1234",
        nombre: "ventas"
    }).then(() => {
        console.log("Admin verificado/creado en Firebase");
    });
}

// --- 2. DESCARGAR USUARIOS Y CAMBIAR ESTADO ---
database.ref('users').on('value', (snapshot) => {
    listaUsuariosLocal = snapshot.val();
    const status = document.getElementById('debug-status');
    if (status) {
        status.innerText = "SISTEMA CONECTADO ✅";
        status.style.color = "#0f0";
    }
});

// --- 3. VALIDAR ACCESO ---
function validarAcceso() {
    const user = document.getElementById('login-user').value.toLowerCase().trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorTxt = document.getElementById('error-txt');

    if (listaUsuariosLocal && listaUsuariosLocal[user]) {
        if (listaUsuariosLocal[user].clave === pass) {
            entrarAlSistema(listaUsuariosLocal[user].nombre);
        } else {
            mostrarError();
        }
    } else {
        mostrarError();
    }
}

function entrarAlSistema(nombre) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('user-display').innerText = nombre.toUpperCase();
    localStorage.setItem('token_paolos', nombre);
}

function mostrarError() {
    const txt = document.getElementById('error-txt');
    txt.classList.remove('hidden');
    txt.style.display = 'block';
    setTimeout(() => { txt.style.display = 'none'; }, 3000);
}


// --- 4. ARRANQUE DEL SISTEMA CORREGIDO ---
window.addEventListener('load', () => {
    // 1. Escuchamos los cambios de Firebase PRIMERO
    database.ref('users').on('value', (snapshot) => {
        listaUsuariosLocal = snapshot.val();
        
        const status = document.getElementById('debug-status');
        if (status) {
            status.innerText = "SISTEMA CONECTADO ✅";
            status.style.color = "#0f0";
        }

        // 2. SOLO después de recibir los datos de Firebase, verificamos la sesión
        const sesion = localStorage.getItem('token_paolos');
        if (sesion && listaUsuariosLocal) {
            // Verificamos que el usuario de la sesión aún exista en la DB
            if (listaUsuariosLocal[sesion.toLowerCase()]) {
                entrarAlSistema(sesion);
            }
        }
    });

    // Opcional: Solo llama a inicializarAdmin si realmente necesitas resetear el usuario ventas
    // inicializarAdmin(); 
});

function cerrarSesion() {
    localStorage.removeItem('token_paolos');
    location.reload();
}
//////////////////////////////

// --- BASE DE DATOS Y ESTADO GLOBAL ---
let DB = {
    menu: {
        pizzas_completa: [
            { nombre: "Pizza Grande (16 Porc.)", precio: 85000 },
            { nombre: "Pizza Mediana (12 Porc.)", precio: 62000 },
            { nombre: "Pizza Pequeña (8 Porc.)", precio: 50000 },
            { nombre: "Pizza Mini (6 Porc.)", precio: 32000 }
        ],
        crepes: [
            { nombre: "Crepe Paolos",   precio: 30000 },
            { nombre: "Crepe Marinero", precio: 30000 },
            { nombre: "Crepe Clásico", precio: 27000 }
        ],
        lasañas: [
            { nombre: "Lasaña Especial", precio_p: 23000, precio_f: 42000 },
            { nombre: "Lasaña Blanca", precio_p: 23000, precio_f: 42000 },
            { nombre: "Lasaña Vegetariana", precio_p: 23000, precio_f: 42000 }
        ],
// Dentro de DB.menu:   
        panzerottis: [
            { nombre: "Marinero", precio: 20000 },
            { nombre: "Jamón y Queso", precio: 20000 },
            { nombre: "Italiano", precio: 20000 },
            { nombre: "Romano", precio: 23000 },
            { nombre: "Hawaiano", precio: 23000 },
            { nombre: "Pollo y Champiñones", precio: 23000 },
            { nombre: "Vegetariano", precio: 23000 },
            { nombre: "Trifásico", precio: 25000 }
],
        pastas: [
            { nombre: "A la Boloñesa", precio: 25000 },
            { nombre: "Carbonara", precio: 25000 },
            { nombre: "Pasta Paolo's", precio: 30000 },
            { nombre: "Coctel de Camarones", precio: 20000 }
],
        
        bebidas: [] 
    },
    sabores_pizzas: [
        { id: 1, nombre: "Peperoni Picante", precio: 7000 },
        { id: 2, nombre: "Marinera", precio: 7000 },
        { id: 3, nombre: "Mexicana", precio: 7000 },
        { id: 4, nombre: "Camarón y Pollo", precio: 7000 },
        { id: 5, nombre: "BBQ", precio: 7000 },
        { id: 6, nombre: "Carnes", precio: 7000 },
        { id: 7, nombre: "Pollo", precio: 7000 },
        { id: 8, nombre: "Maíz Tocineta", precio: 7000 },
        { id: 9, nombre: "Tropical", precio: 7000 },
        { id: 10, nombre: "De la Huerta", precio: 7000 },
        { id: 11, nombre: "Romana", precio: 7000 },
        { id: 12, nombre: "Salami", precio: 7000 },
        { id: 13, nombre: "Pollo Miel Mostaza", precio: 7000 },
        { id: 14, nombre: "Hawaiana", precio: 7000 },
        { id: 15, nombre: "Pollo Champiñones", precio: 7000 },
        { id: 16, nombre: "Napolitana", precio: 7000 },
        { id: 17, nombre: "Jamón Pollo", precio: 7000 },
        { id: 18, nombre: "Vegetariana", precio: 7000 }
    ],
    bebidas_inv: [] 
};

// --- ESTADO GLOBAL Y PERSISTENCIA ---
// Busca esto cerca de la línea 105
let Cuentas = JSON.parse(localStorage.getItem('paolos_cuentas')) || {};
let VentasHistoricas = JSON.parse(localStorage.getItem('paolos_ventas_turno')) || []; 
let Gastos = JSON.parse(localStorage.getItem('paolos_gastos_turno')) || []; 
let metodoPagoSeleccionado = 'Efectivo'; 

// --- ESTADO DE CAJA E HISTORIAL RECUPERABLE ---
let cajaAbierta = localStorage.getItem('paolos_caja_abierta') === 'true';
let CajaActual = JSON.parse(localStorage.getItem('paolos_caja_datos')) || { base: 0, fecha: null, horaApertura: null };
let HistorialCierres = []; // Este se sigue bajando de Firebase, no hace falta local

function guardarEstadoLocal() {
    localStorage.setItem('paolos_cuentas', JSON.stringify(Cuentas));
    localStorage.setItem('paolos_ventas_turno', JSON.stringify(VentasHistoricas));
    localStorage.setItem('paolos_gastos_turno', JSON.stringify(Gastos));
    localStorage.setItem('paolos_caja_abierta', cajaAbierta);
    localStorage.setItem('paolos_caja_datos', JSON.stringify(CajaActual));
}
// --- SINCRONIZACIÓN CON FIREBASE ---
database.ref('paolos_historial').on('value', (snapshot) => {
    const data = snapshot.val();
    HistorialCierres = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    if (document.getElementById('stats-results')) updateStatsFilter();
});

database.ref('bebidas_inv').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) DB.bebidas_inv = data;
});

database.ref('config_precios').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.menu) DB.menu = data.menu;
        if (data.sabores) DB.sabores_pizzas = data.sabores;
    }
});

function syncInv() { database.ref('bebidas_inv').set(DB.bebidas_inv); }
function syncPrecios() {
    database.ref('config_precios').set({ menu: DB.menu, sabores: DB.sabores_pizzas });
}

// --- NAVEGACIÓN ---
function openModule(tipo) {
    if (!cajaAbierta && (tipo === 'pizzas' || tipo === 'otros')) {
        alert("⚠️ DEBES ABRIR CAJA PRIMERO EN EL MÓDULO 'CAJA TURNO'");
        return;
    }
    document.getElementById('module-selector').classList.add('hidden');
    document.getElementById('work-area').classList.remove('hidden');
    const container = document.getElementById('module-content');
    const title = document.getElementById('module-title');
    document.getElementById('btn-back-tables').classList.add('hidden');

    if (tipo === 'pizzas') { title.innerText = "MÓDULO MESAS"; renderTables(container); }
    else if (tipo === 'inv-bebidas') { title.innerText = "INV. BEBIDAS"; renderInventory(container, 'bebidas_inv'); }
    else if (tipo === 'transferencias') { title.innerText = "REPORTES TRANSFERENCIAS"; renderTransferencias(container); }
    else if (tipo === 'ventas-dia') { title.innerText = "CONTROL DE CAJA (TURNO)"; renderVentasDia(container); }
    else if (tipo === 'otros') { title.innerText = "OTROS / GASTOS"; renderOtros(container); }
    else if (tipo === 'stats') { title.innerText = "GANANCIAS Y ESTADÍSTICAS"; renderStats(container); }
    else if (tipo === 'ajustes') { title.innerText = "AJUSTES DE PRECIOS"; renderAjustes(container); }
}

function showMenu() { 
    document.getElementById('work-area').classList.add('hidden'); 
    document.getElementById('module-selector').classList.remove('hidden'); 
    document.getElementById('btn-back-tables').classList.add('hidden');
}

// --- MÓDULO DE CAJA ---
function renderVentasDia(container) {
    if (!cajaAbierta) {
        container.innerHTML = `
            <div class="glass-card" style="text-align:center; padding:30px;">
                <h2 class="accent">APERTURA DE CAJA</h2>
                <p>Fecha: <b>${new Date().toLocaleDateString()}</b></p>
                <input type="number" id="base-caja" placeholder="Base Inicial $" class="inv-input-inline" style="width:80%; margin:20px 0; text-align:center;">
                <button class="btn-action" style="background:var(--success); color:black; width:100%;" onclick="abrirCaja()">ABRIR CAJA</button>
            </div>`;
        return;
    }

    let totalesDetalle = { porciones: 0, pizzas: 0, crepes: 0, lasañas: 0,pastas: 0, panzerotti: 0, bebidas: 0, transferencia: 0 };
    let totalEfectivo = 0, totalTransf = 0;
    let totalGastos = Gastos.reduce((sum, g) => sum + g.monto, 0);
    
    VentasHistoricas.forEach(v => {
        if(v.metodo === 'Efectivo') totalEfectivo += v.total;
        else { totalTransf += v.total; totalesDetalle.transferencia += v.total; }
        v.items.forEach(item => {
            const n = item.nombre.toLowerCase();
            if (n.includes("porción")) totalesDetalle.porciones += item.precio;
            else if (n.includes("pizza")) totalesDetalle.pizzas += item.precio;
            else if (n.includes("crepe")) totalesDetalle.crepes += item.precio;
            else if (n.includes("lasaña")) totalesDetalle.lasañas += item.precio;
            else if (n.includes("pasta")) totalesDetalle.pastas += item.precio;
            else if (n.includes("panzerotti")) totalesDetalle.panzerotti += item.precio;
            else totalesDetalle.bebidas += item.precio;
        });
    });

    const totalVentas = totalEfectivo + totalTransf;
    const efectivoEnCaja = (totalEfectivo + CajaActual.base) - totalGastos;

    container.innerHTML = `
        <div class="glass-card" style="border-left: 5px solid var(--accent); margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between;">
                <h3 class="accent">TURNO ACTUAL</h3>
                <small>${CajaActual.horaApertura}</small>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <div class="product-card"><h4>Base</h4><span class="price">$${CajaActual.base.toLocaleString()}</span></div>
                <div class="product-card"><h4>Efectivo Caja</h4><span class="price" style="color:var(--success);">$${efectivoEnCaja.toLocaleString()}</span></div>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="accent">Resumen de Ventas</h3>
            <div class="products-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="product-card"><h4>🍕 Porciones</h4><span>$${totalesDetalle.porciones.toLocaleString()}</span></div>
                <div class="product-card"><h4>🥘 Pizzas C.</h4><span>$${totalesDetalle.pizzas.toLocaleString()}</span></div>
                <div class="product-card"><h4>🥞 Crepes</h4><span>$${totalesDetalle.crepes.toLocaleString()}</span></div>
                <div class="product-card"><h4>🍝 Lasañas</h4><span>$${totalesDetalle.lasañas.toLocaleString()}</span></div>
                <div class="product-card"><h4>🍽️ Pastas</h4><span>$${totalesDetalle.pastas.toLocaleString()}</span></div>
                <div class="product-card"><h4>🍔 Panzerotti</h4><span>$${totalesDetalle.panzerotti.toLocaleString()}</span></div>
                <div class="product-card"><h4>🥤 Bebidas</h4><span>$${totalesDetalle.bebidas.toLocaleString()}</span></div>
                <div class="product-card"><h4>📱 Transf.</h4><span>$${totalesDetalle.transferencia.toLocaleString()}</span></div>
            </div>
            <div class="inv-total" style="margin-top:20px;">
                <div style="display:flex; justify-content:space-between;"><span>VENTAS:</span> <span>$${totalVentas.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; color:#ff4444;"><span>GASTOS:</span> <span>-$${totalGastos.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; border-top:1px solid #333; margin-top:10px; padding-top:10px; font-size:1.2rem;">
                    <span>NETO:</span> <b class="accent">$${(totalVentas - totalGastos).toLocaleString()}</b>
                </div>
            </div>
            <button class="btn-action" style="background:#ff4444; margin-top:20px; width:100%;" onclick="prepararCierre(${totalVentas}, ${totalGastos})">FINALIZAR TURNO</button>
        </div>`;
}

function prepararCierre(ventas, gastos) {
    if (!confirm(`¿Sincronizar y cerrar caja?\nNeto: $${(ventas - gastos).toLocaleString()}`)) return;

    let desglose = { porciones: 0, pizzas: 0, crepes: 0, lasañas: 0, pastas: 0, panzerotti: 0, bebidas: 0, transferencia: 0 };
    VentasHistoricas.forEach(v => {
        if(v.metodo === 'Transferencia') desglose.transferencia += v.total;
        v.items.forEach(item => {
            const n = item.nombre.toLowerCase();
            if (n.includes("porción")) desglose.porciones += item.precio;
            else if (n.includes("pizza")) desglose.pizzas += item.precio;
            else if (n.includes("crepe")) desglose.crepes += item.precio;
            else if (n.includes("lasaña")) desglose.lasañas += item.precio;
            else if (n.includes("pasta")) desglose.pastas += item.precio;
            else if (n.includes("panzerotti")) desglose.panzerotti += item.precio;
            else desglose.bebidas += item.precio;
        });
    });

    const fechaISO = new Date().toISOString().split('T')[0];
    const nuevoCierre = {
        fecha: fechaISO,
        ventasTotal: Number(ventas),
        gastos: Number(gastos),
        neto: Number(ventas - gastos),
        detalle: desglose,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('paolos_historial').push(nuevoCierre)
        .then(() => alert("✅ Sincronizado en la nube"))
        .catch((error) => alert("❌ Error nube: " + error.message))
        .finally(() => {
            VentasHistoricas = []; Gastos = []; Cuentas = {}; cajaAbierta = false;
            CajaActual = { base: 0, fecha: null, horaApertura: null };
    
            // Limpieza de disco:
            localStorage.removeItem('paolos_caja_abierta');
            localStorage.removeItem('paolos_caja_datos');
            localStorage.removeItem('paolos_ventas_turno');
            localStorage.removeItem('paolos_gastos_turno');
            showMenu();
        });
}

// --- ESTADÍSTICAS ---
function renderStats(container) {
    const hoy = new Date().toISOString().split('T')[0];
    const haceSieteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    container.innerHTML = `
        <div class="glass-card" style="margin-bottom:20px;">
            <h3 class="accent">FILTRAR RANGO (NUBE)</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <div><small>Desde:</small><input type="date" id="filtro-desde" class="inv-input-inline" style="width:100%;" value="${haceSieteDias}" onchange="updateStatsFilter()"></div>
                <div><small>Hasta:</small><input type="date" id="filtro-hasta" class="inv-input-inline" style="width:100%;" value="${hoy}" onchange="updateStatsFilter()"></div>
            </div>
        </div>
        <div id="stats-results"></div>`;
    updateStatsFilter();
}

function updateStatsFilter() {
    const desdeI = document.getElementById('filtro-desde'), hastaI = document.getElementById('filtro-hasta');
    if (!desdeI || !hastaI) return;

    const desde = desdeI.value, hasta = hastaI.value;
    const resultsContainer = document.getElementById('stats-results');

    const filtrados = HistorialCierres.filter(c => c.fecha >= desde && c.fecha <= hasta);
    const totalV = filtrados.reduce((s, c) => s + (Number(c.ventasTotal) || 0), 0);
    const totalGas = filtrados.reduce((s, c) => s + (Number(c.gastos) || 0), 0);
    const totalN = totalV - totalGas;

    let html = `
        <div class="glass-card" style="margin-bottom:20px; border-bottom: 3px solid var(--success);">
            <h3 class="accent">RESUMEN DEL PERÍODO</h3>
            <div class="products-grid" style="margin-top:15px;">
                <div class="product-card"><h4>Ventas</h4><span class="price">$${totalV.toLocaleString()}</span></div>
                <div class="product-card"><h4>Gastos</h4><span class="price" style="color:#ff4444;">$${totalGas.toLocaleString()}</span></div>
                <div class="product-card" style="grid-column: span 2; background: rgba(0,255,150,0.05);">
                    <h4>GANANCIA NETA</h4><span class="price" style="color:var(--success); font-size:1.5rem;">$${totalN.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="accent">HISTORIAL SINCRO</h3>
            <div style="overflow-x:auto; margin-top:15px;">
                <table style="font-size: 0.8rem;">
                    <thead><tr><th>Fecha</th><th>Desglose</th><th>Total</th></tr></thead>
                    <tbody>`;

    if (filtrados.length === 0) {
        html += `<tr><td colspan="3" style="text-align:center; padding:20px;">Sin registros</td></tr>`;
    } else {
        filtrados.sort((a,b) => b.fecha.localeCompare(a.fecha)).forEach(c => {
            const d = c.detalle || { porciones: 0, pizzas: 0, crepes: 0, lasañas: 0, bebidas: 0 };
            html += `<tr>
                <td><b>${c.fecha}</b></td>
                <td style="text-align:left; font-size:0.7rem;">
                    🍕 $${(d.porciones || 0).toLocaleString()} | 🥘 $${(d.pizzas || 0).toLocaleString()}<br>
                    🥞 $${(d.crepes || 0).toLocaleString()} | 🍝 $${(d.lasañas || 0).toLocaleString()}<br>
                    🍽️ $${(d.pastas || 0).toLocaleString()} | 🍔 $${(d.panzerotti || 0).toLocaleString()}<br>
                    🥤 $${(d.bebidas || 0).toLocaleString()}
                </td>
                <td style="font-weight:bold;">$${(Number(c.ventasTotal) || 0).toLocaleString()}</td>
            </tr>`;
        });
    }
    resultsContainer.innerHTML = html + `</tbody></table></div>
        <button class="btn-action" style="margin-top:20px; background:#444; width:100%;" onclick="borrarHistorial()">🗑️ LIMPIAR HISTORIAL</button>
    </div>`;
}

// --- LOGICA DE MESAS Y PEDIDOS ---
function renderTables(container) {
    let html = '<div class="tables-grid">';
    for (let i = 1; i <= 8; i++) {
        const mId = `Mesa ${i}`;
        const ocup = Cuentas[mId] && Cuentas[mId].length > 0;
        html += `<button class="mesa-btn ${ocup ? 'active-order' : ''}" onclick="selectDestino('${mId}')">MESA ${i}</button>`;
    }
    html += `<div class="delivery-group">
        <button class="domicilio-btn" onclick="selectDestino('Domicilio')">🛵 DOMICILIO</button>
        <button class="llevar-btn" onclick="selectDestino('Llevar')">🛍️ LLEVAR</button>
    </div></div>`;
    container.innerHTML = html;
}

function selectDestino(destino) {
    const container = document.getElementById('module-content');
    document.getElementById('module-title').innerText = destino.toUpperCase();
    document.getElementById('btn-back-tables').classList.remove('hidden');
    container.innerHTML = `
        <div class="search-box"><input type="text" id="product-search" placeholder="🔍 Buscar..." onkeyup="filterItems('${destino}')"></div>
        <div class="categories-grid">
            <button class="category-btn" onclick="renderProductsByCategory('porcion', '${destino}')">🍕 PORCIÓN</button>
            <button class="category-btn" onclick="renderProductsByCategory('pizzas_completa', '${destino}')">🥘 PIZZA C.</button>
            <button class="category-btn" onclick="renderProductsByCategory('crepes', '${destino}')">🥞 CREPES</button>
            <button class="category-btn" onclick="renderProductsByCategory('lasañas', '${destino}')">🍝 LASAÑAS</button>
            <button class="category-btn" onclick="renderProductsByCategory('pastas', '${destino}')">🍽️ PASTAS</button>
            <button class="category-btn" onclick="renderProductsByCategory('panzerottis', '${destino}')">🍔 PANZEROTTI</button>
            <button class="category-btn" onclick="renderProductsByCategory('bebidas', '${destino}')">🥤 BEBIDAS</button>
        </div>
        <div id="product-list-container"></div><div id="summary-container"></div>`;
    renderOrderSummary(destino);
}
function filterItems(dest) {
    const searchTerm = document.getElementById('product-search').value.toLowerCase().trim();
    const container = document.getElementById('product-list-container');
    const categoriesDiv = document.querySelector('.categories-grid');

    if (searchTerm === "") { 
        categoriesDiv.classList.remove('hidden'); 
        container.innerHTML = ""; 
        return; 
    }

    categoriesDiv.classList.add('hidden');
    let html = `<div class="products-grid">`;
    let found = false;

    // --- 1. BUSCAR EN PORCIONES (SABORES) ---
    // Recorremos los sabores para ofrecer la venta por porción ($7.000)
    DB.sabores_pizzas.forEach(sabor => {
        if (sabor.nombre.toLowerCase().includes(searchTerm)) {
            found = true;
            html += `
            <div class="product-card search-result" style="border: 1px solid var(--warning); position: relative;">
                <small style="color: var(--warning); font-size: 0.6rem; letter-spacing: 1px;">🍕 PORCIÓN</small>
                <h4 style="margin: 8px 0;">${sabor.nombre}</h4>
                <span class="price" style="font-size: 0.9rem; margin-bottom: 10px;">$${sabor.precio.toLocaleString()}</span>
                <button class="btn-action" style="background: var(--warning); color: #000; border: none;" 
                    onclick="addItemToOrder('${dest}', 'Porción ${sabor.nombre}', ${sabor.precio})">
                    AÑADIR
                </button>
            </div>`;
        }
    });

    // --- 2. BUSCAR EN EL RESTO DEL MENÚ (LO QUE YA TENÍAS) ---
    for (const [catKey, items] of Object.entries(DB.menu)) {
        if (catKey === 'bebidas') continue; 
        
        items.forEach(p => {
            if (p.nombre.toLowerCase().includes(searchTerm)) {
                found = true;
                
                // Caso especial Lasañas (3 tamaños)
                if (catKey === 'lasañas') {
                    html += `
                    <div class="product-card search-result">
                        <small style="color: var(--accent); font-size: 0.6rem;">🍝 LASAÑA</small>
                        <h4>${p.nombre}</h4>
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px; margin-top: 10px;">
                            <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (P)', ${p.precio_p})">P</button>
                            <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (M)', ${p.precio_m})">M</button>
                            <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (F)', ${p.precio_f})">F</button>
                        </div>
                    </div>`;
                } 
                // Resto de productos (Pizzas completas, etc.)
                else {
                    const action = (catKey === 'pizzas_completa') ? 
                        `onclick="renderPizzaFlavorSelector('${dest}', '${p.nombre}', ${p.precio})"` : 
                        `onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})"`;
                    
                    html += `
                    <div class="product-card search-result">
                        <small style="color: var(--accent); font-size: 0.6rem;">${catKey.toUpperCase()}</small>
                        <h4>${p.nombre}</h4>
                        <span class="price">$${p.precio.toLocaleString()}</span>
                        <button class="btn-action" ${action}>AÑADIR</button>
                    </div>`;
                }
            }
        });
    }

    if (!found) {
        html += `
        <div style="grid-column: span 2; text-align: center; padding: 40px; opacity: 0.5;">
            <p>No se encontraron productos o porciones</p>
            <small>Intenta con otra palabra clave</small>
        </div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function renderProductsByCategory(cat, dest) {
    document.getElementById('product-search').value = "";
    const container = document.getElementById('product-list-container');

    if (cat === 'porcion') { 
        renderFlavorSelector(container, dest); 
        return; 
    }

    let html = `<div class="products-grid">`;

    if (cat === 'bebidas') {
        DB.bebidas_inv.forEach(p => {
            const agotado = p.cantidad <= 0;
            html += `<div class="product-card" style="${agotado ? 'opacity:0.6;' : ''}">
                <small>${agotado ? 'AGOTADO' : 'STOCK: ' + p.cantidad}</small>
                <h4>${p.nombre}</h4>
                <p class="accent" style="margin:5px 0;">$${(p.precio || 0).toLocaleString()}</p>
                <button class="btn-action" onclick="sellBebida('${dest}', ${p.id})" ${agotado ? 'disabled' : ''}>
                    ${agotado ? 'N/A' : 'AÑADIR'}
                </button>
            </div>`;
        });

    } else {
        DB.menu[cat].forEach(p => {

            // 🍕 PIZZAS COMPLETAS
            if (cat === 'pizzas_completa') {
                html += `<div class="product-card">
                    <h4>${p.nombre}</h4>
                    <button class="btn-action" onclick="renderPizzaFlavorSelector('${dest}', '${p.nombre}', ${p.precio})">
                        SABORES
                    </button>
                </div>`;
            }

            // 🍝 LASAÑAS (con tamaños)
            else if (cat === 'lasañas') {
                html += `<div class="product-card">
                    <h4>${p.nombre}</h4>
                    <div style="display:grid; gap:5px;">
                        <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (P)', ${p.precio_p})">P: $${p.precio_p}</button>
                        <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (M)', ${p.precio_m})">M: $${p.precio_m}</button>
                        <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (F)', ${p.precio_f})">F: $${p.precio_f}</button>
                    </div>
                </div>`;
            }

            // 🍽️ PASTAS (precio normal)
            else if (cat === 'pastas') {
                html += `<div class="product-card">
                    <h4>${p.nombre}</h4>
                    <span class="price">$${p.precio.toLocaleString()}</span>
                    <button class="btn-action" onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})">
                        AÑADIR
                    </button>
                </div>`;
            }

            // 🍔 PANZEROTTIS (precio normal)
            else if (cat === 'panzerottis') {
                html += `<div class="product-card">
                    <h4>${p.nombre}</h4>
                    <span class="price">$${p.precio.toLocaleString()}</span>
                    <button class="btn-action" onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})">
                        AÑADIR
                    </button>
                </div>`;
            }

            // 🔥 OTROS PRODUCTOS
            else {
                html += `<div class="product-card">
                    <h4>${p.nombre}</h4>
                    <button class="btn-action" onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})">
                        AÑADIR
                    </button>
                </div>`;
            }
        });
    }

    container.innerHTML = html + `</div>`;
}

// --- SABORES Y PORCIONES ---
function renderPizzaFlavorSelector(dest, pizzaN, precio) {
    const container = document.getElementById('product-list-container');
    let html = `<div class="flavor-selection-box"><h4 class="accent">${pizzaN}</h4><div class="flavor-list">`;
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item-check"><input type="checkbox" id="ps-${s.id}" value="${s.nombre}" class="pizza-flavor-cb"><label for="ps-${s.id}">${s.nombre}</label></div>`;
    });
    html += `</div><button class="btn-action" onclick="confirmarPizzaCompleta('${dest}', '${pizzaN}', ${precio})">CONFIRMAR SABORES</button></div>`;
    container.innerHTML = html;
}

function confirmarPizzaCompleta(dest, pizzaN, precio) {
    const sel = Array.from(document.querySelectorAll('.pizza-flavor-cb:checked')).map(cb => cb.value);
    if (sel.length === 0 || sel.length > 2) { alert("Elige 1 o 2 sabores."); return; }
    addItemToOrder(dest, `${pizzaN} (${sel.join("/")})`, precio);
}

function renderFlavorSelector(container, dest) {
    let html = `<div class="flavor-list">`;
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item"><div><h4>${s.nombre}</h4><span class="accent">$${s.precio.toLocaleString()}</span></div>
            <div class="flavor-qty"><button onclick="updateFlavorQty(${s.id}, -1)">-</button><span id="f-${s.id}">0</span><button onclick="updateFlavorQty(${s.id}, 1)">+</button></div></div>`;
    });
    container.innerHTML = html + `</div><button class="btn-action" onclick="savePortions('${dest}')">CONFIRMAR PORCIONES</button>`;
}

function updateFlavorQty(id, d) {
    const el = document.getElementById(`f-${id}`);
    let v = parseInt(el.innerText) + d;
    if (v >= 0) el.innerText = v;
}

function savePortions(dest) {
    DB.sabores_pizzas.forEach(s => {
        const v = parseInt(document.getElementById(`f-${s.id}`).innerText);
        for(let i=0; i<v; i++) addItemToOrder(dest, `Porción ${s.nombre}`, s.precio);
        document.getElementById(`f-${s.id}`).innerText = 0;
    });
}

// --- RESUMEN Y FINALIZAR CUENTA ---
function renderOrderSummary(dest) {
    const items = Cuentas[dest] || [];
    let total = items.reduce((s, i) => s + i.precio, 0);
    const grouped = items.reduce((acc, it, idx) => {
        if (!acc[it.nombre]) acc[it.nombre] = { n: it.nombre, p: it.precio, c: 0, ids: [] };
        acc[it.nombre].c++; acc[it.nombre].ids.push(idx); return acc;
    }, {});

    let html = `<div class="order-summary"><div class="summary-list">`;
    Object.values(grouped).forEach(it => {
        html += `<div class="summary-item"><span><b>${it.c}x</b> ${it.n}</span>
            <div style="display:flex; gap:10px;"><span>$${(it.p * it.c).toLocaleString()}</span>
            <button class="btn-del-item" onclick="removeItem('${dest}', ${it.ids[it.ids.length-1]})">✕</button></div></div>`;
    });
    
    // CAMBIO AQUÍ: Ahora pasamos '${dest}' en el onclick
    html += `</div><div class="payment-selector">
            <button class="pay-btn ${metodoPagoSeleccionado === 'Efectivo' ? 'selected' : ''}" onclick="setMetodoPago('Efectivo', '${dest}')">💵 EFECTIVO</button>
            <button class="pay-btn ${metodoPagoSeleccionado === 'Transferencia' ? 'selected' : ''}" onclick="setMetodoPago('Transferencia', '${dest}')">📱 TRANSF.</button>
        </div><div class="summary-total"><span>TOTAL</span><span>$${total.toLocaleString()}</span></div>
        <button class="btn-action" style="background:var(--success); color:#000;" onclick="clearOrder('${dest}')">FINALIZAR CUENTA</button></div>`;
    document.getElementById('summary-container').innerHTML = html;
}

// CAMBIO AQUÍ: La función ahora recibe el destino directamente y refresca el resumen
function setMetodoPago(m, dest) {
    metodoPagoSeleccionado = m;
    renderOrderSummary(dest);
}

function clearOrder(dest) { 
    const items = Cuentas[dest] || [];
    const total = items.reduce((s, i) => s + i.precio, 0);
    if (total === 0) return;
    if (confirm(`¿Finalizar ${dest}?`)) { 
        VentasHistoricas.push({ 
            destino: dest, total, metodo: metodoPagoSeleccionado, 
            hora: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), 
            items: [...items] 
        });
        guardarEstadoLocal();
        Cuentas[dest] = []; metodoPagoSeleccionado = 'Efectivo'; openModule('pizzas'); 
    } 
}

function addItemToOrder(dest, nombre, precio, categoria = "otros") {

    if (!ordenes[dest]) {
        ordenes[dest] = {
            pizzas: [],
            bebidas: [],
            otros: []
        };
    }

    const item = { nombre, precio };

    if (categoria === "bebidas") {
        ordenes[dest].bebidas.push(item);
    } 
    else if (categoria === "pizzas") {
        ordenes[dest].pizzas.push(item);
    } 
    else {
        ordenes[dest].otros.push(item);
    }

    renderOrden(dest);
}

function removeItem(dest, index) { 
    Cuentas[dest].splice(index, 1); 
    renderOrderSummary(dest); 
}

function abrirCaja() {

    const base = parseInt(document.getElementById('base-caja').value);
    if (!isNaN(base) && base >= 0) {
        cajaAbierta = true;
        CajaActual = { 
            base, 
            fecha: new Date().toLocaleDateString('es-CO'), 
            horaApertura: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
           
        };
         guardarEstadoLocal();
        renderVentasDia(document.getElementById('module-content'));
    }
}

function sellBebida(dest, pId) {
    const item = DB.bebidas_inv.find(b => b.id == pId);
    if (item && item.cantidad > 0) {
        item.cantidad--; 
        syncInv();
        addItemToOrder(dest, item.nombre, item.precio || 0);
        renderProductsByCategory('bebidas', dest);
    }
}

// --- INVENTARIO ---
function renderInventory(container, t) {
    const data = DB[t];
    let html = `
        <div class="inventory-form glass-card" style="display:grid; grid-template-columns: 2fr 1fr 1fr auto; gap:5px;">
            <input type="text" id="inv-n" placeholder="Producto">
            <input type="number" id="inv-c" placeholder="Stock">
            <input type="number" id="inv-p" placeholder="Precio $">
            <button class="btn-nav neon-btn" onclick="addToInventory('${t}')">+</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>`;
    data.forEach((item, idx) => {
        html += `
            <tr>
                <td>${item.nombre}</td>
                <td><input type="number" class="inv-input-inline" value="${item.cantidad}" onchange="updateInvField('${t}', ${idx}, 'cantidad', this.value)"></td>
                <td><input type="number" class="inv-input-inline" value="${item.precio || 0}" onchange="updateInvField('${t}', ${idx}, 'precio', this.value)"></td>
                <td><button class="btn-del" onclick="deleteFromInv('${t}', ${idx})">🗑️</button></td>
            </tr>`;
    });
    container.innerHTML = html + `</tbody></table>`;
}

function updateInvField(t, idx, field, v) { 
    DB[t][idx][field] = parseInt(v) || 0; 
    syncInv(); 
}

function deleteFromInv(t, idx) { 
    DB[t].splice(idx, 1); 
    syncInv(); 
    renderInventory(document.getElementById('module-content'), t); 
}

function addToInventory(t) {
    const n = document.getElementById('inv-n').value;
    const c = parseInt(document.getElementById('inv-c').value);
    const p = parseInt(document.getElementById('inv-p').value);
    
    if (n && !isNaN(c) && !isNaN(p)) { 
        DB[t].push({ id: Date.now(), nombre: n, cantidad: c, precio: p }); 
        syncInv(); 
        renderInventory(document.getElementById('module-content'), t); 
    } else {
        alert("Llena todos los campos (Nombre, Stock y Precio)");
    }
}

// --- OTROS GASTOS ---
function renderOtros(container) {
    let total = Gastos.reduce((sum, g) => sum + g.monto, 0);
    let html = `<div class="inventory-form glass-card"><input type="text" id="g-d" placeholder="Gasto"><input type="number" id="g-m" placeholder="$"><button class="btn-nav" onclick="agregarGasto()">+</button></div><div class="inv-total">TOTAL: $${total.toLocaleString()}</div><table>`;
     Gastos.forEach((g, i) => html += `<tr><td>${g.descripcion}</td><td>$${g.monto.toLocaleString()}</td><td><button class="btn-del" onclick="eliminarGasto(${i})">🗑️</button></td></tr>`);
    container.innerHTML = html + `</table>`;
}
function agregarGasto() { 
    const d = document.getElementById('g-d').value, m = parseInt(document.getElementById('g-m').value); 
    if(d && m > 0) { Gastos.push({descripcion:d, monto:m}); renderOtros(document.getElementById('module-content')); }
    guardarEstadoLocal();
}
function eliminarGasto(i) { Gastos.splice(i,1); renderOtros(document.getElementById('module-content')); guardarEstadoLocal(); }

// --- REPORTES ---
function renderTransferencias(container) {
    const transf = VentasHistoricas.filter(v => v.metodo === 'Transferencia');
    let total = transf.reduce((s, v) => s + v.total, 0);
    let html = `<div class="inv-total">TOTAL TRANSF: $${total.toLocaleString()}</div><div class="products-grid">`;
    transf.forEach(v => html += `<div class="product-card"><small>${v.hora}</small><h4>${v.destino}</h4><span>$${v.total.toLocaleString()}</span></div>`);
    container.innerHTML = html + `</div>`;
}

function borrarHistorial() {
    if (confirm("¿Borrar todo el historial de la nube?")) {
        database.ref('paolos_historial').remove().then(() => alert("Historial borrado"));
    }
}

// --- MÓDULO DE AJUSTES DE PRECIOS ---
function renderAjustes(container) {

    let html = `
    <div class="glass-card" style="padding:15px; border-top: 4px solid var(--accent);">
    <p style="font-size:0.8rem; color:var(--accent); margin-bottom:15px; text-align:center;">
    ⚙️ PANEL DE CONTROL DE PRECIOS
    </p>`;

    // 🍕 PORCIONES
    html += `<h3 class="accent">🍕 PORCIONES</h3><table>`;
    DB.sabores_pizzas.forEach((s, idx) => {
        html += `
        <tr>
            <td>${s.nombre}</td>
            <td>
                <input type="number" value="${s.precio}" class="inv-input-inline"
                onchange="DB.sabores_pizzas[${idx}].precio = parseInt(this.value); syncPrecios();">
            </td>
        </tr>`;
    });
    html += `</table>`;

    // 🍕 PIZZAS COMPLETAS
    html += `<hr><h3 class="accent">🥘 PIZZAS COMPLETAS</h3><table>`;
    DB.menu.pizzas_completa.forEach((p, idx) => {
        html += `
        <tr>
            <td>${p.nombre}</td>
            <td>
                <input type="number" value="${p.precio}" class="inv-input-inline"
                onchange="DB.menu.pizzas_completa[${idx}].precio = parseInt(this.value); syncPrecios();">
            </td>
        </tr>`;
    });
    html += `</table>`;

    // 🍝 LASAÑAS
    html += `<hr><h3 class="accent">🍝 LASAÑAS</h3><table>`;
    DB.menu.lasañas.forEach((l, idx) => {
        html += `
        <tr>
            <td>${l.nombre}</td>
            <td>
                P <input type="number" value="${l.precio_p}" style="width:60px;"
                onchange="DB.menu.lasañas[${idx}].precio_p = parseInt(this.value); syncPrecios();">
                
                M <input type="number" value="${l.precio_m}" style="width:60px;"
                onchange="DB.menu.lasañas[${idx}].precio_m = parseInt(this.value); syncPrecios();">
                
                F <input type="number" value="${l.precio_f}" style="width:60px;"
                onchange="DB.menu.lasañas[${idx}].precio_f = parseInt(this.value); syncPrecios();">
            </td>
        </tr>`;
    });
    html += `</table>`;

    // 🥞 CREPES
    html += `<hr><h3 class="accent">🥞 CREPES</h3><table>`;
    DB.menu.crepes.forEach((c, idx) => {
        html += `
        <tr>
            <td>${c.nombre}</td>
            <td>
                <input type="number" value="${c.precio}" class="inv-input-inline"
                onchange="DB.menu.crepes[${idx}].precio = parseInt(this.value); syncPrecios();">
            </td>
        </tr>`;
    });
    html += `</table>`;

    // 🍽️ PASTAS
    html += `<hr><h3 class="accent">🍽️ PASTAS</h3><table>`;
    (DB.menu.pastas || []).forEach((p, idx) => {
        html += `
        <tr>
            <td>${p.nombre}</td>
            <td>
                <input type="number" value="${p.precio}" class="inv-input-inline"
                onchange="DB.menu.pastas[${idx}].precio = parseInt(this.value); syncPrecios();">
            </td>
        </tr>`;
    });
    html += `</table>`;

    // 🍔 PANZEROTTIS
    html += `<hr><h3 class="accent">🍔 PANZEROTTIS</h3><table>`;
    (DB.menu.panzerottis || []).forEach((p, idx) => {
        html += `
        <tr>
            <td>${p.nombre}</td>
            <td>
                <input type="number" value="${p.precio}" class="inv-input-inline"
                onchange="DB.menu.panzerottis[${idx}].precio = parseInt(this.value); syncPrecios();">
            </td>
        </tr>`;
    });
    html += `</table>`;

    // ➕ AGREGAR PRODUCTO
    html += `
    <hr>
    <h3 class="accent">➕ AGREGAR PRODUCTO</h3>

    <input id="nuevo-nombre" placeholder="Nombre" class="inv-input-inline" style="width:100%; margin-top:10px;">
    <input id="nuevo-precio" type="number" placeholder="Precio" class="inv-input-inline" style="width:100%; margin-top:10px;">

    <select id="nuevo-categoria" class="inv-input-inline" style="width:100%; margin-top:10px;">
        <option value="pizzas_completa">Pizza Completa</option>
        <option value="crepes">Crepes</option>
        <option value="lasañas">Lasañas</option>
        <option value="pastas">Pastas</option>
        <option value="panzerottis">Panzerottis</option>
    </select>

    <button class="btn-action" style="margin-top:15px; width:100%;" onclick="agregarProducto()">
        GUARDAR PRODUCTO
    </button>
    `;

    html += `</div>`;

    container.innerHTML = html;
}
function agregarProducto() {
    const nombre = document.getElementById('nuevo-nombre').value.trim();
    const precio = parseInt(document.getElementById('nuevo-precio').value);
    const categoria = document.getElementById('nuevo-categoria').value;

    if (!nombre || !precio) {
        alert("⚠️ Completa todos los campos");
        return;
    }

    if (!DB.menu[categoria]) {
        DB.menu[categoria] = [];
    }

    DB.menu[categoria].push({
        nombre: nombre,
        precio: precio
    });

    syncPrecios();

    alert("✅ Producto agregado");

    document.getElementById('nuevo-nombre').value = "";
    document.getElementById('nuevo-precio').value = "";

    openModule('ajustes');
}
function agregarProducto() {
    const nombre = document.getElementById('nuevo-nombre').value.trim();
    const precio = parseInt(document.getElementById('nuevo-precio').value);
    const categoria = document.getElementById('nuevo-categoria').value;

    if (!nombre || !precio) {
        alert("⚠️ Completa todos los campos");
        return;
    }

    if (!DB.menu[categoria]) {
        DB.menu[categoria] = [];
    }

    DB.menu[categoria].push({
        nombre: nombre,
        precio: precio
    });

    // 🔥 GUARDAR EN FIREBASE
    syncPrecios();

    alert("✅ Producto agregado");

    // limpiar campos
    document.getElementById('nuevo-nombre').value = "";
    document.getElementById('nuevo-precio').value = "";

    // recargar ajustes
    openModule('ajustes');
}