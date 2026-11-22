document.addEventListener("DOMContentLoaded", function () {
  const btnMenu = document.getElementById("btn-menu");
  const navegacion = document.getElementById("navegacion");

  if (!btnMenu || !navegacion) return;

  btnMenu.addEventListener("click", function () {
    const estaAbierto = navegacion.classList.toggle("abierto");
    btnMenu.classList.toggle("abierto", estaAbierto);
    btnMenu.setAttribute("aria-expanded", estaAbierto);
  });

  // Cerrar menú al hacer clic en un enlace
  const enlaces = navegacion.querySelectorAll("a");
  enlaces.forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      navegacion.classList.remove("abierto");
      btnMenu.classList.remove("abierto");
      btnMenu.setAttribute("aria-expanded", "false");
    });
  });
});