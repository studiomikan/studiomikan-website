// スムーズスクロール
smoothScroll.init({ updateURL: false, easing: "easeInOutQuad", offset: 0 });
// 左のナビゲーション
let sectionList = document.querySelectorAll("[data-paging-section]");
let navList = document.querySelectorAll("[data-paging-nav]");
function updatePagingIndicator() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let current = sectionList[sectionList.length - 1];
  let length = sectionList.length;
  let marginHeight = window.innerHeight / 2;
  for (let i = sectionList.length - 1; i >= 0; i--) {
    let sec = sectionList[i];
    if (sec.offsetTop + marginHeight < scrollTop) break;
    else current = sec;
  }
  navList.forEach(function(nav) {
    if (nav.getAttribute("href") == "#" + current.id) {
      nav.setAttribute("data-paging-current", "");
    } else {
      nav.removeAttribute("data-paging-current");
    }
  });
}
updatePagingIndicator();
document.addEventListener("scroll", function(e) {
  updatePagingIndicator();
});
// 右上メニュー＆フルスクリーンナビ
let menuIcon = document.querySelector('#menu_icon');
let fullNav = document.querySelector('#full_nav');
let fullNavLinks = document.querySelectorAll('#full_nav a');
function showFullNav() {
	menuIcon.className = "active";
	fullNav.className = "active";
}
function hideFullNav() {
	menuIcon.className = "";
	fullNav.className = "fadeout";
	// transitionendが発行されないときの保険
	// setTimeout(function() {
	// 	if (fullNav.className === "fadeout") { fullNav.className = ""; }
	// }, 510);
}
fullNav.addEventListener("transitionend", function(e) {
	let target = e.target;
	if (e.target.id === "full_nav" && e.target.className === "fadeout") {
		fullNav.className = "";
	}
});
menuIcon.addEventListener("click", function(e) {
	if (menuIcon.className === "active") {
		hideFullNav();
	} else {
		showFullNav();
	}
});
fullNavLinks.forEach(function(link) {
	link.addEventListener("click", function(e) {
		hideFullNav();
	});
});
