// スムーズスクロール
smoothScroll.init({ updateURL: false, easing: 'easeInOutQuad', offset: 0 });

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
  navList.forEach((nav) => {
    if (nav.getAttribute("href") == "#" + current.id) {
      nav.setAttribute("data-paging-current", "");
    } else {
      nav.removeAttribute("data-paging-current");
    }
  });
}
updatePagingIndicator();

document.addEventListener('scroll', function(e) {
  updatePagingIndicator();
});
