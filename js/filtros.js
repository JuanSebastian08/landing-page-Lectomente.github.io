document.addEventListener("DOMContentLoaded", function () {
  var botones = document.querySelectorAll(".filtro");
  var tarjetas = document.querySelectorAll("#lista-caracteristicas .tarjeta");
  if (!botones.length) return;

  botones.forEach(function (boton) {
    boton.addEventListener("click", function () {
      var filtro = boton.getAttribute("data-filtro");

      botones.forEach(function (otro) {
        otro.classList.remove("activo");
        otro.setAttribute("aria-pressed", "false");
      });
      boton.classList.add("activo");
      boton.setAttribute("aria-pressed", "true");

      tarjetas.forEach(function (tarjeta) {
        var categorias = tarjeta.getAttribute("data-categoria") || "";
        var mostrar = filtro === "todos" || categorias.indexOf(filtro) !== -1;
        tarjeta.classList.toggle("oculta", !mostrar);
      });
    });
  });
});