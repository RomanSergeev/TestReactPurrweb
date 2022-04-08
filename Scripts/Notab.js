(function() {
	var cookieShown = false;
	var animationProgress = 0;
	
	function ch() { return document.getElementById("cookiesHolder"); }
	function btn() { return document.getElementById("buttonAcceptCookies"); }
	function m() { return document.getElementById("sectionMission"); }

	function scroll(event) {
		if (!cookieShown && window.scrollY > 300) {
			ch().classList.remove("hidden");
			document.removeEventListener("scroll", scroll);
			cookieShown = true;
		}
	}

	function scroll2(event) {
		var windowBottom = window.innerHeight + window.scrollY;
		var scrolledProgress = (windowBottom - m().offsetTop) / m().offsetHeight;
		if (scrolledProgress > 0.5) {
			animationProgress = Math.min(1, 2 * scrolledProgress - 1);
			animateElements(animationProgress);
			if (animationProgress == 1) {
				window.removeEventListener("resize", scroll2);
				document.removeEventListener("scroll", scroll2);
			}
		}
		else animateElements(0);
	}

	function animateElements(scrollProgress) {
		var deg = 90 * (1 - scrollProgress);
		m().getElementsByTagName("img")[0].style.transform = "rotate(" + deg + "deg)";
		m().getElementsByClassName("pSection")[0].style.opacity = 1 - scrollProgress;  // start later
		m().style.left = "calc(" + scrollProgress * 50 + "% - 266.5px)";  // half of phone image size + padding
	}

	function cookiesListener(event) {
		btn().removeEventListener("click", cookiesListener);
		ch().classList.add("hidden");
		document.removeEventListener("scroll", scroll);
	}

	document.addEventListener("scroll", scroll);
	document.addEventListener("scroll", scroll2);
	window.addEventListener("resize", scroll2);

	window.addEventListener("load", function(event) {
		btn().addEventListener("click", cookiesListener);
		
		setTimeout(function() {
			if (cookieShown) return;
			ch().classList.remove("hidden");
			document.removeEventListener("scroll", scroll);
			cookieShown = true;
		}, 5000);
	});
})();

function validate(form) {
	var inputs = Array.from(form.getElementsByTagName("input"));
	inputs.push(form.getElementsByTagName("textarea")[0]);
	var passed = true;
	for (var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		if (input.type == "submit") continue;
		if (input.value.length == 0) {  // whatever condition - regexp, filled, certain # of characters
			input.classList.add("invalid");
			passed = false;
		} else {
			input.classList.remove("invalid");
		}
	}
	return passed ? form.submit() : false;
}