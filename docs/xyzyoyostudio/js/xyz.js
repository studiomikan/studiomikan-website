// Manu
function showMenu() {
  document.getElementById("menu_popup").classList.remove("hidden");
  document.getElementById("menu_button").classList.add("transparent");
}
function hideMenu() {
  document.getElementById("menu_popup").classList.add("hidden");
  document.getElementById("menu_button").classList.remove("transparent");
}
document.getElementById("menu_button").addEventListener('click', (event) => {
  const popup = document.getElementById("menu_popup");
  if (popup.classList.contains('hidden')) {
    showMenu();
  } else {
    hideMenu();
  }
  event.preventDefault();
  event.stopPropagation();
  return false;
});
window.addEventListener('click', () => {
  hideMenu();
});
// Scroll
var smoothScroll = new SmoothScroll('a[href*="#"]', {
  updateURL: false,
  easing: "easeInOutCubic",
  offset: 0,
  speed: 800,
  speedAsDuration: true
});
// AOS
AOS.init();