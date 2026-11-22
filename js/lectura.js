/* ==========================================================================
   LECTOMENTE - js/lectura.js  (pantalla lectura.html
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Constantes ---------- */
  const MINUTOS_PARA_PAUSA = 1; // cambiar a 25 en uso real
  const SEGUNDOS_POR_LINEA = 3; // ritmo guiado base; se divide entre la velocidad del perfil

  // Glosario: términos con definición y ejemplo.
  // Si el texto cargado no contiene estas palabras, simplemente no se marca
  // ninguna palabra y no pasa nada (construirLinea solo marca lo que está aquí).
  const GLOSARIO = {
    cloroplasto: {
      nombre: "Cloroplasto",
      definicion: "Parte de la célula vegetal donde ocurre la fotosíntesis.",
      ejemplo: "Es como la cocina de la planta: allí se prepara su alimento."
    },
    clorofila: {
      nombre: "Clorofila",
      definicion: "Pigmento verde que absorbe la luz del sol dentro de los cloroplastos.",
      ejemplo: "Es como un panel solar diminuto: capta la luz para que la planta la use."
    },
    fotosintesis: {
      nombre: "Fotosíntesis",
      definicion: "Proceso por el que las plantas usan luz, agua y dióxido de carbono para producir azúcares y oxígeno.",
      ejemplo: "Es como cocinar usando la luz del sol en lugar del fuego."
    },
    glucosa: {
      nombre: "Glucosa",
      definicion: "Azúcar sencillo que la planta produce y usa como energía.",
      ejemplo: "Es el combustible que la planta gasta para crecer."
    },
    estoma: {
      nombre: "Estoma",
      definicion: "Poro diminuto de las hojas por donde entra el dióxido de carbono y sale el oxígeno.",
      ejemplo: "Son como pequeñas ventanas que la hoja abre y cierra para respirar."
    }
  };

  /* ---------- Elementos de la página ---------- */
  const contenidoLectura = document.getElementById("contenido-lectura");
  const zonaTexto = document.getElementById("zona-texto");
  const contenedorLineas = document.getElementById("lineas");
  const lateral = document.getElementById("lateral");
  const estadoProgreso = document.getElementById("estado-progreso");
  const barraProgreso = document.getElementById("barra-progreso");
  const rellenoProgreso = document.getElementById("relleno-progreso");
  const estadoGuardado = document.getElementById("estado-guardado");
  const estadoLectura = document.getElementById("estado-lectura");
  const mensajeVoz = document.getElementById("mensaje-voz");
  const barraInferior = document.getElementById("barra-inferior");

  const tarjetaPausa = document.getElementById("tarjeta-pausa");
  const tarjetaDescanso = document.getElementById("tarjeta-descanso");
  const tarjetaDificultad = document.getElementById("tarjeta-dificultad");
  const tarjetaGlosario = document.getElementById("tarjeta-glosario");

  const iGuia = document.getElementById("i-guia");
  const iBionic = document.getElementById("i-bionic");
  const iRitmo = document.getElementById("i-ritmo");
  const iSin = document.getElementById("i-sin");
  const selNivel = document.getElementById("sel-nivel");
  const botonesVoz = document.querySelectorAll("[data-voz]");

  /* ---------- Datos: perfil, texto y posición ---------- */
  const perfil = leerPerfil();
  const datos = leerTexto();

  // Prevención de errores: si no hay texto cargado, se explica y se ofrece volver
  if (!datos || !datos.texto) {
    contenedorLineas.textContent = "";
    const aviso = document.createElement("p");
    aviso.className = "linea";
    aviso.textContent = "Todavía no hay un texto para leer. Vuelve a preparar tu texto.";
    contenedorLineas.appendChild(aviso);
    const enlace = document.createElement("a");
    enlace.className = "app-boton-acento";
    enlace.href = "preparacion.html";
    enlace.textContent = "Ir a preparación";
    contenedorLineas.appendChild(enlace);
    estadoGuardado.hidden = true;
    barraInferior.hidden = true;
    estadoProgreso.textContent = "Sin texto cargado";
    return;
  }

  document.getElementById("titulo-texto").textContent = datos.titulo;
  document.title = datos.titulo + " - LectoMente";

  let nivel = datos.nivel || "mediano";
  let bloques = dividirEnBloques(datos.texto, nivel);
  const idTexto = identificarTexto(datos);

  // Posición actual (bloque y línea). Se recupera de localStorage si es del mismo texto.
  let bloqueActual = 0;
  let lineaActual = 0;
  const guardada = leerPosicion();
  if (guardada && guardada.idTexto === idTexto) {
    if (guardada.nivel && guardada.nivel !== nivel) {
      // El nivel cambió desde la última vez: se busca la misma oración en los bloques nuevos
      const bloquesViejos = dividirEnBloques(datos.texto, guardada.nivel);
      const indice = indiceDeOracion(bloquesViejos, guardada.bloque, guardada.linea);
      const nueva = posicionDeOracion(bloques, indice);
      bloqueActual = nueva.bloque;
      lineaActual = nueva.linea;
    } else {
      bloqueActual = Math.min(Number(guardada.bloque) || 0, bloques.length - 1);
      lineaActual = Math.min(Number(guardada.linea) || 0, bloques[bloqueActual].length - 1);
    }
  }

  /* ---------- Ajustes de esta sesión (empiezan con el perfil guardado) ---------- */
  const ajustes = {
    guia: perfil.guiaLinea,
    bionic: perfil.bionic,
    ritmo: perfil.ritmoGuiado,
    sin: perfil.sinDistracciones,
    vozVelocidad: perfil.velocidadVoz
  };

  // Para detectar dificultades: cuántas veces se volvió a cada bloque con "Anterior"
  let retornos = {};

  /* ---------- Guardar la posición ---------- */
  function guardarPosActual() {
    guardarPosicion({ idTexto: idTexto, nivel: nivel, bloque: bloqueActual, linea: lineaActual });
  }

  /* ---------- Estado visible: bloque X de Y y minutos restantes ---------- */
  function actualizarProgreso() {
    let palabrasRestantes = 0;
    for (let i = bloqueActual; i < bloques.length; i++) {
      palabrasRestantes += contarPalabras(bloques[i].join(" "));
    }
    const minutos = Math.max(1, Math.ceil(palabrasRestantes / PALABRAS_POR_MINUTO));
    const textoMinutos = minutos === 1 ? "1 min restante" : minutos + " min restantes";

    estadoProgreso.textContent = "Bloque " + (bloqueActual + 1) + " de " + bloques.length + " · " + textoMinutos;
    barraProgreso.setAttribute("aria-valuemax", bloques.length);
    barraProgreso.setAttribute("aria-valuenow", bloqueActual + 1);
    rellenoProgreso.style.width = ((bloqueActual + 1) / bloques.length * 100) + "%";
  }

  /* ---------- Dibujar el bloque actual ---------- */
  function lineasEnPantalla() {
    return contenedorLineas.querySelectorAll(".linea");
  }

  function marcarLinea() {
    lineasEnPantalla().forEach(function (linea, indice) {
      const esActual = ajustes.guia && indice === lineaActual;
      linea.classList.toggle("actual", esActual);
      if (esActual) {
        linea.setAttribute("aria-current", "true");
      } else {
        linea.removeAttribute("aria-current");
      }
    });
  }

  function dibujarBloque() {
    contenedorLineas.textContent = "";
    bloques[bloqueActual].forEach(function (oracion, indice) {
      const linea = document.createElement("p");
      linea.className = "linea";
      // Con "Sin distracciones" no se marcan las palabras del glosario
      construirLinea(linea, oracion, {
        bionic: ajustes.bionic,
        glosario: ajustes.sin ? null : GLOSARIO,
        alPulsar: abrirGlosario
      });
      // Clic en una línea: pasa a ser la línea actual
      linea.addEventListener("click", function () {
        seleccionarLinea(indice);
      });
      contenedorLineas.appendChild(linea);
    });
    marcarLinea();
    actualizarProgreso();
  }

  function seleccionarLinea(indice) {
    lineaActual = indice;
    marcarLinea();
    guardarPosActual();
  }

  function irABloque(numero, linea) {
    detenerVoz();
    cerrarGlosario(false);
    bloqueActual = numero;
    lineaActual = linea;
    dibujarBloque();
    guardarPosActual();
    mostrarEstado(estadoLectura, "", "");
    // Se vuelve a escribir el texto para que el lector de pantalla confirme el guardado
    estadoGuardado.textContent = "Posición guardada automáticamente";
  }

  /* ---------- Anterior y Siguiente ---------- */
  document.getElementById("btn-siguiente").addEventListener("click", function () {
    if (bloqueActual < bloques.length - 1) {
      irABloque(bloqueActual + 1, 0);
    } else {
      mostrarEstado(estadoLectura, "Llegaste al final del texto.", "ok");
    }
  });

  document.getElementById("btn-anterior").addEventListener("click", function () {
    if (bloqueActual === 0) {
      mostrarEstado(estadoLectura, "Estás en el primer bloque.", "");
      return;
    }
    irABloque(bloqueActual - 1, 0);

    // US06: si se vuelve 2 o más veces al mismo bloque, se ofrece una ayuda
    retornos[bloqueActual] = (retornos[bloqueActual] || 0) + 1;
    if (retornos[bloqueActual] >= 2) {
      tarjetaDificultad.hidden = false;
      actualizarLateral();
    }
  });

  // Mover la línea con las flechas arriba y abajo
  function moverLinea(paso) {
    const nueva = lineaActual + paso;
    if (nueva >= 0 && nueva < bloques[bloqueActual].length) {
      seleccionarLinea(nueva);
    } else if (paso > 0 && bloqueActual < bloques.length - 1) {
      irABloque(bloqueActual + 1, 0);
    } else if (paso < 0 && bloqueActual > 0) {
      irABloque(bloqueActual - 1, bloques[bloqueActual - 1].length - 1);
    }
  }

  document.addEventListener("keydown", function (evento) {
    const etiqueta = evento.target.tagName;
    if (evento.key === "Escape") {
      if (!tarjetaGlosario.hidden) cerrarGlosario(true);
      return;
    }
    // No se interfiere cuando la persona está usando un selector o un control deslizante
    if (etiqueta === "SELECT" || etiqueta === "INPUT" || etiqueta === "TEXTAREA") return;
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      moverLinea(1);
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      moverLinea(-1);
    }
  });

  /* ---------- Tamaño de bloque (mantiene la posición) ---------- */
  function cambiarNivel(nuevoNivel) {
    // Se guarda en qué oración estaba la persona y se busca la misma en los bloques nuevos
    const indice = indiceDeOracion(bloques, bloqueActual, lineaActual);
    detenerVoz();
    cerrarGlosario(false);
    nivel = nuevoNivel;
    bloques = dividirEnBloques(datos.texto, nivel);
    const nueva = posicionDeOracion(bloques, indice);
    bloqueActual = nueva.bloque;
    lineaActual = nueva.linea;
    retornos = {};

    // Se guarda el nuevo nivel y los bloques en localStorage para la próxima vez
    datos.nivel = nivel;
    datos.bloques = bloques;
    guardarTexto(datos);

    selNivel.value = nivel;
    dibujarBloque();
    guardarPosActual();
  }

  selNivel.addEventListener("change", function () {
    cambiarNivel(selNivel.value);
    mostrarEstado(estadoLectura, "Tamaño de bloque: " + NOMBRES_NIVEL[nivel] + ". Sigues en la misma oración.", "ok");
  });

  /* ---------- Tarjetas laterales ---------- */
  // Muestra u oculta la columna de la derecha según las tarjetas visibles
  function actualizarLateral() {
    const hayAviso = !tarjetaPausa.hidden || !tarjetaDescanso.hidden || !tarjetaDificultad.hidden;
    const hayAlguna = hayAviso || !tarjetaGlosario.hidden;
    contenidoLectura.classList.toggle("sin-lateral", !hayAlguna);
    // En "Sin distracciones" los avisos importantes aparecen flotando
    lateral.classList.toggle("con-pausa", hayAviso);
  }

  /* ---------- Glosario ---------- */
  let botonTermino = null;

  function abrirGlosario(clave, boton) {
    const termino = GLOSARIO[clave];
    if (!termino) return;
    botonTermino = boton;
    document.getElementById("glosario-termino").textContent = termino.nombre;
    document.getElementById("glosario-definicion").textContent = termino.definicion;
    document.getElementById("glosario-ejemplo").textContent = termino.ejemplo;
    tarjetaGlosario.hidden = false;
    actualizarLateral();
    // La lectura no se mueve: solo el foco pasa a la tarjeta
    document.getElementById("btn-cerrar-glosario").focus();
  }

  function cerrarGlosario(devolverFoco) {
    if (tarjetaGlosario.hidden) return;
    tarjetaGlosario.hidden = true;
    actualizarLateral();
    if (devolverFoco) {
      if (botonTermino && document.body.contains(botonTermino)) {
        botonTermino.focus();
      } else {
        zonaTexto.focus();
      }
    }
  }

  document.getElementById("btn-cerrar-glosario").addEventListener("click", function () {
    cerrarGlosario(true);
  });

  /* ---------- Detección de dificultades (US06) ---------- */
  document.getElementById("btn-bloques-cortos").addEventListener("click", function () {
    tarjetaDificultad.hidden = true;
    actualizarLateral();
    cambiarNivel("muy-corto");
    mostrarEstado(estadoLectura, "Listo: bloques más cortos. Sigues en la misma oración.", "ok");
  });

  document.getElementById("btn-no-cortos").addEventListener("click", function () {
    tarjetaDificultad.hidden = true;
    retornos[bloqueActual] = 0; // necesita volver 2 veces más para que se ofrezca otra vez
    actualizarLateral();
  });

  /* ---------- Interruptores ---------- */
  enlazarInterruptor(iGuia, function (activo) {
    ajustes.guia = activo;
    marcarLinea();
    if (!activo && ajustes.ritmo) {
      // El ritmo guiado necesita la guía de línea
      ajustes.ritmo = false;
      ponerInterruptor(iRitmo, false);
      detenerRitmo();
      mostrarEstado(estadoLectura, "Se desactivó también el ritmo guiado, porque usa la guía de línea.", "");
    }
  });

  enlazarInterruptor(iBionic, function (activo) {
    ajustes.bionic = activo;
    dibujarBloque();
  });

  enlazarInterruptor(iRitmo, function (activo) {
    ajustes.ritmo = activo;
    if (activo) {
      if (!ajustes.guia) {
        ajustes.guia = true;
        ponerInterruptor(iGuia, true);
        marcarLinea();
      }
      programarRitmo();
      mostrarEstado(estadoLectura, "Ritmo guiado activado.", "");
    } else {
      detenerRitmo();
      mostrarEstado(estadoLectura, "Ritmo guiado desactivado.", "");
    }
  });

  enlazarInterruptor(iSin, function (activo) {
    ajustes.sin = activo;
    document.body.classList.toggle("sin-distracciones", activo);
    cerrarGlosario(false);
    dibujarBloque(); // vuelve a dibujar para quitar o poner las marcas del glosario
    actualizarLateral();
  });

  /* ---------- Ritmo guiado (setTimeout) ---------- */
  let temporizador = null;

  function detenerRitmo() {
    if (temporizador !== null) {
      clearTimeout(temporizador);
      temporizador = null;
    }
  }

  function programarRitmo() {
    detenerRitmo();
    if (!ajustes.ritmo) return;
    // Más velocidad = menos segundos por línea
    const milisegundos = (SEGUNDOS_POR_LINEA / perfil.velocidad) * 1000;
    temporizador = setTimeout(function () {
      avanzarPorRitmo();
      programarRitmo();
    }, milisegundos);
  }

  function avanzarPorRitmo() {
    if (estadoVoz === "reproduciendo") return; // si la voz está leyendo, ella manda
    if (lineaActual < bloques[bloqueActual].length - 1) {
      seleccionarLinea(lineaActual + 1);
    } else if (bloqueActual < bloques.length - 1) {
      irABloque(bloqueActual + 1, 0);
    } else {
      // Fin del texto: el ritmo se apaga solo
      ajustes.ritmo = false;
      ponerInterruptor(iRitmo, false);
      detenerRitmo();
      mostrarEstado(estadoLectura, "Llegaste al final del texto. El ritmo guiado se detuvo.", "ok");
    }
  }

  /* ---------- Voz (speechSynthesis) ---------- */
  // Detecta si el navegador soporta la API de voz y si hay voces disponibles
  const hayVoz = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let estadoVoz = "detenida"; // detenida, reproduciendo o pausada
  let idVoz = 0;              // sirve para ignorar avisos de lecturas que ya se cancelaron

  function marcarBotonVoz() {
    botonesVoz.forEach(function (boton) {
      boton.setAttribute("aria-pressed", boton.getAttribute("data-voz") === ajustes.vozVelocidad ? "true" : "false");
    });
  }

  function hablarLinea(indice) {
    idVoz++;
    const miId = idVoz;
    const frase = bloques[bloqueActual][indice];
    const lectura = new SpeechSynthesisUtterance(frase);
    lectura.lang = "es-ES";
    lectura.rate = VELOCIDADES_VOZ[ajustes.vozVelocidad];

    lectura.onend = function () {
      if (miId !== idVoz || estadoVoz !== "reproduciendo") return;
      if (indice + 1 < bloques[bloqueActual].length) {
        seleccionarLinea(indice + 1);
        hablarLinea(indice + 1);
      } else {
        estadoVoz = "detenida";
        mostrarEstado(mensajeVoz, "Terminó la lectura de este bloque.", "");
      }
    };
    lectura.onerror = function (evento) {
      if (miId !== idVoz) return;
      if (evento.error === "canceled" || evento.error === "interrupted") return;
      estadoVoz = "detenida";
      mostrarEstado(mensajeVoz, "No se pudo reproducir la voz. Prueba con otro navegador o revisa el volumen.", "error");
    };

    estadoVoz = "reproduciendo";
    window.speechSynthesis.speak(lectura);
  }

  function reproducirVoz() {
    if (!hayVoz) {
      mostrarEstado(mensajeVoz, "Tu navegador no permite la lectura en voz alta. Prueba con Chrome, Edge o Safari actualizado.", "error");
      return;
    }
    if (estadoVoz === "pausada") {
      window.speechSynthesis.resume();
      estadoVoz = "reproduciendo";
      mostrarEstado(mensajeVoz, "Reproduciendo…", "");
      return;
    }
    if (estadoVoz === "reproduciendo") return;
    mostrarEstado(mensajeVoz, "Reproduciendo…", "");
    hablarLinea(lineaActual);
  }

  function pausarVoz() {
    if (!hayVoz) {
      mostrarEstado(mensajeVoz, "Tu navegador no permite la lectura en voz alta.", "error");
      return;
    }
    if (estadoVoz === "reproduciendo") {
      window.speechSynthesis.pause();
      estadoVoz = "pausada";
      mostrarEstado(mensajeVoz, "Voz en pausa. Presiona Reproducir para seguir.", "");
    }
  }

  function detenerVoz() {
    if (hayVoz && estadoVoz !== "detenida") {
      idVoz++;
      window.speechSynthesis.cancel();
      estadoVoz = "detenida";
      mostrarEstado(mensajeVoz, "Voz detenida.", "");
    }
  }

  document.getElementById("btn-reproducir").addEventListener("click", reproducirVoz);
  document.getElementById("btn-pausar").addEventListener("click", pausarVoz);
  document.getElementById("btn-detener").addEventListener("click", detenerVoz);

  botonesVoz.forEach(function (boton) {
    boton.addEventListener("click", function () {
      ajustes.vozVelocidad = boton.getAttribute("data-voz");
      marcarBotonVoz();
      if (!hayVoz) {
        mostrarEstado(mensajeVoz, "Tu navegador no permite la lectura en voz alta.", "error");
      } else if (estadoVoz === "reproduciendo") {
        mostrarEstado(mensajeVoz, "La nueva velocidad se aplica desde la siguiente línea.", "");
      }
    });
  });

  /* ---------- Pausa sugerida ---------- */
  let inicioLectura = Date.now(); // desde cuándo se lee sin descansar
  let ultimoAviso = Date.now();   // último momento en que se ofreció o se rechazó la pausa

  function revisarPausa() {
    const ahora = Date.now();
    const hayTarjeta = !tarjetaPausa.hidden || !tarjetaDescanso.hidden;
    if (perfil.pausas && !hayTarjeta && ahora - ultimoAviso >= MINUTOS_PARA_PAUSA * 60000) {
      // Minutos reales de lectura (mínimo 1)
      const minutos = Math.max(1, Math.round((ahora - inicioLectura) / 60000));
      document.getElementById("texto-pausa").textContent =
        "Llevas " + minutos + (minutos === 1 ? " minuto" : " minutos") + " leyendo. ¿Quieres tomar una pausa?";
      tarjetaPausa.hidden = false;
      actualizarLateral();
    }
    setTimeout(revisarPausa, 5000);
  }

  document.getElementById("btn-seguir").addEventListener("click", function () {
    tarjetaPausa.hidden = true;
    ultimoAviso = Date.now(); // se vuelve a preguntar dentro de otros MINUTOS_PARA_PAUSA
    actualizarLateral();
  });

  document.getElementById("btn-tomar-pausa").addEventListener("click", function () {
    // Se detienen el ritmo guiado y la voz; la posición queda guardada
    detenerVoz();
    ajustes.ritmo = false;
    ponerInterruptor(iRitmo, false);
    detenerRitmo();
    tarjetaPausa.hidden = true;
    tarjetaDescanso.hidden = false;
    actualizarLateral();
    document.getElementById("btn-volver-leer").focus();
  });

  document.getElementById("btn-volver-leer").addEventListener("click", function () {
    tarjetaDescanso.hidden = true;
    inicioLectura = Date.now();
    ultimoAviso = Date.now();
    actualizarLateral();
    zonaTexto.focus();
    mostrarEstado(estadoLectura, "Volviste a la lectura. Sigues en el mismo lugar.", "ok");
  });

  /* ---------- Espacio inferior para que la barra no tape el texto ---------- */
  function ajustarEspacioInferior() {
    document.body.style.setProperty("--alto-barra", (barraInferior.offsetHeight + 32) + "px");
  }
  window.addEventListener("resize", ajustarEspacioInferior);

  /* ---------- Inicio ---------- */
  selNivel.value = nivel;
  ponerInterruptor(iGuia, ajustes.guia);
  ponerInterruptor(iBionic, ajustes.bionic);
  ponerInterruptor(iRitmo, ajustes.ritmo);
  ponerInterruptor(iSin, ajustes.sin);
  document.body.classList.toggle("sin-distracciones", ajustes.sin);
  marcarBotonVoz();

  if (!hayVoz) {
    mostrarEstado(mensajeVoz, "Tu navegador no permite la lectura en voz alta. Prueba con Chrome, Edge o Safari actualizado.", "error");
  }

  dibujarBloque();
  actualizarLateral();
  guardarPosActual();
  ajustarEspacioInferior();
  programarRitmo();
  setTimeout(revisarPausa, 5000);
});
