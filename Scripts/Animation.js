var STANDARD_DURATION = 1000;

function Animation(dur) {
	var start;
	var duration = dur || STANDARD_DURATION;
	var progress;
	var paused = false;
	var cancelled = false;
	this.reverseFlag = false;
	var cycled = false;
	var that = this;
	
	this.setDuration = function(dur) {
		duration = dur;
	}
	this.onStart = function() {
		//console.log(this.name + ".onStart()");
		progress = 0;
		this.onUpdate(this.reverseFlag ? 1 : 0);
	}
	this.run = function() {
		start = new Date().valueOf();
		paused = false;
		cancelled = false;
		this.onStart();
		animate();
	}
	this.cancel = function() {
		cancelled = true;
	}
	this.pause = function() {
		paused = true;
	}
	this.isPaused = function() {
		return paused;
	}
	this.resume = function() {
		start = new Date().valueOf();
		paused = false;
	}
	this.reverse = function(flag) {
		if (arguments.length != 1)
			flag = !this.reverseFlag;
		flag = !!flag;
		if (this.reverseFlag != flag) {
			this.reverseFlag = flag;
			progress = 1 - progress;
		}
	}
	this.slow = function(factor) {
		duration *= factor;
	}
	this.cycle = function(flag) {
		if (flag === !!flag)
			cycled = flag;
		else
			cycled = !cycled;
	}
	function animate() {
		if (paused) {
			requestAnimationFrame(animate);
			return;
		}
		var now = new Date().valueOf();
		progress += (now - start) / duration;
		start = now;
		if (progress >= 1) {
			progress = 1;
			that.onFinish();
			if (cycled)
				that.run(duration);
			return;
		}
		if (!cancelled)
			requestAnimationFrame(animate);
		var realProgress = that.reverseFlag ? (1 - progress) : progress;
		//console.log(that.name + ".onUpdate(" + realProgress.toFixed(2) + ")");
		that.onUpdate(realProgress);
	}
}

Animation.prototype.onFinish = function() {
	//console.log(this.name + ".onFinish()");
	this.onUpdate(this.reverseFlag ? 0 : 1);
}

Animation.prototype.onUpdate = function(progress) {
	this.cancel();
	console.warn("You should override Animation.onUpdate() method.");
}