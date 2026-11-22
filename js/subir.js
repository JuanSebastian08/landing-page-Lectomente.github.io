document.addEventListener("DOMContentLoaded", function () {
  var boton = document.getElementById("btn-subir");
  if (!boton) return;

  // Mostrar el botón cuando se baja más de 300px
  window.addEventListener("scroll", function () {
    var posicion = document.body.scrollTop || document.documentElement.scrollTop;
    boton.classList.toggle("visible", posicion > 300);
  });

  // Volver al inicio de la página
  boton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
