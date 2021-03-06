//* @protected

/**
	Event modal capture feature: capture events to a specific
	control via enyo.dispatcher.capture(inControl, inShouldForward)
	release events via enyo.dispatcher.release()
*/
enyo.dispatcher.features.push(function(e) {
	var c = e.dispatchTarget;
	var wants = this.captureTarget && !this.noCaptureEvents[e.type];
	var needs = wants && !(c && c.isDescendantOf && c.isDescendantOf(this.captureTarget));
	if (needs) {
		var c1 = e.captureTarget = this.captureTarget;
		// NOTE: We do not want releasing capture while an event is being processed to alter
		// the way the event propagates. Therefore decide if the event should forward
		// before the capture target receives the event (since it may release capture).
		var shouldForward = (this.autoForwardEvents[e.type] || this.forwardEvents);
		this.dispatchBubble(e, c1);
		if (!shouldForward) {
			e.preventDispatch = true;
		}
	}
});

//
//	NOTE: This object is a plug-in; these methods should
//	be called on _enyo.dispatcher_, and not on the plug-in itself.
//
enyo.mixin(enyo.dispatcher, {
	noCaptureEvents: {load: 1, unload:1, error: 1, transitionend: 1, animationend: 1},
	autoForwardEvents: {leave: 1, resize: 1},
	captures: [],
	//* Capture events for `inTarget` and optionally forward them
	capture: function(inTarget, inShouldForward) {
		var info = {target: inTarget, forward: inShouldForward};
		this.captures.push(info);
		this.setCaptureInfo(info);
	},
	//* Remove the specified target from the capture list
	release: function(inTarget) {
		for (var i = this.captures.length - 1; i >= 0; i--) {
			if (this.captures[i].target === inTarget) {
				this.captures.splice(i,1);
				this.setCaptureInfo(this.captures[this.captures.length-1]);
				break;
			}
		}
	},
	//* Set the information for a captured event
	setCaptureInfo: function(inInfo) {
		this.captureTarget = inInfo && inInfo.target;
		this.forwardEvents = inInfo && inInfo.forward;
	}
});
