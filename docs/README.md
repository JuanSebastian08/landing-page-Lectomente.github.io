# LectoMente

Landing page y simulación de las pantallas de la extensión **LectoMente**, una herramienta de lectura adaptativa para personas con TDAH y dislexia. Proyecto del curso de Interacción Humano-Computador (UPC), hecho solo con HTML, CSS y JavaScript nativo, sin librerías ni frameworks.

## Cómo abrirlo

- En GitHub Pages: el sitio se publica desde la raíz del repositorio. El `index.html` de la raíz redirige a `pages/index.html`.
- En local: abre `pages/index.html` con doble clic o con Live Server de VS Code. No requiere instalar nada.

## Estructura

```
lectomente-landing/
├─ assets/
│  ├─ images/   logo.png, hero-libro.jpg y las 3 ilustraciones de testimonios
│  ├─ icons/    18 íconos PNG de 128 x 128 px
│  └─ fonts/    Atkinson Hyperlegible y Lexend (.woff2) con sus licencias
├─ css/
│  └─ styles.css    estilos de la landing y de las pantallas de la app
├─ js/              un archivo por función (menú, FAQ, filtros, perfil, lectura, etc.)
├─ pages/           todas las páginas HTML, incluido index.html
├─ docs/
│  └─ README.md
├─ favicon.ico
├─ index.html       solo redirige a pages/index.html
└─ .gitignore
```

Todos los recursos (imágenes, íconos, fuentes y scripts) están dentro del repositorio. No se carga nada desde internet.

## Páginas

| Página | Qué es |
|---|---|
| `pages/index.html` | Landing: características con filtros, cómo funciona, testimonios con formulario, accesibilidad, FAQ y contacto |
| `pages/recursos.html` | Guía de instalación y primer perfil (enlace "Guía" del menú) |
| `pages/confirmacion.html` | Pantalla a la que va el formulario de contacto (simulación, no envía correos) |
| `pages/onboarding.html` | Pantalla de la app MK-D-02: configuración inicial en 5 pasos |
| `pages/preparacion.html` | Pantalla de la app MK-D-03: cargar texto, resumen, tiempo y vista previa de bloques |
| `pages/lectura.html` | Pantalla de la app MK-D-04: lectura por bloques con voz, pausas y glosario |
| `pages/personalizar.html` | Pantalla de la app MK-D-05: personalizar la lectura con vista previa en vivo |

Flujo principal: landing → instalar → onboarding → preparación → lectura ↔ personalizar.

## Historias de usuario y dónde se ven

Las historias de abajo son las que el propio código identifica en el encabezado de cada pantalla y en los comentarios de los scripts.

| HU | Pantalla | Elemento o función donde se evidencia |
|---|---|---|
| US01 | lectura.html | Botones Reproducir, Pausar, Detener y velocidades de voz (`speechSynthesis` en `js/lectura.js`) |
| US04 | lectura.html | Tarjeta "¿Quieres tomar una pausa?" y tarjeta "Momento de descanso" (`js/lectura.js`) |
| US06 | lectura.html | Tarjeta "Parece que este bloque te costó" al volver 2 veces al mismo bloque (`js/lectura.js`) |
| US09 | preparacion.html y lectura.html | Nivel de fragmentación (muy corto, mediano, por párrafos) y selector "Tamaño de bloque" (`js/perfil.js`) |
| US10 | personalizar.html | Fuente, tamaño de letra, interlineado y espacio entre palabras con vista previa en vivo |
| US12 | preparacion.html | "Vista previa de bloques" antes de iniciar la lectura (`js/preparacion.js`) |
| US15 | onboarding.html y personalizar.html | "Guardar perfil" y "Guardar en mi perfil"; el perfil se aplica solo en cada pantalla (`js/perfil.js`) |
| US16 | lectura.html | "Posición guardada automáticamente" (`js/perfil.js`, `js/lectura.js`) |
| US17 | preparacion.html y lectura.html | Tiempo estimado de lectura y "Bloque X de Y · N min restantes" |
| US21 | preparacion.html | Tarjeta "Resumen previo" |
| US25 | personalizar.html | Modo oscuro y color de fondo (ninguno, sepia, menta, gris) |
| US26 | onboarding.html | Configuración inicial corta: 5 pasos, uno por vez |

Historias que el código asigna a una pantalla, sin indicar un elemento concreto:

| Pantalla | HU asignadas |
|---|---|
| lectura.html (MK-D-04) | US03, US08, US11, US13 |
| personalizar.html (MK-D-05) | US02, US05, US27, US28, US33, US34 |

## Fuentes

| Recurso | Autor y licencia |
|---|---|
| Atkinson Hyperlegible | Braille Institute of America, SIL Open Font License 1.1 (`assets/fonts/LICENCIA-atkinson-hyperlegible.txt`) |
| Lexend | The Lexend Project Authors, SIL Open Font License 1.1 (`assets/fonts/LICENCIA-lexend.txt`) |

## Técnicas de JavaScript que no se vieron en clase

- `localStorage`: guarda el perfil, el texto cargado y la posición de lectura (`js/perfil.js`, `js/preparacion.js`, `js/lectura.js`).
- `speechSynthesis` y `SpeechSynthesisUtterance`: lectura en voz alta (`js/lectura.js`).
- `FileReader`: lee el contenido de los archivos `.txt` (`js/preparacion.js`).

## Limitaciones conocidas

- LectoMente se simula como sitio web. No es una extensión de navegador instalable: los botones "Instalar" llevan al onboarding.
- Los archivos `.pdf` no se leen de verdad. Al subir uno, la app muestra un texto de ejemplo ("La fotosíntesis"); solo los `.txt` se leen completos.
- El glosario solo marca los términos del texto de ejemplo.
- La pausa sugerida aparece a 1 minuto para poder probarla en una demostración. En uso real, el valor `MINUTOS_PARA_PAUSA` de `js/lectura.js` debe ser 25.
- El formulario de contacto no envía datos y los testimonios nuevos solo existen mientras la página está abierta.
- La voz depende de las voces instaladas en el navegador y el dispositivo.
- El perfil se guarda solo en el navegador donde se configuró.
