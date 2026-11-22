document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("form-contacto");
  if (!form) return;

  var nombre = document.getElementById("nombre");
  var correo = document.getElementById("correo");
  var mensaje = document.getElementById("mensaje");
  var aviso = document.getElementById("aviso-contacto");

  form.addEventListener("submit", function (event) {
    var nombreOk = nombre.value.trim().length >= 3;
    var texto = correo.value.trim();
    var correoOk = texto.indexOf("@") > 0 && texto.indexOf(".") > texto.indexOf("@");
    var mensajeOk = mensaje.value.trim().length >= 10;

    nombre.classList.toggle("error", !nombreOk);
    correo.classList.toggle("error", !correoOk);
    mensaje.classList.toggle("error", !mensajeOk);

    if (!nombreOk || !correoOk || !mensajeOk) {
      event.preventDefault();
      aviso.className = "aviso error-texto";
      aviso.textContent = "Revisa el nombre, un correo válido y un mensaje de al menos 10 caracteres.";
    }
  });
});