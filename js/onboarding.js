/* ==========================================================================
   LECTOMENTE - js/onboarding.js  (pantalla onboarding.html
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const TOTAL_PASOS = 5;
  let pasoActual = 1;
  let perfil = leerPerfil();

  // Si ya hay un perfil guardado con respuestas, se considera que no es la primera vez
  const primeraVez = perfil.uso === "";
  let fuenteElegida = !primeraVez;
  let ningunoMarcado = false;

  // En la primera vez ningún apoyo viene marcado: la persona elige.
  if (primeraVez) perfil.guiaLinea = false;

  const NOMBRES = {
    uso: { estudio: "Estudio", trabajo: "Trabajo", acompano: "Acompaño a otras personas" },
    dificultad: {
      tdah: "Me distraigo con facilidad (TDAH)",
      dislexia: "Me cuesta distinguir letras y palabras (dislexia)",
      ambas: "Ambas cosas",
      manual: "Prefiero configurarlo yo"
    },
    fuente: { atkinson: "Atkinson Hyperlegible", lexend: "Lexend" }
  };

  const LINEAS_VISTA = [
    "Leer a tu ritmo puede hacer la diferencia.",
    "Ajusta la fuente y el espacio entre las palabras.",
    "Haz una pausa cuando lo necesites y continúa."
  ];

  /* ---------- Elementos de la página ---------- */
  const pasos = [];
  for (let i = 1; i <= TOTAL_PASOS; i++) {
    pasos.push(document.getElementById("paso-" + i));
  }
  const textoPaso = document.getElementById("texto-paso");
  const btnAtras = document.getElementById("btn-atras");
  const btnContinuar = document.getElementById("btn-continuar");
  const btnRestaurar = document.getElementById("btn-restaurar");
  const btnGuardar = document.getElementById("btn-guardar");
  const estadoPerfil = document.getElementById("estado-perfil");

  const radiosUso = document.querySelectorAll('input[name="uso"]');
  const radiosDificultad = document.querySelectorAll('input[name="dificultad"]');
  const radiosFuente = document.querySelectorAll('input[name="fuente"]');

  const apPausas = document.getElementById("ap-pausas");
  const apSin = document.getElementById("ap-sin");
  const apVoz = document.getElementById("ap-voz");
  const apGuia = document.getElementById("ap-guia");
  const apNinguno = document.getElementById("ap-ninguno");

  const p3Tam = document.getElementById("p3-tam");
  const p3Esp = document.getElementById("p3-esp");
  const cFuente = document.getElementById("c-fuente");
  const cTam = document.getElementById("c-tam");
  const cEsp = document.getElementById("c-esp");
  const cOscuro = document.getElementById("c-oscuro");
  const cBionic = document.getElementById("c-bionic");
  const cSin = document.getElementById("c-sin");

  /* ---------- Reglas del perfil según lo que cuesta al leer ---------- */
  // Son solo ajustes iniciales: la persona puede cambiarlos después.
  function aplicarDificultad(dificultad) {
    // Primero se vuelve a los valores iniciales de estos ajustes
    perfil.tamano = PERFIL_INICIAL.tamano;
    perfil.interlineado = PERFIL_INICIAL.interlineado;
    perfil.espacioPalabras = PERFIL_INICIAL.espacioPalabras;
    perfil.pausas = false;
    perfil.sinDistracciones = false;
    ningunoMarcado = false;

    if (dificultad === "tdah" || dificultad === "ambas") {
      perfil.pausas = true;            // TDAH activa pausas
      perfil.sinDistracciones = true;  // y modo sin distracciones
    }
    if (dificultad === "dislexia" || dificultad === "ambas") {
      perfil.tamano = 20;              // dislexia sube el tamaño
      perfil.interlineado = 170;       // y el espaciado
      perfil.espacioPalabras = 1;
    }
  }

  // Perfil con los valores iniciales (para "Restaurar")
  function perfilInicialOnboarding() {
    const nuevo = copiarObjeto(PERFIL_INICIAL);
    nuevo.guiaLinea = false;
    return nuevo;
  }

  /* ---------- Dibujar el estado en pantalla ---------- */
  function marcarGrupo(entradas) {
    entradas.forEach(function (entrada) {
      // El <label> es el padre directo de cada radio
      entrada.parentNode.classList.toggle("seleccionada", entrada.checked);
    });
  }

  function marcarRadios(entradas, valor) {
    entradas.forEach(function (entrada) {
      entrada.checked = entrada.value === valor;
    });
    marcarGrupo(entradas);
  }

  function dibujarVista(contenedor) {
    contenedor.textContent = "";
    LINEAS_VISTA.forEach(function (texto) {
      const parrafo = document.createElement("p");
      construirLinea(parrafo, texto, { bionic: perfil.bionic, glosario: null });
      contenedor.appendChild(parrafo);
    });
  }

  function dibujarPuntos() {
    for (let i = 1; i <= TOTAL_PASOS; i++) {
      const punto = document.getElementById("punto-" + i);
      punto.classList.toggle("hecho", i < pasoActual);
      punto.classList.toggle("actual", i === pasoActual);
      if (i < TOTAL_PASOS) {
        document.getElementById("linea-" + i).classList.toggle("hecho", i < pasoActual);
      }
    }
  }

  function dibujarApoyos() {
    apPausas.checked = perfil.pausas;
    apSin.checked = perfil.sinDistracciones;
    apVoz.checked = perfil.voz;
    apGuia.checked = perfil.guiaLinea;
    apNinguno.checked = ningunoMarcado;
    marcarGrupo([apPausas, apSin, apVoz, apGuia, apNinguno]);
  }

  // Vuelve a pintar todo según el perfil actual (en vivo)
  function refrescar() {
    aplicarPerfil(perfil);

    dibujarVista(document.getElementById("vista-previa"));
    dibujarVista(document.getElementById("vista-previa-3"));

    cFuente.value = perfil.fuente;
    cTam.value = perfil.tamano;
    cEsp.value = perfil.interlineado;
    p3Tam.value = perfil.tamano;
    p3Esp.value = perfil.interlineado;
    document.getElementById("c-tam-valor").textContent = perfil.tamano + " px";
    document.getElementById("p3-tam-valor").textContent = perfil.tamano + " px";
    document.getElementById("c-esp-valor").textContent = perfil.interlineado + "%";
    document.getElementById("p3-esp-valor").textContent = perfil.interlineado + "%";

    ponerInterruptor(cOscuro, perfil.modoOscuro);
    ponerInterruptor(cBionic, perfil.bionic);
    ponerInterruptor(cSin, perfil.sinDistracciones);

    if (fuenteElegida) {
      marcarRadios(radiosFuente, perfil.fuente);
    } else {
      marcarGrupo(radiosFuente);
    }
    dibujarApoyos();
  }

  /* ---------- Pasos ---------- */
  function textoApoyos() {
    const lista = [];
    if (perfil.pausas) lista.push("Pausas sugeridas");
    if (perfil.sinDistracciones) lista.push("Modo sin distracciones");
    if (perfil.voz) lista.push("Lectura en voz alta");
    if (perfil.guiaLinea) lista.push("Guía de línea");
    return lista.length ? lista.join(", ") : "Ninguno por ahora";
  }

  function dibujarResumen() {
    const resumen = document.getElementById("resumen");
    resumen.textContent = "";
    const filas = [
      ["Uso", NOMBRES.uso[perfil.uso] || "Sin elegir"],
      ["Lo que te cuesta", NOMBRES.dificultad[perfil.dificultad] || "Sin elegir"],
      ["Fuente", NOMBRES.fuente[perfil.fuente]],
      ["Tamaño de letra", perfil.tamano + " px"],
      ["Espaciado", perfil.interlineado + "%"],
      ["Apoyos", textoApoyos()],
      ["Modo oscuro", perfil.modoOscuro ? "Activado" : "Desactivado"],
      ["Bionic Reading", perfil.bionic ? "Activado" : "Desactivado"]
    ];
    filas.forEach(function (fila) {
      const contenedor = document.createElement("div");
      contenedor.className = "resumen-fila";
      const nombre = document.createElement("dt");
      nombre.textContent = fila[0];
      const valor = document.createElement("dd");
      valor.textContent = fila[1];
      contenedor.appendChild(nombre);
      contenedor.appendChild(valor);
      resumen.appendChild(contenedor);
    });
  }

  function mostrarPaso(numero, moverFoco) {
    pasoActual = numero;
    pasos.forEach(function (paso, indice) {
      paso.hidden = indice + 1 !== pasoActual;
    });
    textoPaso.textContent = "Paso " + pasoActual + " de " + TOTAL_PASOS;
    btnContinuar.textContent = pasoActual === TOTAL_PASOS ? "Guardar perfil" : "Continuar";
    dibujarPuntos();
    if (pasoActual === TOTAL_PASOS) dibujarResumen();

    // Se limpian los errores y se lleva el foco al título del paso (teclado y lector de pantalla)
    for (let i = 1; i <= TOTAL_PASOS; i++) {
      mostrarEstado(document.getElementById("error-" + i), "", "");
    }
    if (moverFoco) {
      const titulo = pasos[pasoActual - 1].querySelector("legend, h2");
      titulo.setAttribute("tabindex", "-1");
      titulo.focus();
    }
  }

  // Devuelve un mensaje de error si falta elegir algo, o "" si todo está bien
  function validarPaso(numero) {
    if (numero === 1 && perfil.uso === "") {
      return "Falta elegir una opción: ¿para qué usarás LectoMente?";
    }
    if (numero === 2 && perfil.dificultad === "") {
      return "Falta elegir una opción. Si no estás seguro, elige «Prefiero configurarlo yo».";
    }
    if (numero === 3 && !fuenteElegida) {
      return "Falta elegir una fuente para continuar.";
    }
    if (numero === 4 && textoApoyos() === "Ninguno por ahora" && !ningunoMarcado) {
      return "Elige al menos un apoyo o marca «Ninguno por ahora».";
    }
    return "";
  }

  function guardarYContinuar() {
    const guardado = guardarPerfil(perfil);
    if (!guardado) {
      mostrarEstado(estadoPerfil, "No se pudo guardar el perfil en este navegador. Revisa que no esté bloqueado o en modo privado.", "error");
      mostrarEstado(document.getElementById("error-5"), "No se pudo guardar el perfil. Inténtalo de nuevo.", "error");
      return;
    }
    mostrarEstado(estadoPerfil, "Perfil guardado. Te llevamos a preparar tu texto…", "ok");
    setTimeout(function () {
      window.location.href = "preparacion.html";
    }, 700);
  }

  /* ---------- Botones Atrás y Continuar ---------- */
  btnAtras.addEventListener("click", function () {
    if (pasoActual === 1) {
      window.location.href = "index.html"; // salir sin perder nada
    } else {
      mostrarPaso(pasoActual - 1, true);
    }
  });

  btnContinuar.addEventListener("click", function () {
    const error = validarPaso(pasoActual);
    if (error !== "") {
      // No se avanza: se explica qué falta, junto al grupo
      mostrarEstado(document.getElementById("error-" + pasoActual), error, "error");
      return;
    }
    if (pasoActual === TOTAL_PASOS) {
      guardarYContinuar();
    } else {
      mostrarPaso(pasoActual + 1, true);
    }
  });

  /* ---------- Respuestas del formulario ---------- */
  radiosUso.forEach(function (radio) {
    radio.addEventListener("change", function () {
      perfil.uso = radio.value;
      marcarGrupo(radiosUso);
      mostrarEstado(document.getElementById("error-1"), "", "");
    });
  });

  radiosDificultad.forEach(function (radio) {
    radio.addEventListener("change", function () {
      perfil.dificultad = radio.value;
      aplicarDificultad(radio.value);
      marcarGrupo(radiosDificultad);
      mostrarEstado(document.getElementById("error-2"), "", "");
      refrescar();
    });
  });

  radiosFuente.forEach(function (radio) {
    radio.addEventListener("change", function () {
      perfil.fuente = radio.value;
      fuenteElegida = true;
      mostrarEstado(document.getElementById("error-3"), "", "");
      refrescar();
    });
  });

  // Tamaño y espaciado (paso 3 y tarjeta de la derecha comparten el mismo perfil)
  function cambiarTamano(evento) {
    perfil.tamano = Number(evento.target.value);
    refrescar();
  }
  function cambiarEspaciado(evento) {
    perfil.interlineado = Number(evento.target.value);
    refrescar();
  }
  p3Tam.addEventListener("input", cambiarTamano);
  cTam.addEventListener("input", cambiarTamano);
  p3Esp.addEventListener("input", cambiarEspaciado);
  cEsp.addEventListener("input", cambiarEspaciado);

  cFuente.addEventListener("change", function () {
    perfil.fuente = cFuente.value;
    fuenteElegida = true;
    refrescar();
  });

  enlazarInterruptor(cOscuro, function (activo) {
    perfil.modoOscuro = activo;
    refrescar();
  });
  enlazarInterruptor(cBionic, function (activo) {
    perfil.bionic = activo;
    refrescar();
  });
  enlazarInterruptor(cSin, function (activo) {
    perfil.sinDistracciones = activo;
    refrescar();
  });

  // Paso 4: apoyos. "Ninguno por ahora" quita los demás y al revés.
  function cambiarApoyo(clave, casilla) {
    casilla.addEventListener("change", function () {
      perfil[clave] = casilla.checked;
      if (casilla.checked) ningunoMarcado = false;
      mostrarEstado(document.getElementById("error-4"), "", "");
      refrescar();
    });
  }
  cambiarApoyo("pausas", apPausas);
  cambiarApoyo("sinDistracciones", apSin);
  cambiarApoyo("voz", apVoz);
  cambiarApoyo("guiaLinea", apGuia);

  apNinguno.addEventListener("change", function () {
    ningunoMarcado = apNinguno.checked;
    if (ningunoMarcado) {
      perfil.pausas = false;
      perfil.sinDistracciones = false;
      perfil.voz = false;
      perfil.guiaLinea = false;
    }
    mostrarEstado(document.getElementById("error-4"), "", "");
    refrescar();
  });

  /* ---------- Tarjeta de la derecha: Restaurar y Guardar ---------- */
  btnRestaurar.addEventListener("click", function () {
    const uso = perfil.uso;
    const dificultad = perfil.dificultad;
    perfil = perfilInicialOnboarding();
    perfil.uso = uso;
    perfil.dificultad = dificultad;
    if (dificultad !== "") aplicarDificultad(dificultad);
    fuenteElegida = false;
    refrescar();
    mostrarEstado(estadoPerfil, "Valores restaurados. Aún no se guardaron.", "ok");
  });

  btnGuardar.addEventListener("click", guardarYContinuar);

  /* ---------- Inicio ---------- */
  marcarRadios(radiosUso, perfil.uso);
  marcarRadios(radiosDificultad, perfil.dificultad);
  refrescar();
  mostrarPaso(1, false);
});
