document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("form-testimonio");
  if (!form) return;

  var contenedor = document.getElementById("testimonialsContainer");
  var nombre = document.getElementById("testimonio-nombre");
  var rol = document.getElementById("testimonio-rol");
  var puntuacion = document.getElementById("testimonio-puntuacion");
  var comentario = document.getElementById("testimonio-comentario");
  var aviso = document.getElementById("aviso-testimonio");
  var contador = document.getElementById("contador-caracteres");

  comentario.addEventListener("input", function () {
    var longitud = comentario.value.length;
    contador.textContent = longitud;
    contador.style.color = longitud >= 500 ? "#b00020" : "";
    contador.style.fontWeight = longitud >= 500 ? "bold" : "normal";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var campos = [nombre, rol, puntuacion, comentario];
    campos.forEach(function (campo) {
      campo.classList.remove("error");
    });

    var invalido = false;
    if (nombre.value.trim().length < 3) {
      nombre.classList.add("error");
      invalido = true;
    }
    if (rol.value.trim().length < 3) {
      rol.classList.add("error");
      invalido = true;
    }
    if (!puntuacion.value) {
      puntuacion.classList.add("error");
      invalido = true;
    }
    if (comentario.value.trim().length < 10) {
      comentario.classList.add("error");
      invalido = true;
    }

    if (invalido) {
      aviso.className = "aviso error-texto";
      aviso.textContent = "Completa todos los campos. El comentario debe tener al menos 10 caracteres.";
      return;
    }

    var estrellas = "";
    var i;
    for (i = 0; i < parseInt(puntuacion.value, 10); i++) {
      estrellas += "★";
    }

    // Se usa textContent para que lo escrito por el usuario no se interprete como HTML
    var tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta testimonio";

    var foto = document.createElement("img");
    foto.src = "../assets/icons/perfil.png";
    foto.alt = "";
    foto.className = "foto-testimonio";
    foto.width = 80;
    foto.height = 80;

    var parrafoEstrellas = document.createElement("p");
    parrafoEstrellas.className = "estrellas";
    parrafoEstrellas.setAttribute("aria-label", "Calificación " + puntuacion.value + " de 5");
    parrafoEstrellas.textContent = estrellas;

    var cita = document.createElement("blockquote");
    cita.textContent = "“" + comentario.value.trim() + "”";

    var autor = document.createElement("p");
    var nombreAutor = document.createElement("strong");
    nombreAutor.textContent = nombre.value.trim();
    var rolAutor = document.createElement("span");
    rolAutor.className = "rol";
    rolAutor.textContent = rol.value.trim();
    autor.appendChild(nombreAutor);
    autor.appendChild(document.createElement("br"));
    autor.appendChild(rolAutor);

    tarjeta.appendChild(foto);
    tarjeta.appendChild(parrafoEstrellas);
    tarjeta.appendChild(cita);
    tarjeta.appendChild(autor);

    contenedor.appendChild(tarjeta);
    form.reset();
    contador.textContent = "0";
    contador.style.color = "";
    contador.style.fontWeight = "normal";
    aviso.className = "aviso ok";
    aviso.textContent = "Tu testimonio se publicó en esta página.";
  });
});