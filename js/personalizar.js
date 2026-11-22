/* ==========================================================================
   LECTOMENTE - js/personalizar.js  (pantalla personalizar.html)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  // Texto de ejemplo de la vista previa (una oración por línea)
  const LINEAS_EJEMPLO = [
    "La fotosíntesis permite a las plantas transformar la luz en energía.",
    "En los cloroplastos, la clorofila capta la luz del sol.",
    "Las raíces absorben agua y las hojas toman dióxido de carbono.",
    "Con estos elementos, la planta produce azúcares para crecer.",
    "Durante el proceso se libera oxígeno al ambiente.",
    "Los azúcares aportan energía y ayudan a formar nuevos tejidos.",
    "Así, las plantas sostienen muchas cadenas alimentarias.",
    "También contribuyen al equilibrio del aire que respiramos."
  ];

  // El perfil guardado es el punto de partida; los cambios se hacen sobre esta copia
  let perfil = leerPerfil();
  let hayCambiosSinGuardar = false;
  let avisoDeSalida = false;

  /* ---------- Elementos de la página ---------- */
  const vistaPrevia = document.getElementById("vista-previa");
  const estadoGuardado = document.getElementById("estado-guardado");
  const radiosColor = document.querySelectorAll('input[name="color"]');
  const botonesVoz = document.querySelectorAll("[data-voz]");

  const selFuente = document.getElementById("p-fuente");
  const rangoTam = document.getElementById("p-tam");
  const rangoInterlineado = document.getElementById("p-interlineado");
  const rangoPalabras = document.getElementById("p-palabras");
  const rangoVelocidad = document.getElementById("p-velocidad");

  const iOscuro = document.getElementById("i-oscuro");
  const iBionic = document.getElementById("i-bionic");
  const iRitmo = document.getElementById("i-ritmo");
  const iTransiciones = document.getElementById("i-transiciones");

  /* ---------- Dibujar la vista previa ---------- */
  function dibujarVista() {
    vistaPrevia.textContent = "";
    LINEAS_EJEMPLO.forEach(function (texto) {
      const parrafo = document.createElement("p");
      construirLinea(parrafo, texto, { bionic: perfil.bionic, glosario: null });
      vistaPrevia.appendChild(parrafo);
    });
  }

  // Pasa todos los valores del perfil a los controles y a la página
  function refrescar() {
    aplicarPerfil(perfil); // cambia las variables CSS y las clases del <body>
    dibujarVista();

    ponerInterruptor(iOscuro, perfil.modoOscuro);
    ponerInterruptor(iBionic, perfil.bionic);
    ponerInterruptor(iRitmo, perfil.ritmoGuiado);
    ponerInterruptor(iTransiciones, perfil.transiciones);

    selFuente.value = perfil.fuente;
    rangoTam.value = perfil.tamano;
    rangoInterlineado.value = perfil.interlineado;
    rangoPalabras.value = perfil.espacioPalabras;
    rangoVelocidad.value = perfil.velocidad;

    document.getElementById("v-tam").textContent = perfil.tamano + " px";
    document.getElementById("v-interlineado").textContent = perfil.interlineado + "%";
    document.getElementById("v-palabras").textContent = perfil.espacioPalabras + " px";
    document.getElementById("v-velocidad").textContent = perfil.velocidad + "x";

    radiosColor.forEach(function (radio) {
      radio.checked = radio.value === perfil.colorFondo;
      // El <label> es el padre directo de cada radio
      radio.parentNode.classList.toggle("seleccionada", radio.checked);
    });

    botonesVoz.forEach(function (boton) {
      boton.setAttribute("aria-pressed", boton.getAttribute("data-voz") === perfil.velocidadVoz ? "true" : "false");
    });
  }

  // Cada cambio avisa que todavía no se guardó
  function marcarCambio() {
    hayCambiosSinGuardar = true;
    avisoDeSalida = false;
    mostrarEstado(estadoGuardado, "Tienes cambios sin guardar.", "");
    refrescar();
  }

  /* ---------- Eventos de los controles ---------- */
  enlazarInterruptor(iOscuro, function (activo) {
    perfil.modoOscuro = activo;
    marcarCambio();
  });
  enlazarInterruptor(iBionic, function (activo) {
    perfil.bionic = activo;
    marcarCambio();
  });
  enlazarInterruptor(iRitmo, function (activo) {
    perfil.ritmoGuiado = activo;
    marcarCambio();
  });
  // Si el sistema pide menos movimiento, el CSS desactiva las transiciones aunque esté activado
  enlazarInterruptor(iTransiciones, function (activo) {
    perfil.transiciones = activo;
    marcarCambio();
  });

  radiosColor.forEach(function (radio) {
    radio.addEventListener("change", function () {
      perfil.colorFondo = radio.value;
      marcarCambio();
    });
  });

  selFuente.addEventListener("change", function () {
    perfil.fuente = selFuente.value;
    marcarCambio();
  });

  rangoTam.addEventListener("input", function () {
    perfil.tamano = Number(rangoTam.value);
    marcarCambio();
  });
  rangoInterlineado.addEventListener("input", function () {
    perfil.interlineado = Number(rangoInterlineado.value);
    marcarCambio();
  });
  rangoPalabras.addEventListener("input", function () {
    perfil.espacioPalabras = Number(rangoPalabras.value);
    marcarCambio();
  });
  rangoVelocidad.addEventListener("input", function () {
    // toFixed evita números como 1.2000000000000002
    perfil.velocidad = Number(Number(rangoVelocidad.value).toFixed(1));
    marcarCambio();
  });

  botonesVoz.forEach(function (boton) {
    boton.addEventListener("click", function () {
      perfil.velocidadVoz = boton.getAttribute("data-voz");
      marcarCambio();
    });
  });

  // Restaurar valores: vuelve a los valores iniciales (sin guardar todavía)
  document.getElementById("btn-restaurar").addEventListener("click", function () {
    const uso = perfil.uso;
    const dificultad = perfil.dificultad;
    perfil = copiarObjeto(PERFIL_INICIAL);
    perfil.uso = uso;
    perfil.dificultad = dificultad;
    hayCambiosSinGuardar = true;
    refrescar();
    mostrarEstado(estadoGuardado, "Valores restaurados. Aún no se guardaron en tu perfil.", "ok");
  });

  // Guardar en mi perfil
  document.getElementById("btn-guardar").addEventListener("click", function () {
    // (no visto en clase) localStorage, a través de perfil.js
    const guardado = guardarPerfil(perfil);
    if (guardado) {
      hayCambiosSinGuardar = false;
      mostrarEstado(estadoGuardado, "Listo: tu perfil se guardó. Se aplicará en tus próximas lecturas.", "ok");
    } else {
      mostrarEstado(estadoGuardado, "No se pudo guardar el perfil en este navegador. Revisa que no esté bloqueado o en modo privado.", "error");
    }
  });

  // Volver a la lectura: si hay cambios sin guardar, primero se avisa (prevención de errores)
  document.getElementById("btn-volver").addEventListener("click", function (evento) {
    if (hayCambiosSinGuardar && !avisoDeSalida) {
      evento.preventDefault();
      avisoDeSalida = true;
      mostrarEstado(estadoGuardado, "Tienes cambios sin guardar. Presiona «Guardar en mi perfil» o vuelve a elegir «Volver a la lectura» para salir sin guardarlos.", "error");
    }
  });

  /* ---------- Inicio ---------- */
  refrescar();
});
