// scroll
smoothScroll.init({ updateURL: false, easing: "easeInOutQuad", offset: 0 });
// utils
function addClass(elm, className) {
  let classList = elm.className.split(" ");
  if (classList.indexOf(className) >= 0) return;
  elm.className += (" " + className);
}
function removeClass(elm, className) {
  let name = "";
  elm.className.split(" ").forEach(function (c) {
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
    if (sec.offsetTop < scrollTop + marginHeight ) {
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
document.addEventListener("scroll", function (e) {
  updatePagingIndicator();
});
// 右上メニュー＆フルスクリーンナビ
let menuIcon = document.querySelector('#menu_icon'),
    fullNav = document.querySelector('#full_nav'),
    fullNavLinks = document.querySelectorAll('#full_nav a');
function showFullNav() {
  addClass(menuIcon, "active");
  addClass(fullNav, "active");
}
function hideFullNav() {
  removeClass(menuIcon, "active");
  removeClass(fullNav, "active");
  addClass(fullNav, "fadeout");
}
fullNav.addEventListener("transitionend", function (e) {
  if (e.target.id === "full_nav" && hasClass(e.target, "fadeout")) {
    removeClass(fullNav, "fadeout");
  }
});
menuIcon.addEventListener("click", function (e) {
  if (hasClass(menuIcon, "active")) {
    hideFullNav();
  } else {
    showFullNav();
  }
});
for (let i = 0; i < fullNavLinks.length; i++) {
  let link = fullNavLinks[i];
  link.addEventListener("click", function (e) {
    hideFullNav();
  });
}
// 背景アニメーション
(function () {
  let area = document.querySelector("#background"),
      color = 'rgba(255, 170, 1, 0.1)',
      minSize = 50,
      maxSize = 200,
      minSpeed = 0.02,
      maxSpeed = 0.06,
      circleNum = 15,
      circles = [];
      startX = 200,
      startY = 200;
  function createCircles() {
    for (let i = 0; i < circleNum; i++) {
      let size = minSize + ((maxSize - minSize) / circleNum) * i,
          angle = Math.PI * 2 * Math.random(),
          speed = minSpeed + (maxSpeed - minSpeed) * Math.random(),
          div = createCircleDiv(size);
      area.appendChild(div);
      circles.push({
        size: size,
        angle: angle,
        speed: speed,
        x: startX,
        y: startY,
        div: div
      });
    }
  }
  function createCircleDiv(size) {
    let div = document.createElement("div");
    div.style.width = size + "px";
    div.style.height = size + "px";
    div.style.border = "none";
    div.style.borderRadius = Math.ceil(size / 2) + "px";
    div.style.background = color;
    div.style.position = "absolute";
    div.style.top = (startY - size / 2) + "px";
    div.style.left = (startX - size / 2) + "px";
    return div;
  }
  function start() {
    let requestAnimationFrame =
      window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    let requestFrame = function (loopFunc) {
      if (requestAnimationFrame) {
        requestAnimationFrame(loopFunc);
      } else {
        window.setTimeout(loopFunc, 33);
      }
    };
    let loopFunc = function () {
      move();
      requestFrame(loopFunc);
    };
    requestFrame(loopFunc);
  }
  let preTick = null;
  function move() {
    let areaWidth = area.offsetWidth,
        areaHeight = area.offsetHeight,
        tick = Date.now();
    if (preTick == null) preTick = tick;
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      // 移動
      let d = c.speed * (tick - preTick),
          moveX = d * Math.cos(c.angle),
          moveY = d * Math.sin(c.angle);
      c.x += moveX;
      c.y += moveY;
      // 跳ね返り
      if (c.x <= 0 || areaWidth <= c.x) {
        c.angle = Math.atan2(moveY, -moveX);
        c.x = c.x <= 0 ? 0 : areaWidth;
      }
      if (c.y <= 0 || areaHeight <= c.y) {
        c.angle = Math.atan2(-moveY, moveX);
        c.y = c.y <= 0 ? 0 : areaHeight;
      }

      c.div.style.left = (c.x - c.size / 2) + "px";
      c.div.style.top = (c.y - c.size / 2) + "px";
    }
    preTick = tick;
  }
  function init() {
    let w = area.offsetWidth;
    if (w > 1920) circleNum = 25;
    else if (w > 1600) circleNum = 20;
    else if (w > 1024) circleNum = 15;
    else circleNum = 10;
    startX = area.offsetWidth / 2;
    startY = area.offsetHeight / 2;
    preTick = Date.now() - 2500;
    createCircles();
    start();
  }
  init();
})();
