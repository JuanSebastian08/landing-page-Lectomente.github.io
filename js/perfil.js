/* ==========================================================================
   LECTOMENTE - js/perfil.js
   Código compartido por las 4 pantallas de la app:
   onboarding.html, preparacion.html, lectura.html y personalizar.html
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONSTANTES
   -------------------------------------------------------------------------- */

// Nombres con los que se guarda la información en el navegador
const CLAVE_PERFIL = "lectomente_perfil";
const CLAVE_TEXTO = "lectomente_texto";
const CLAVE_POSICION = "lectomente_posicion";

// Valores iniciales del perfil (también se usan al presionar "Restaurar")
const PERFIL_INICIAL = {
  uso: "",                  // estudio / trabajo / acompano
  dificultad: "",           // tdah / dislexia / ambas / manual
  fuente: "atkinson",       // atkinson / lexend
  tamano: 18,               // px, de 14 a 28
  interlineado: 150,        // %, de 120 a 200
  espacioPalabras: 0,       // px, de 0 a 4
  modoOscuro: false,
  colorFondo: "ninguno",    // ninguno / sepia / menta / gris
  bionic: false,
  sinDistracciones: false,
  pausas: false,
  voz: false,
  guiaLinea: true,
  ritmoGuiado: false,
  velocidad: 1,             // velocidad del ritmo guiado, de 0.5 a 2
  velocidadVoz: "normal",   // lenta / normal / rapida
  transiciones: true
};

// Fuentes disponibles (los archivos están en la carpeta assets/fonts/)
const FUENTES = {
  atkinson: '"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  lexend: '"Lexend", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
};

// Velocidades de la voz (speechSynthesis usa "rate")
const VELOCIDADES_VOZ = { lenta: 0.8, normal: 1, rapida: 1.25 };

// Oraciones por bloque según el nivel de fragmentación
const ORACIONES_POR_BLOQUE = { "muy-corto": 2, "mediano": 4 };
const NOMBRES_NIVEL = { "muy-corto": "Muy corto", "mediano": "Mediano", "parrafos": "Por párrafos" };

// Velocidad de lectura promedio para calcular el tiempo
const PALABRAS_POR_MINUTO = 200;

// Texto de ejemplo "La fotosíntesis". Cada línea es un párrafo.
// Se usa cuando se sube un PDF (demostración) y como vista previa.
const TEXTO_EJEMPLO =
  "La fotosíntesis permite a las plantas transformar la luz en energía. En los cloroplastos, la clorofila capta la luz del sol. Las raíces absorben agua y las hojas toman dióxido de carbono. Con estos elementos, la planta produce azúcares para crecer. Durante el proceso se libera oxígeno al ambiente. Los azúcares aportan energía y ayudan a formar nuevos tejidos. Así, las plantas sostienen muchas cadenas alimentarias. También contribuyen al equilibrio del aire que respiramos.\n" +
  "Casi toda la fotosíntesis sucede en las hojas, que son verdes por la clorofila. Dentro de cada hoja hay millones de células pequeñas. En el interior de esas células se encuentran los cloroplastos. Los cloroplastos funcionan como pequeñas fábricas de energía. La clorofila es el pigmento verde que absorbe la luz. Gracias a ella, la planta aprovecha sobre todo la luz roja y azul. La luz verde se refleja, y por eso vemos las hojas de ese color. Sin clorofila, la planta no podría producir su alimento.\n" +
  "El proceso tiene dos etapas principales. En la primera, la luz del sol rompe moléculas de agua. De esa ruptura se obtiene oxígeno y energía química. El oxígeno sale al aire a través de unos poros llamados estomas. Los estomas también dejan entrar el dióxido de carbono. En la segunda etapa, la planta usa esa energía para armar azúcares. El azúcar principal que se produce se llama glucosa. La glucosa sirve de alimento inmediato o se guarda para después.\n" +
  "Parte de la glucosa se convierte en almidón, que la planta almacena. Otra parte se usa para formar celulosa, que da firmeza a las células. Cuando un animal come una planta, recibe esa energía almacenada. Por eso la fotosíntesis está al inicio de casi todas las cadenas alimentarias. Además, el oxígeno liberado es el que respiramos los seres vivos. Los bosques y los océanos son dos grandes productores de ese oxígeno. Cuidar las plantas es una forma de cuidar el aire y la comida. Entender la fotosíntesis ayuda a entender cómo se sostiene la vida.";

/* --------------------------------------------------------------------------
   2. PERFIL: LEER, GUARDAR Y APLICAR
   -------------------------------------------------------------------------- */

// Hace una copia independiente de un objeto
function copiarObjeto(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

// Obliga a que un número esté entre un mínimo y un máximo
function limitar(valor, minimo, maximo) {
  let numero = Number(valor);
  if (isNaN(numero)) numero = minimo;
  if (numero < minimo) numero = minimo;
  if (numero > maximo) numero = maximo;
  return numero;
}

// Revisa que el perfil tenga valores válidos (recuperación de errores)
function normalizarPerfil(perfil) {
  perfil.tamano = limitar(perfil.tamano, 14, 28);
  perfil.interlineado = limitar(perfil.interlineado, 120, 200);
  perfil.espacioPalabras = limitar(perfil.espacioPalabras, 0, 4);
  perfil.velocidad = limitar(perfil.velocidad, 0.5, 2);
  if (!FUENTES[perfil.fuente]) perfil.fuente = "atkinson";
  if (!VELOCIDADES_VOZ[perfil.velocidadVoz]) perfil.velocidadVoz = "normal";
  if (["ninguno", "sepia", "menta", "gris"].indexOf(perfil.colorFondo) === -1) {
    perfil.colorFondo = "ninguno";
  }
  return perfil;
}

// Lee el perfil guardado en localStorage y lo devuelve. Si no hay nada guardado, devuelve PERFIL_INICIAL.
function leerPerfil() {
  const perfil = copiarObjeto(PERFIL_INICIAL);
  try {
    const guardado = localStorage.getItem(CLAVE_PERFIL);
    if (guardado) {
      const datos = JSON.parse(guardado);
      for (const clave in datos) {
        // Solo se aceptan claves que existen en el perfil inicial
        if (clave in perfil) perfil[clave] = datos[clave];
      }
    }
  } catch (error) {
    // Si el navegador bloquea localStorage o el dato está dañado,
    // se usan los valores iniciales y la página sigue funcionando.
  }
  return normalizarPerfil(perfil);
}

// Guarda el perfil en localStorage. Devuelve true si se guardó correctamente, false si hubo un error (por ejemplo, localStorage bloqueado).
function guardarPerfil(perfil) {
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
    return true;
  } catch (error) {
    return false;
  }
}

// Aplica el perfil a toda la página: variables CSS y clases del <body>
function aplicarPerfil(perfil) {
  const cuerpo = document.body;
  cuerpo.style.setProperty("--fuente", FUENTES[perfil.fuente]);
  cuerpo.style.setProperty("--tam", perfil.tamano + "px");
  cuerpo.style.setProperty("--interlineado", perfil.interlineado / 100);
  cuerpo.style.setProperty("--espacio-palabras", perfil.espacioPalabras + "px");

  cuerpo.classList.toggle("modo-oscuro", perfil.modoOscuro);
  cuerpo.classList.toggle("con-transiciones", perfil.transiciones);

  cuerpo.classList.remove("fondo-sepia", "fondo-menta", "fondo-gris");
  if (perfil.colorFondo !== "ninguno") {
    cuerpo.classList.add("fondo-" + perfil.colorFondo);
  }
}

/* --------------------------------------------------------------------------
   3. TEXTO Y POSICIÓN GUARDADOS (localStorage)
   -------------------------------------------------------------------------- */

// Lee el texto guardado en localStorage y lo devuelve. Si no hay nada guardado, devuelve null.
function leerTexto() {
  try {
    const guardado = localStorage.getItem(CLAVE_TEXTO);
    if (guardado) return JSON.parse(guardado);
  } catch (error) {
    // Dato dañado o localStorage bloqueado: se trata como "sin texto"
  }
  return null;
}

// Guarda el texto en localStorage. Devuelve true si se guardó correctamente, false si hubo un error (por ejemplo, localStorage bloqueado o texto demasiado grande).
function guardarTexto(datos) {
  try {
    localStorage.setItem(CLAVE_TEXTO, JSON.stringify(datos));
    return true;
  } catch (error) {
    // Puede fallar si el texto es demasiado grande para el navegador
    return false;
  }
}

// Lee la posición guardada en localStorage y la devuelve. Si no hay nada guardado, devuelve null.
function leerPosicion() {
  try {
    const guardado = localStorage.getItem(CLAVE_POSICION);
    if (guardado) return JSON.parse(guardado);
  } catch (error) {
    // Sin posición guardada
  }
  return null;
}

// Guarda la posición en localStorage. Devuelve true si se guardó correctamente, false si hubo un error (por ejemplo, localStorage bloqueado).
function guardarPosicion(posicion) {
  try {
    localStorage.setItem(CLAVE_POSICION, JSON.stringify(posicion));
    return true;
  } catch (error) {
    return false;
  }
}

// Identifica un texto (para saber si la posición guardada es de este texto)
function identificarTexto(datos) {
  return datos.titulo + "|" + datos.texto.length;
}

/* --------------------------------------------------------------------------
   4. DIVIDIR EL TEXTO EN ORACIONES Y BLOQUES
   -------------------------------------------------------------------------- */

// Separa un texto en oraciones. Una oración termina en . ! ? o …
// y después hay un espacio o el texto se acaba (así "3.5" no se corta).
function dividirOraciones(texto) {
  const oraciones = [];
  let actual = "";
  for (let i = 0; i < texto.length; i++) {
    const letra = texto.charAt(i);
    actual += letra;
    if (letra === "." || letra === "!" || letra === "?" || letra === "…") {
      const siguiente = texto.charAt(i + 1);
      if (siguiente === "" || siguiente === " " || siguiente === "\n") {
        if (actual.trim() !== "") oraciones.push(actual.trim());
        actual = "";
      }
    }
  }
  if (actual.trim() !== "") oraciones.push(actual.trim());
  return oraciones;
}

// Separa un texto en párrafos (un párrafo por cada salto de línea)
function dividirParrafos(texto) {
  const parrafos = [];
  texto.split("\n").forEach(function (linea) {
    if (linea.trim() !== "") parrafos.push(linea.trim());
  });
  return parrafos;
}

// Devuelve una lista de bloques. Cada bloque es una lista de oraciones.
//   muy-corto = 2 oraciones por bloque
//   mediano   = 4 oraciones por bloque
//   parrafos  = un bloque por cada párrafo (salto de línea)
function dividirEnBloques(texto, nivel) {
  const parrafos = dividirParrafos(texto);
  const bloques = [];

  if (nivel === "parrafos") {
    parrafos.forEach(function (parrafo) {
      bloques.push(dividirOraciones(parrafo));
    });
    return bloques;
  }

  // Primero se juntan todas las oraciones en el orden del texto
  const todas = [];
  parrafos.forEach(function (parrafo) {
    dividirOraciones(parrafo).forEach(function (oracion) {
      todas.push(oracion);
    });
  });

  const porBloque = ORACIONES_POR_BLOQUE[nivel] || 4;
  for (let i = 0; i < todas.length; i += porBloque) {
    bloques.push(todas.slice(i, i + porBloque));
  }
  return bloques;
}

// Cuenta las palabras de un texto
function contarPalabras(texto) {
  const partes = texto.split("\n").join(" ").split(" ");
  let total = 0;
  partes.forEach(function (parte) {
    if (parte.trim() !== "") total++;
  });
  return total;
}

// Minutos de lectura (mínimo 1)
function minutosDeLectura(palabras) {
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));
}

// Posición (bloque y línea) -> número de oración contando desde 0
function indiceDeOracion(bloques, bloque, linea) {
  let total = 0;
  for (let i = 0; i < bloque && i < bloques.length; i++) {
    total += bloques[i].length;
  }
  return total + linea;
}

// Número de oración -> posición (bloque y línea) en una lista de bloques
function posicionDeOracion(bloques, indice) {
  let resto = indice;
  for (let i = 0; i < bloques.length; i++) {
    if (resto < bloques[i].length) return { bloque: i, linea: resto };
    resto -= bloques[i].length;
  }
  const ultimo = bloques.length - 1;
  return { bloque: ultimo, linea: bloques[ultimo].length - 1 };
}

/* --------------------------------------------------------------------------
   5. DIBUJAR UNA LÍNEA DE TEXTO (Bionic Reading y glosario)
   -------------------------------------------------------------------------- */

// Dice si un carácter es letra o número (funciona con tildes y ñ)
function esLetraONumero(letra) {
  return letra.toLowerCase() !== letra.toUpperCase() || (letra >= "0" && letra <= "9");
}

// Quita tildes y pasa a minúsculas para comparar palabras con el glosario
function normalizarPalabra(palabra) {
  const conTilde = "áéíóúüñ";
  const sinTilde = "aeiouun";
  let resultado = "";
  const minuscula = palabra.toLowerCase();
  for (let i = 0; i < minuscula.length; i++) {
    const posicion = conTilde.indexOf(minuscula.charAt(i));
    resultado += posicion === -1 ? minuscula.charAt(i) : sinTilde.charAt(posicion);
  }
  return resultado;
}

// Busca una palabra en un diccionario. Acepta plurales simples
// (cloroplastos -> cloroplasto, estomas -> estoma).
function buscarTermino(palabra, diccionario) {
  const clave = normalizarPalabra(palabra);
  if (diccionario[clave]) return clave;
  if (clave.slice(-1) === "s" && diccionario[clave.slice(0, -1)]) return clave.slice(0, -1);
  if (clave.slice(-2) === "es" && diccionario[clave.slice(0, -2)]) return clave.slice(0, -2);
  return "";
}

// Escribe una palabra dentro de un contenedor. Con Bionic Reading,
// la primera mitad de la palabra va en negrita (<strong> creado con createElement).
function agregarPalabra(contenedor, palabra, bionic) {
  if (!bionic) {
    contenedor.appendChild(document.createTextNode(palabra));
    return;
  }
  const mitad = Math.ceil(palabra.length / 2);
  const negrita = document.createElement("strong");
  negrita.className = "bionic";
  negrita.textContent = palabra.slice(0, mitad);
  contenedor.appendChild(negrita);
  contenedor.appendChild(document.createTextNode(palabra.slice(mitad)));
}

// Dibuja el texto de una línea dentro de "contenedor".
// opciones.bionic     -> true para usar Bionic Reading
// opciones.glosario   -> diccionario de términos (o null para no marcar nada)
// opciones.alPulsar   -> función(clave, boton) que se llama al pulsar un término
function construirLinea(contenedor, texto, opciones) {
  contenedor.textContent = "";
  const palabras = texto.split(" ");

  palabras.forEach(function (palabra, indice) {
    if (palabra === "") return;

    // Se separan los signos de puntuación del inicio y del final
    let inicio = 0;
    while (inicio < palabra.length && !esLetraONumero(palabra.charAt(inicio))) inicio++;
    let fin = palabra.length;
    while (fin > inicio && !esLetraONumero(palabra.charAt(fin - 1))) fin--;

    const prefijo = palabra.slice(0, inicio);
    const nucleo = palabra.slice(inicio, fin);
    const sufijo = palabra.slice(fin);

    if (prefijo) contenedor.appendChild(document.createTextNode(prefijo));

    const clave = (opciones.glosario && nucleo) ? buscarTermino(nucleo, opciones.glosario) : "";

    if (clave) {
      // Palabra del glosario: subrayada con puntos y es un botón
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "termino";
      boton.setAttribute("data-termino", clave);
      boton.setAttribute("aria-label", "Ver definición de " + nucleo);
      agregarPalabra(boton, nucleo, opciones.bionic);
      boton.addEventListener("click", function (evento) {
        evento.stopPropagation(); // no mueve la línea resaltada
        if (opciones.alPulsar) opciones.alPulsar(clave, boton);
      });
      contenedor.appendChild(boton);
    } else if (nucleo) {
      agregarPalabra(contenedor, nucleo, opciones.bionic);
    }

    if (sufijo) contenedor.appendChild(document.createTextNode(sufijo));
    if (indice < palabras.length - 1) contenedor.appendChild(document.createTextNode(" "));
  });
}

/* --------------------------------------------------------------------------
   6. INTERRUPTORES (botones role="switch") Y MENSAJES
   Cada interruptor muestra el texto "Activado" / "Desactivado"
   y tiene aria-checked, para no depender solo del color.
   -------------------------------------------------------------------------- */

function ponerInterruptor(boton, activo) {
  boton.setAttribute("aria-checked", activo ? "true" : "false");
  boton.classList.toggle("activo", activo);
  const estado = boton.querySelector(".int-estado");
  if (estado) estado.textContent = activo ? "Activado" : "Desactivado";
}

function leerInterruptor(boton) {
  return boton.getAttribute("aria-checked") === "true";
}

function enlazarInterruptor(boton, alCambiar) {
  boton.addEventListener("click", function () {
    const nuevo = !leerInterruptor(boton);
    ponerInterruptor(boton, nuevo);
    alCambiar(nuevo);
  });
}

// Escribe un mensaje de estado (las regiones tienen aria-live="polite")
// tipo: "ok", "error" o nada
function mostrarEstado(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("app-ok", "app-error");
  if (tipo) elemento.classList.add("app-" + tipo);
}

/* --------------------------------------------------------------------------
   7. AL CARGAR CUALQUIER PANTALLA: aplicar el perfil guardado 
   Cada pantalla puede volver a aplicar su propio perfil en vivo después.
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.classList.contains("app")) {
    aplicarPerfil(leerPerfil());
  }
});
