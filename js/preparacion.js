/* ==========================================================================
   LECTOMENTE - js/preparacion.js  (pantalla preparacion.html)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB
  const MINIMO_CARACTERES = 20;

  // Texto guardado antes (por ejemplo, si la persona volvió con "Salir" desde la lectura)
  let datos = leerTexto();
  let nivel = datos && datos.nivel ? datos.nivel : "mediano";

  /* ---------- Elementos de la página ---------- */
  const tarjetaCarga = document.getElementById("tarjeta-carga");
  const tarjetaCargado = document.getElementById("tarjeta-cargado");
  const inputArchivo = document.getElementById("archivo");
  const cajaPegado = document.getElementById("pegado");
  const btnUsarPegado = document.getElementById("btn-usar-pegado");
  const btnCambiar = document.getElementById("btn-cambiar");
  const btnCancelar = document.getElementById("btn-cancelar");
  const btnIniciar = document.getElementById("btn-iniciar");
  const estadoCarga = document.getElementById("estado-carga");
  const estadoIniciar = document.getElementById("estado-iniciar");
  const radiosNivel = document.querySelectorAll('input[name="nivel"]');

  /* ---------- Dibujar la pantalla según el texto cargado ---------- */
  function textoDeBloques(cantidad) {
    return cantidad === 1 ? "1 bloque" : cantidad + " bloques";
  }

  function marcarNivel() {
    radiosNivel.forEach(function (radio) {
      radio.checked = radio.value === nivel;
      // El <label> es el padre directo de cada radio
      radio.parentNode.classList.toggle("seleccionada", radio.checked);
    });
  }

  function dibujarResumen() {
    const lista = document.getElementById("lista-resumen");
    lista.textContent = "";

    if (!datos) {
      const vacio = document.createElement("li");
      vacio.textContent = "Aún no hay texto cargado.";
      lista.appendChild(vacio);
      return;
    }

    // Resumen previo: las primeras 4 oraciones del texto
    const oraciones = dividirOraciones(datos.texto.split("\n").join(" "));
    oraciones.slice(0, 4).forEach(function (oracion) {
      const item = document.createElement("li");
      item.textContent = oracion;
      lista.appendChild(item);
    });
  }

  function dibujarVistaBloques() {
    const contenedor = document.getElementById("vista-bloques");
    contenedor.textContent = "";
    const mas = document.getElementById("mas-bloques");

    if (!datos) {
      document.getElementById("cantidad-bloques").textContent = "0 bloques";
      mas.hidden = true;
      return;
    }

    document.getElementById("cantidad-bloques").textContent = textoDeBloques(datos.bloques.length);

    // Se muestran solo los 3 primeros, con líneas grises tipo esqueleto
    const primeros = datos.bloques.slice(0, 3);
    primeros.forEach(function (bloque, indice) {
      const tarjeta = document.createElement("div");
      tarjeta.className = "bloque-esqueleto";

      const titulo = document.createElement("p");
      titulo.textContent = "Bloque " + (indice + 1);
      tarjeta.appendChild(titulo);

      const linea1 = document.createElement("div");
      linea1.className = "esqueleto-linea";
      linea1.setAttribute("aria-hidden", "true");
      const linea2 = document.createElement("div");
      linea2.className = "esqueleto-linea corta";
      linea2.setAttribute("aria-hidden", "true");
      tarjeta.appendChild(linea1);
      tarjeta.appendChild(linea2);

      contenedor.appendChild(tarjeta);
    });

    mas.hidden = datos.bloques.length <= 3;
  }

  function dibujarTodo() {
    // Tarjeta de carga o tarjeta de "Texto cargado"
    const hayTexto = datos !== null;
    tarjetaCarga.hidden = hayTexto;
    tarjetaCargado.hidden = !hayTexto;

    if (hayTexto) {
      document.getElementById("nombre-texto").textContent = datos.nombreArchivo;
      // Tiempo de lectura: palabras / 200 por minuto
      const minutos = minutosDeLectura(contarPalabras(datos.texto));
      document.getElementById("tiempo").textContent = minutos + " min";
    } else {
      document.getElementById("tiempo").textContent = "— min";
    }

    dibujarResumen();
    dibujarVistaBloques();
    marcarNivel();
  }

  /* ---------- Cargar el texto ---------- */
  function tituloDesdeNombre(nombre) {
    const punto = nombre.lastIndexOf(".");
    return punto > 0 ? nombre.slice(0, punto) : nombre;
  }

  // Guarda el texto en memoria y actualiza la pantalla
  function cargarTexto(nombreArchivo, titulo, texto, esDemo) {
    if (texto.trim().length < MINIMO_CARACTERES) {
      mostrarEstado(estadoCarga, "El texto es muy corto para dividirlo en bloques. Escribe o sube un texto más largo.", "error");
      return;
    }
    datos = {
      titulo: titulo,
      nombreArchivo: nombreArchivo,
      esDemo: esDemo,
      texto: texto,
      nivel: nivel,
      bloques: dividirEnBloques(texto, nivel)
    };
    mostrarEstado(estadoCarga, "", "");
    mostrarEstado(estadoIniciar, "", "");
    btnCancelar.hidden = true;
    dibujarTodo();
  }

  function procesarArchivo(archivo) {
    const nombre = archivo.name;
    const punto = nombre.lastIndexOf(".");
    const extension = punto === -1 ? "" : nombre.slice(punto).toLowerCase();

    // Validación del tipo
    if (extension !== ".pdf" && extension !== ".txt") {
      mostrarEstado(estadoCarga, "Ese tipo de archivo no se puede usar. Sube un archivo .pdf o .txt.", "error");
      inputArchivo.value = "";
      return;
    }

    // Validación del tamaño
    if (archivo.size > TAMANO_MAXIMO) {
      const megas = (archivo.size / (1024 * 1024)).toFixed(1);
      mostrarEstado(estadoCarga, "El archivo pesa " + megas + " MB y el máximo es 5 MB. Elige un archivo más liviano.", "error");
      inputArchivo.value = "";
      return;
    }
    if (archivo.size === 0) {
      mostrarEstado(estadoCarga, "El archivo está vacío. Elige otro archivo.", "error");
      inputArchivo.value = "";
      return;
    }

    if (extension === ".pdf") {
      cargarTexto(nombre, "La fotosíntesis", TEXTO_EJEMPLO, true);
      return;
    }

    // Leer el archivo de texto
    const lector = new FileReader();
    lector.onload = function () {
      cargarTexto(nombre, tituloDesdeNombre(nombre), String(lector.result), false);
    };
    lector.onerror = function () {
      mostrarEstado(estadoCarga, "No se pudo leer el archivo. Inténtalo de nuevo o pega el texto.", "error");
    };
    lector.readAsText(archivo, "UTF-8");
  }

  inputArchivo.addEventListener("change", function () {
    if (inputArchivo.files.length > 0) {
      procesarArchivo(inputArchivo.files[0]);
    }
  });

  btnUsarPegado.addEventListener("click", function () {
    const texto = cajaPegado.value;
    if (texto.trim() === "") {
      mostrarEstado(estadoCarga, "El cuadro está vacío. Pega el texto que quieres leer.", "error");
      cajaPegado.focus();
      return;
    }
    cargarTexto("Texto pegado", "Texto pegado", texto, false);
  });

  // "Cambiar texto": vuelve a mostrar las dos formas de cargar
  btnCambiar.addEventListener("click", function () {
    tarjetaCarga.hidden = false;
    tarjetaCargado.hidden = true;
    btnCancelar.hidden = false; // control y libertad: se puede cancelar
    inputArchivo.value = "";
    mostrarEstado(estadoCarga, "", "");
    inputArchivo.focus();
  });

  btnCancelar.addEventListener("click", function () {
    btnCancelar.hidden = true;
    mostrarEstado(estadoCarga, "", "");
    dibujarTodo();
    btnCambiar.focus();
  });

  /* ---------- Nivel de fragmentación ---------- */
  radiosNivel.forEach(function (radio) {
    radio.addEventListener("change", function () {
      nivel = radio.value;
      if (datos) {
        datos.nivel = nivel;
        datos.bloques = dividirEnBloques(datos.texto, nivel);
      }
      dibujarTodo();
    });
  });

  /* ---------- Iniciar lectura ---------- */
  btnIniciar.addEventListener("click", function () {
    if (!datos) {
      // No avanza: se explica qué falta
      mostrarEstado(estadoIniciar, "Carga un archivo o pega un texto para continuar", "error");
      return;
    }

    // Guardar el texto en localStorage (para que lectura.html lo pueda leer)
    const guardado = guardarTexto(datos);
    if (!guardado) {
      mostrarEstado(estadoIniciar, "No se pudo guardar el texto en este navegador. Prueba con un texto más corto.", "error");
      return;
    }

    // La posición guardada solo se conserva si es del mismo texto
    const identificador = identificarTexto(datos);
    const posicion = leerPosicion();
    if (!posicion || posicion.idTexto !== identificador) {
      guardarPosicion({ idTexto: identificador, nivel: datos.nivel, bloque: 0, linea: 0 });
    }

    window.location.href = "lectura.html";
  });

  /* ---------- Inicio ---------- */
  dibujarTodo();
});
