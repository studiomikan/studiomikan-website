// scroll
var smoothScroll = new SmoothScroll('a[href*="#"]', {
  updateURL: false,
  easing: "easeInOutCubic",
  offset: 0
});
// utils
function addClass(elm, className) {
  let classList = elm.className.split(" ");
  if (classList.indexOf(className) >= 0) return;
  elm.className += " " + className;
}
function removeClass(elm, className) {
  let name = "";
  elm.className.split(" ").forEach(function(c) {
    if (c !== className) name += c + " ";
  });
  elm.className = name.trim();
}
function hasClass(elm, className) {
  return elm.className.split(" ").indexOf(className) >= 0;
}
// 左のナビ
let sectionList = document.querySelectorAll("[data-paging-section]"),
  navList = document.querySelectorAll("[data-paging-nav]");
function updatePagingIndicator() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop,
    current = sectionList[sectionList.length - 1],
    length = sectionList.length,
    marginHeight = window.innerHeight / 2;
  for (let i = sectionList.length - 1; i >= 0; i--) {
    let sec = sectionList[i];
    if (sec.offsetTop < scrollTop + marginHeight) {
      current = sec;
      break;
    }
  }
  for (let i = 0; i < navList.length; i++) {
    let nav = navList[i];
    if (nav.getAttribute("href") == "#" + current.id) {
      addClass(nav, "current");
    } else {
      removeClass(nav, "current");
    }
  }
}
updatePagingIndicator();
document.addEventListener("scroll", function(e) {
  updatePagingIndicator();
});
// 右上メニュー＆フルスクリーンナビ
let menuIcon = document.querySelector("#menu_icon"),
  fullNav = document.querySelector("#full_nav"),
  fullNavLinks = document.querySelectorAll("#full_nav a");
function showFullNav() {
  addClass(menuIcon, "active");
  addClass(fullNav, "active");
}
function hideFullNav() {
  removeClass(menuIcon, "active");
  removeClass(fullNav, "active");
  addClass(fullNav, "fadeout");
}
fullNav.addEventListener("transitionend", function(e) {
  if (e.target.id === "full_nav" && hasClass(e.target, "fadeout")) {
    removeClass(fullNav, "fadeout");
  }
});
menuIcon.addEventListener("click", function(e) {
  if (hasClass(menuIcon, "active")) {
    hideFullNav();
  } else {
    showFullNav();
  }
});
for (let i = 0; i < fullNavLinks.length; i++) {
  let link = fullNavLinks[i];
  link.addEventListener("click", function(e) {
    hideFullNav();
  });
}
// 背景アニメーション
bubbly({
  colorStart: "#fff",
  colorStop: "#fff",
  blur: 1,
  compose: "source-over",
  bubbleFunc: () => `rgba(255, 170, 1, ${Math.random() * 0.25})`
});
