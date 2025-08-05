function scrollToSection(id) {
  const element = document.getElementById(id);
  element.scrollIntoView({ behavior: "smooth" });
}

function removeArrow() {
  const arrow = document.getElementById("arrow");
  arrow.style.display = "none";
}

window.addEventListener("load", () => {
  const hash = window.location.hash;
  if (hash && document.referrer.includes(window.location.origin)) {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }, 300);
    }
  }
});
