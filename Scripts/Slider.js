/**
 * Slider containing different HTML elements (not necessarily images).
 * On creation, elements are hidden, and then moved into the slider one by one as they are supposed to appear.
 * Elements moved into slider are supposed to have their offsetWidth and offsetHeight set (thus, already rendered on the page).
 * Slider operates with only two containers that change their content repeatedly during animations.
 * Sliding direction is optimal (sliding through least amount of elements):
 * Example: if clicking on 8th element in 10-element list, when active element is 1st, the slider will scroll through 1 -> 10 -> 9 -> 8.
 * Animation used is based on window.requestAnimationFrame.
 * Slider is tight with its contents (i.e. has minimal necessary width and height).
 * Some customization is easily added, like custom animation duration or dimensions.
 * Don't use the same HTML Element in two sliders!
 */
function createSliderFromHTMLElementArray(HTMLElementArray, HTMLElementInsertInto) {
	// checks
	if (!HTMLElementArray instanceof Array || HTMLElementArray.length == 0) {
		console.warn("createSliderFromHTMLElementArray: Trying to create slider using an empty HTMLElement array, or not array. Returned with no actions.");
		return;
	}
	if (!HTMLElementInsertInto instanceof HTMLElement) {
		console.warn("createSliderFromHTMLElementArray: Trying to insert slider not into HTMLElement. Returned with no actions.");
		return;
	}
	for (var i = 0; i < HTMLElementArray.length; i++) {
		if (!HTMLElementArray[i] instanceof HTMLElement) {
			console.warn("createSliderFromHTMLElementArray: Argument 1 HTMLElementArray[" + i + "] is not an HTMLElement. Returned with no actions.");
			return;
		}
	}
	
	// task constraint - optional
	const MAX_CAROUSEL_LENGTH          =  10;
	// arbitrary minimal slider central container dimensions
	const MIN_SLIDER_WIDTH             = 200;
	const MIN_SLIDER_HEIGHT            = 100;
	// dimensions of clickable elements to the left, right and bottom of central container
	const SLIDER_BUTTON_WIDTH          =  50;
	const SLIDER_BOTTOM_BUTTONS_HEIGHT =  30;
	// can be passed as a parameter (for further customization)
	const ANIMATION_DURATION           = 300;
	
	var HTMLElementArrayUsed = HTMLElementArray.slice(0, MAX_CAROUSEL_LENGTH);
	const len = HTMLElementArrayUsed.length;
	var trunc = function(x) {
		return (x + len) % len;
	}
	
	// get dimensions of central container
	var mainContainerWidth  = Math.max(MIN_SLIDER_WIDTH , Math.max.apply(null, HTMLElementArrayUsed.map(x => x.offsetWidth )));
	var mainContainerHeight = Math.max(MIN_SLIDER_HEIGHT, Math.max.apply(null, HTMLElementArrayUsed.map(x => x.offsetHeight)));
	
	// get element offsets for centering
	var offsetsLeft = HTMLElementArrayUsed.map(x => (mainContainerWidth  - x.offsetWidth ) / 2);
	var offsetsTop  = HTMLElementArrayUsed.map(x => (mainContainerHeight - x.offsetHeight) / 2);
	
	// create slider DOM elements
	var divSlider             = document.createElement("div");
	var divMainPanelContainer = document.createElement("div");
	var divLeftScroller       = document.createElement("div");
	var divRightScroller      = document.createElement("div");
	var divCenterContainer    = document.createElement("div");
	var divSlideMiddle        = document.createElement("div");
	var divSlideMiddleData    = document.createElement("div");
	var divSlideRight         = document.createElement("div");
	var divSlideRightData     = document.createElement("div");
	var spanLeftButton        = document.createElement("span");
	var spanRightButton       = document.createElement("span");
	var ulBottomButtons       = document.createElement("ul");
	
	// create slider object with main logic
	var slider = {
		carousel: divCenterContainer,
		carouselNextElement: divSlideRight,
		containerCurrent: divSlideMiddleData,
		containerNext: divSlideRightData,
		bottomIndicatorsList: ulBottomButtons,
		selectedSlide: 0,
		isAnimated: false,
		rightToLeftFlag: true,
		times: 0,
		mainAnimation: new Animation(ANIMATION_DURATION),  // see Animation.js
		rightToLeftMultiplier: function() {
			return this.rightToLeftFlag ? 1 : -1;
		},
		getNextSlideIndex: function() {
			return trunc(this.selectedSlide + this.rightToLeftMultiplier());
		},
		launchAnimation: function() {
			var nextSlideIndex = this.getNextSlideIndex();
			this.fillContainerNext(nextSlideIndex);
			this.selectedSlide = nextSlideIndex;
			this.mainAnimation.run();
		},
		onClickAction: function(event, index) {
			if (event.which != 1 ||
				this.selectedSlide == index ||
				this.isAnimated) return;
			this.slideTo(index);
		},
		updateBottomIndicator: function(index) {
			this.bottomIndicatorsList.children[this.selectedSlide].classList.remove("selected");
			this.bottomIndicatorsList.children[index].classList.add("selected");
		},
		slideTo: function(index) {
			this.isAnimated = true;  // lock
			var diff = index - this.selectedSlide;
			this.rightToLeftFlag = trunc(diff) <= len / 2;
			this.updateBottomIndicator(index);
			var numAnimations = Math.min(trunc(diff), trunc(-diff));
			this.mainAnimation.setDuration(ANIMATION_DURATION / numAnimations);
			this.times = numAnimations;
			this.launchAnimation();
		},
		fillContainerCurrent: function(index) {
			this.containerCurrent.style.left = offsetsLeft[index] + "px";
			this.containerCurrent.style.top = offsetsTop[index] + "px";
			HTMLElementArrayUsed[index].style.display = "block";
			if (this.containerCurrent.firstChild) {
				this.containerCurrent.removeChild(this.containerCurrent.firstChild);
			}
			this.containerCurrent.appendChild(HTMLElementArrayUsed[index]);
		},
		fillContainerNext: function(index) {
			this.containerNext.style.left = offsetsLeft[index] + "px";
			this.containerNext.style.top = offsetsTop[index] + "px";
			HTMLElementArrayUsed[index].style.display = "block";
			if (this.containerNext.firstChild) {
				this.containerNext.removeChild(this.containerNext.firstChild);
			}
			this.carouselNextElement.style.left = (this.rightToLeftFlag ? "" : "-") + "100%";
			this.containerNext.appendChild(HTMLElementArrayUsed[index]);
		}
	}
	slider.mainAnimation.onUpdate = progress => slider.carousel.style.left = -slider.rightToLeftMultiplier() * progress * mainContainerWidth + "px";
	slider.mainAnimation.onFinish = function() {
		slider.carousel.style.left = 0;  // default action is onUpdate(1)
		slider.fillContainerCurrent(slider.selectedSlide);
		slider.times--;
		if (slider.times > 0) {
			slider.launchAnimation();
		} else {
			slider.isAnimated = false;
		}
	}
	
	// add event listeners
	for (var i = 0; i < len; i++) {
		var liBottomButton = document.createElement("li");
		liBottomButton.classList.add("sliderBottomButton");
		liBottomButton.textContent = "•";
		(function(j) {
			liBottomButton.addEventListener("click", event => slider.onClickAction(event, j));
		})(i);
		ulBottomButtons.appendChild(liBottomButton);
	}
	divLeftScroller .addEventListener("click", event => slider.onClickAction(event, trunc(slider.selectedSlide - 1)));
	divRightScroller.addEventListener("click", event => slider.onClickAction(event, trunc(slider.selectedSlide + 1)));
	
	divSlider.style.width = mainContainerWidth + 2 * SLIDER_BUTTON_WIDTH + "px";
	divSlider.style.height = mainContainerHeight + SLIDER_BOTTOM_BUTTONS_HEIGHT + "px";
	
	// add classnames
	divLeftScroller      .classList.add("sliderScroller");
	divRightScroller     .classList.add("sliderScroller");
	divSlideMiddle       .classList.add("slide");
	divSlideRight        .classList.add("slide");
	divSlideMiddleData   .classList.add("slideData");
	divSlideRightData    .classList.add("slideData");
	divCenterContainer   .classList.add("sliderCenterContainer");
	divMainPanelContainer.classList.add("sliderMainPanelContainer");
	spanLeftButton       .classList.add("sliderScrollerButton", "buttonLeft");
	spanRightButton      .classList.add("sliderScrollerButton", "buttonRight");
	ulBottomButtons      .classList.add("sliderBottomButtons");
	divSlider            .classList.add("slider");
	
	// append elements
	divLeftScroller      .appendChild(spanLeftButton);
	divRightScroller     .appendChild(spanRightButton);
	divSlideMiddle       .appendChild(divSlideMiddleData);
	divSlideRight        .appendChild(divSlideRightData);
	divCenterContainer   .appendChild(divSlideMiddle);
	divCenterContainer   .appendChild(divSlideRight);
	divMainPanelContainer.appendChild(divLeftScroller);
	divMainPanelContainer.appendChild(divCenterContainer);
	divMainPanelContainer.appendChild(divRightScroller);
	divSlider            .appendChild(divMainPanelContainer);
	divSlider            .appendChild(ulBottomButtons);
	HTMLElementInsertInto.appendChild(divSlider);
	
	// hide added elements
	HTMLElementArrayUsed.forEach(element => element.style.display = "none");
	
	// fill the two elements with initial values
	slider.fillContainerCurrent(0);
	slider.updateBottomIndicator(0);
	return slider;
}

function $(id) {
	return document.getElementById(id);
}

window.onload = function() {
	var body = document.body;
	var elems1 = [$("img0"), $("img1"), $("p2"), $("ul3"), $("img4"), $("img5"), $("img6"), $("img7"), $("img8"), $("div9"), $("eleventh")];
	var elems2 = [$("loneImage")];
	var slider1 = createSliderFromHTMLElementArray([], body);
	var slider3 = createSliderFromHTMLElementArray(elems1, body);
	var slider2 = createSliderFromHTMLElementArray(elems2, body);
}