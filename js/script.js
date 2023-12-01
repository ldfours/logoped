navbarFade().init();

function navbarFade() {
	var innerHeight;
	var scrollY;
	var navbarElem;
	var navbarHeight;
	var navbarHeightInclude;
	var heroElem;
	var heroHeight;
	function init() {
		innerHeight = window.innerHeight;
		scrollY = window.scrollY;
		navbarElem = document.querySelectorAll('.navbar')[0];
		if (navbarElem) {
			navbarHeight = navbarElem.clientHeight;
			if (document.querySelectorAll('.has-navbar-fixed-top').length > 0) {
				navbarHeightInclude = 1;
			} else {
				navbarHeightInclude = 0;
			}
		}
		heroElem = document.querySelectorAll('.hero')[0];
		if (heroElem) {
			heroHeight = heroElem.clientHeight;
		}
		addEventHandlers();
		checkPosition();
	}
	function addEventHandlers() {
		window.addEventListener('scroll', checkPosition);
		window.addEventListener('resize', init);
	}
	function checkPosition() {
		scrollY = window.scrollY;
		if (heroElem) {
			if (scrollY < heroHeight + navbarHeight * navbarHeightInclude) {
				// TODO: Implement cross-browser solution for this
				navbarElem.classList.add('navbar-transparent');
				navbarElem.classList.remove('navbar-opaque');
			} else {
				navbarElem.classList.add('navbar-opaque');
				navbarElem.classList.remove('navbar-transparent');
			}
		} else {
			navbarElem.classList.add('navbar-opaque');
			navbarElem.classList.remove('navbar-transparent');
		}
	}
	return {
		init: init
	};
}
