/* ================================================================
   JUGUERÍA SOFI — app.js
   Toda la lógica del negocio: menú, carrito y envío por WhatsApp.
   Este archivo se enlaza al final del index.html.
================================================================ */


/* ────────────────────────────────────────────────────────────────
   BASE DE DATOS LOCAL DE PRODUCTOS
   Este objeto contiene todos los jugos del menú organizados por categoría.
   Cada producto tiene: id único, emoji, nombre, descripción y precio.

   Cuando conectes el backend con Python/FastAPI, esta sección
   se reemplaza por una llamada a la API que trae los datos de MySQL.
──────────────────────────────────────────────────────────────── */
const productos = {

  /* Jugos naturales */
  naturales: [
    { id: 1,  emoji: '🍊', nombre: 'Naranja natural',  desc: 'Exprimida al momento, sin conservantes',   precio: 4000 },
    { id: 2,  emoji: '🥭', nombre: 'Mango costeño',    desc: 'Cremoso y dulce, con o sin leche',         precio: 5000 },
    { id: 3,  emoji: '🍍', nombre: 'Piña con coco',    desc: 'Tropical, refrescante y energizante',      precio: 5500 },
    { id: 4,  emoji: '🍋', nombre: 'Limonada de coco', desc: 'Con leche de coco y hielo',                precio: 5000 },
    { id: 5,  emoji: '🍓', nombre: 'Fresa con leche',  desc: 'Clásico y favorito de siempre',            precio: 5000 },
    { id: 6,  emoji: '🫐', nombre: 'Mora azul',        desc: 'Antioxidante, suave y cremoso',            precio: 5500 },
  ],

  /* Batidos y cremosos */
  batidos: [
    { id: 7,  emoji: '🍌', nombre: 'Banano proteico',   desc: 'Con avena, banano y miel natural',        precio: 6000 },
    { id: 8,  emoji: '🥑', nombre: 'Aguacate verde',    desc: 'Aguacate, leche y un toque de vainilla',  precio: 7000 },
    { id: 9,  emoji: '🍫', nombre: 'Chocolate festivo', desc: 'Cacao puro, leche y plátano',             precio: 6500 },
    { id: 10, emoji: '🥝', nombre: 'Verde detox',       desc: 'Kiwi, espinaca, manzana y jengibre',      precio: 7000 },
  ],

  /* Especiales Sofi */
  especiales: [
    { id: 11, emoji: '🌅', nombre: 'Sunrise Sofi',    desc: 'Naranja, zanahoria y jengibre',            precio: 7500 },
    { id: 12, emoji: '💚', nombre: 'Power verde',     desc: 'Pepino, limón, apio y miel',               precio: 7000 },
    { id: 13, emoji: '🍉', nombre: 'Sandía menta',    desc: 'Sandía fresca con hojitas de menta',       precio: 6000 },
    { id: 14, emoji: '🌺', nombre: 'Flor de Jamaica', desc: 'Agua de jamaica con canela y cítricos',    precio: 5500 },
  ]
};


/* ────────────────────────────────────────────────────────────────
   ESTADO GLOBAL DEL CARRITO
   Este array guarda los productos que el usuario ha agregado.
   Cada vez que el usuario agrega o quita un producto, este array cambia
   y la función actualizarUI() refleja ese cambio en la pantalla.
──────────────────────────────────────────────────────────────── */
let carrito = [];


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 1: RENDERIZAR EL MENÚ
   Dibuja las tarjetas de productos en el HTML.
════════════════════════════════════════════════════════════════ */

/**
 * renderProductos()
 * Lee el objeto "productos" y genera las tarjetas HTML
 * dentro de cada sección del menú (naturales, batidos, especiales).
 * Se llama una sola vez cuando la página carga.
 */
function renderProductos() {

  /* Mapa que relaciona cada categoría con el ID del contenedor en el HTML */
  const secciones = {
    naturales:  '#lista-naturales',
    batidos:    '#lista-batidos',
    especiales: '#lista-especiales'
  };

  /* Recorre cada categoría y llena su contenedor con tarjetas */
  for (const [categoria, selector] of Object.entries(secciones)) {

    /* Encuentra el div donde van las tarjetas */
    const contenedor = document.querySelector(selector);

    /* Por cada producto, genera el HTML de su tarjeta */
    contenedor.innerHTML = productos[categoria].map(p => `
      <div class="tarjeta">
        <div class="emoji-prod">${p.emoji}</div>
        <div class="nombre-prod">${p.nombre}</div>
        <div class="desc-prod">${p.desc}</div>
        <div class="pie-tarjeta">
          <span class="precio">$${p.precio.toLocaleString('es-CO')}</span>
          <!-- Al hacer clic en +, llama a agregar() con el id del producto -->
          <button class="btn-agregar" onclick="agregar(${p.id})" title="Agregar al carrito">+</button>
        </div>
      </div>
    `).join(''); /* .join('') une todos los strings sin separador */
  }
}


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 2: LÓGICA DEL CARRITO
   Funciones para agregar, quitar y calcular el carrito.
════════════════════════════════════════════════════════════════ */

/**
 * agregar(id)
 * Agrega un producto al carrito.
 * Si ya estaba, aumenta su cantidad en 1.
 * Si es nuevo, lo agrega con cantidad 1.
 * @param {number} id - El id del producto a agregar
 */
function agregar(id) {
  /* Busca el producto en el objeto de productos */
  const prod = Object.values(productos).flat().find(p => p.id === id);

  /* Verifica si el producto ya está en el carrito */
  const existe = carrito.find(i => i.id === id);

  if (existe) {
    /* Si ya existe, solo sube la cantidad */
    existe.cantidad++;
  } else {
    /* Si es nuevo, lo agrega con cantidad 1 */
    /* El spread ...prod copia todas las propiedades del producto */
    carrito.push({ ...prod, cantidad: 1 });
  }

  /* Actualiza lo que se ve en pantalla */
  actualizarUI();

  /* Pequeña animación de rebote en el badge del carrito */
  animarBadge();
}

/**
 * cambiarCantidad(id, delta)
 * Aumenta o disminuye la cantidad de un producto en el carrito.
 * Si la cantidad llega a 0, el producto se elimina del carrito.
 * @param {number} id    - Id del producto a modificar
 * @param {number} delta - +1 para aumentar, -1 para disminuir
 */
function cambiarCantidad(id, delta) {
  /* Busca el ítem en el carrito */
  const item = carrito.find(i => i.id === id);
  if (!item) return; /* Si no lo encuentra, no hace nada */

  /* Modifica la cantidad */
  item.cantidad += delta;

  /* Si la cantidad es 0 o menos, elimina el producto del carrito */
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.id !== id); /* Filtra dejando solo los que NO son este */
  }

  /* Actualiza la pantalla */
  actualizarUI();
}

/**
 * calcularTotal()
 * Suma los precios de todos los productos en el carrito.
 * @returns {number} El total en pesos colombianos
 */
function calcularTotal() {
  /* reduce() recorre el array acumulando el total */
  return carrito.reduce((acumulado, item) => {
    return acumulado + (item.precio * item.cantidad);
  }, 0); /* 0 es el valor inicial del acumulador */
}


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 3: ACTUALIZAR LA INTERFAZ
   Refleja el estado del carrito en lo que el usuario ve.
════════════════════════════════════════════════════════════════ */

/**
 * actualizarUI()
 * Redibuja el contenido del carrito y actualiza el badge y el total.
 * Se llama cada vez que el carrito cambia.
 */
function actualizarUI() {
  const total      = calcularTotal();
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  /* Actualiza el número del badge en el botón de la cabecera */
  document.getElementById('badge').textContent = totalItems;

  const contenedor    = document.getElementById('contenido-carrito');
  const seccionPedido = document.getElementById('seccion-pedido');

  /* Si el carrito está vacío, muestra el mensaje vacío y oculta el formulario */
  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <div style="font-size:2.5rem">🛒</div>
        <p>Tu carrito está vacío.<br>Agrega algo del menú.</p>
      </div>`;
    seccionPedido.style.display = 'none';
    return; /* Sale de la función aquí, no sigue */
  }

  /* Si hay productos, genera la lista de ítems del carrito */
  contenedor.innerHTML = carrito.map(item => `
    <div class="item-carrito">
      <span class="item-emoji">${item.emoji}</span>
      <div class="item-info">
        <div class="item-nombre">${item.nombre}</div>
        <!-- Precio total del ítem: precio unitario × cantidad -->
        <div class="item-precio">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</div>
      </div>
      <div class="controles-cant">
        <!-- Botón para bajar cantidad -->
        <button class="btn-cant" onclick="cambiarCantidad(${item.id}, -1)">−</button>
        <span class="cant-num">${item.cantidad}</span>
        <!-- Botón para subir cantidad -->
        <button class="btn-cant" onclick="cambiarCantidad(${item.id}, +1)">+</button>
      </div>
    </div>
  `).join('');

  /* Actualiza el total mostrado en el panel */
  document.getElementById('total-display').textContent = '$' + total.toLocaleString('es-CO');

  /* Muestra el formulario y el botón de WhatsApp */
  seccionPedido.style.display = 'block';
}

/**
 * animarBadge()
 * Hace un pequeño efecto de rebote en el badge del carrito
 * cada vez que el usuario agrega un producto.
 */
function animarBadge() {
  const badge = document.getElementById('badge');
  badge.style.transform = 'scale(1.4)'; /* Se agranda */
  /* Después de 180ms vuelve a su tamaño normal */
  setTimeout(() => {
    badge.style.transform = 'scale(1)';
  }, 180);
}


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 4: PANEL DEL CARRITO (ABRIR / CERRAR)
════════════════════════════════════════════════════════════════ */

/**
 * abrirCarrito()
 * Muestra el fondo oscuro y hace subir el panel del carrito.
 * También bloquea el scroll del fondo para evitar confusión.
 */
function abrirCarrito() {
  document.getElementById('overlay').classList.add('activo'); /* Muestra el fondo oscuro */
  document.getElementById('panel').classList.add('activo');   /* Sube el panel */
  document.body.style.overflow = 'hidden';                    /* Bloquea el scroll */
}

/**
 * cerrarCarrito()
 * Oculta el panel y el fondo oscuro, y restaura el scroll.
 */
function cerrarCarrito() {
  document.getElementById('overlay').classList.remove('activo'); /* Oculta el fondo */
  document.getElementById('panel').classList.remove('activo');   /* Baja el panel */
  document.body.style.overflow = '';                             /* Restaura el scroll */
}


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 5: MÉTODO DE PAGO
   Cambia la información de pago según la opción seleccionada.
════════════════════════════════════════════════════════════════ */

/* Escucha cualquier cambio en los radio buttons de la página */
document.addEventListener('change', function (e) {

  /* Solo reacciona si el cambio fue en los radio buttons de método de pago */
  if (e.target.name === 'metodo_pago') {

    /* Muestra u oculta la info de Nequi según la selección */
    document.getElementById('info-pago-nequi').style.display =
      e.target.value === 'Nequi' ? 'block' : 'none';

    /* Muestra u oculta la info de Bancolombia según la selección */
    document.getElementById('info-pago-bancolombia').style.display =
      e.target.value === 'Bancolombia' ? 'block' : 'none';
  }
});


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 6: TOAST (NOTIFICACIÓN)
════════════════════════════════════════════════════════════════ */

/**
 * showToast(msg)
 * Muestra una pastilla de notificación con un mensaje y la oculta automáticamente.
 * @param {string} msg - El mensaje a mostrar
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;          /* Pone el mensaje */
  toast.classList.add('show');      /* Lo hace visible (sube desde abajo) */

  /* Después de 2.5 segundos lo oculta de nuevo */
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}


/* ════════════════════════════════════════════════════════════════
   SECCIÓN 7: ENVÍO DEL PEDIDO POR WHATSAPP
   El corazón del sistema: arma el mensaje y abre WhatsApp.
════════════════════════════════════════════════════════════════ */

/**
 * enviarPedido()
 * 1. Valida que el usuario haya llenado la dirección.
 * 2. Construye el mensaje de texto con los productos, total y datos del cliente.
 * 3. Abre WhatsApp con el mensaje ya escrito, listo para enviar.
 */
function enviarPedido() {

  /* ── Paso 1: Obtener los valores del formulario ── */
  const campoDir   = document.getElementById('campo-direccion');
  const errorDir   = document.getElementById('error-direccion');
  const direccion  = campoDir.value.trim(); /* .trim() elimina espacios al inicio y al final */
  const notas      = document.getElementById('campo-notas').value.trim();

  /* Obtiene el método de pago seleccionado. Si ninguno, usa 'Nequi' por defecto */
  const metodoPago = document.querySelector('input[name="metodo_pago"]:checked')?.value || 'Nequi';

  /* ── Paso 2: Validar que la dirección no esté vacía ── */
  if (!direccion) {
    /* Agrega clase de error (borde rojo) al campo */
    campoDir.classList.add('campo-error');
    /* Muestra el mensaje de error debajo del campo */
    errorDir.classList.add('visible');
    /* Pone el foco en el campo para que el usuario sepa dónde escribir */
    campoDir.focus();

    /* Después de 3 segundos quita el error automáticamente */
    setTimeout(() => {
      campoDir.classList.remove('campo-error');
      errorDir.classList.remove('visible');
    }, 3000);

    return; /* Sale de la función, no envía nada */
  }

  /* Seguridad extra: si el carrito está vacío no hace nada */
  if (carrito.length === 0) return;

  /* ── Paso 3: Construir la lista de productos del pedido ── */
  const lineas = carrito.map(item =>
    /* Formato de cada línea: • 🍊 Naranja natural x2 — $8.000 */
    `• ${item.emoji} ${item.nombre} x${item.cantidad} — $${(item.precio * item.cantidad).toLocaleString('es-CO')}`
  ).join('\n'); /* Une todas las líneas con salto de línea */

  /* Total formateado en pesos colombianos */
  const totalFormateado = '$' + calcularTotal().toLocaleString('es-CO');

  /* ── Paso 4: Armar el mensaje completo de WhatsApp ── */
  /* El asterisco (*texto*) es negrita en WhatsApp */
  let mensaje = `🍹 *Pedido - Juguería Sofi*\n\n`;
  mensaje += `${lineas}\n\n`;
  mensaje += `💰 *Total: ${totalFormateado}*\n\n`;
  mensaje += `📍 *Dirección:* ${direccion}\n`;
  mensaje += `💳 *Método de pago:* ${metodoPago}\n`;

  /* Las notas solo se incluyen si el usuario escribió algo */
  if (notas) {
    mensaje += `📝 *Notas:* ${notas}\n`;
  }

  mensaje += `\n⏳ Por favor confirma el pedido y envía los datos de pago.`;

  /* ── Paso 5: Abrir WhatsApp con el mensaje ── */
  /* Número del negocio: 57 (código Colombia) + 3236912959 */
  const numero = '573236912959';

  /* encodeURIComponent convierte el texto para que funcione en una URL */
  /* (los saltos de línea, tildes y emojis se convierten a formato URL) */
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  /* Abre WhatsApp en una nueva pestaña */
  window.open(url, '_blank');

  /* Muestra la notificación de confirmación */
  showToast('¡Pedido enviado! Revisa tu WhatsApp 🍹');
}


/* ════════════════════════════════════════════════════════════════
   INICIO DE LA APLICACIÓN
   Esta línea se ejecuta cuando el navegador termina de cargar el HTML.
   Llama a renderProductos() para dibujar el menú en pantalla.
════════════════════════════════════════════════════════════════ */
renderProductos();
