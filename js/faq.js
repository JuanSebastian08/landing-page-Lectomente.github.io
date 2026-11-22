document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".item-faq");

  items.forEach(function (item) {
    const boton = item.querySelector(".pregunta-faq");

    boton.addEventListener("click", function () {
      const estaAbierto = item.classList.contains("abierto");

      // Cerrar todos los demás
      items.forEach(function (otro) {
        otro.classList.remove("abierto");
        otro.querySelector(".pregunta-faq").setAttribute("aria-expanded", "false");
      });

      // Abrir el actual si estaba cerrado
      if (!estaAbierto) {
        item.classList.add("abierto");
        boton.setAttribute("aria-expanded", "true");
      }
    });
  });
});