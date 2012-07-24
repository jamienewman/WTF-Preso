/**
 * PRESO
 * 
 * Author: Shaun Baker
 * 
 */
var PRESO = PRESO || {};


/**
 * 
 * 
 * These are our global app settings
 * 
 *  
 */
PRESO.url = window.location;
PRESO.hslide = 0;
PRESO.vslide = 0;
PRESO.socket = io.connect( window.location.origin );


/**
 * 
 * This function initialises the Reveal.js slide deck plugin with its configuration options
 * 
 */
PRESO.presentationInit = function(){

	Reveal.initialize({
	    controls: true,
	    progress: true,
	    history: true,
	    loop: true,
	    mouseWheel: true,
	    rollingLinks: true,
	    theme: 'default',
	    transition: 'default'
	});	

};


/**
 * 
 * This function sets up some function calls given the path the app is
 * currently on.
 * 
 */
PRESO.socket.on('connect', function (data){

	// This is the mobiel device
	if( PRESO.url.pathname === '/control' ){

		// Set the channel name for reference to narrow communications
		// instead of broadcasting to both pages all the time
		PRESO.socket.emit('setChannel', {
        	'channelName': 'presentation:control'
    	});


		// Emit the event to acknowledge that the qr code has been scanned
		// and that the app is now taken over
		PRESO.socket.emit('control:control', {'evt': true });


		// Call this page specific publish functions
    	PRESO.controlFunctions();
		PRESO.pubVideoHandler();


		// hide the qr code element in the DOM
		// 
		// @TODO remove qr code from control page completely
		// then no need for this
		var qr = document.getElementById('qr');
		qr.setAttribute('class', 'hide');


	// This is in the browser
    }else{

 
 		// Set the channel name for reference to narrow communications
		// instead of broadcasting to both pages all the time   	
 		PRESO.socket.emit('setChannel', {
        	'channelName': 'presentation'
    	});   	


 		// Listen for the controlled message indicating that the preso
 		// has been scanned and is now connected/controlled
		PRESO.socket.on('presentation:controlled', function(message){

			// Hide the control elem
			var qr = document.getElementById('qr');
			qr.setAttribute('class', 'hide');

		});

 
 		// Init our subscribe functions
    	PRESO.subControlMessage();
		PRESO.subVideoHandler();

    }

});


/**
 * 
 * This function listens to the slidechanged event that is emitted from Reveal.js
 * and publish the index {horizontal, vertical} across the sockets
 * 
 * @Issue - This event fires twice for each change hence the if statement so we dont broadcast twice
 *  
 */
PRESO.controlFunctions = function(){

	Reveal.addEventListener('slidechanged', function(event){
	    
		// @Issue
	    if( ( event.indexh !== PRESO.hslide ) || ( event.indexv !== PRESO.vslide ) ){

	    	// Set the apps globals to the current indexes
	    	PRESO.hslide = event.indexh;
	    	PRESO.vslide = event.indexv;

	    	// Publish the message
			PRESO.socket.emit('control:message', {'h': PRESO.hslide, 'v': PRESO.vslide });

	    }
	    
	}, false);

};


/**
 * 
 * This function listens for navigate messages from the socket
 * and instructs the slide deck to transition to the provided page
 * 
 */
PRESO.subControlMessage = function(){

	PRESO.socket.on('presentation:navigate', function(message){

		Reveal.navigateTo( message.h, message.v );

	});

};


/**
 * 
 * This function setups up listeners to events emitted from a video in the slide deck
 * These events are the sent across the socket to manage the playing/pausing of video/s
 * 
 */
PRESO.pubVideoHandler = function(){

	// Get the video els in the DOM
	var videos = document.querySelectorAll('.videobox');

	// Loop the video els
	[].forEach.call(videos, function(elem){ 
	    
		// Attach a listener for the play event
		elem.addEventListener('play', function(evt){

			// Send the play event across the socket with the els classlist
			PRESO.socket.emit('control:video', {'evt': 'play', 'el': evt.target.classList });

		}, true);


		// Attach a listener for the pause event
		elem.addEventListener('pause', function(evt){

			
			// Send the pause event across the socket with the els classlist
			PRESO.socket.emit('control:video', {'evt': 'pause', 'el': evt.target.classList });

		}, true);

	});

};


/**
 * 
 * This function setups a listener on the sockets for
 * events to action on videos in the slide deck
 * 
 */
PRESO.subVideoHandler = function(){

	PRESO.socket.on('presentation:video', function(message){

		// Get the element the message relates to
		var el = document.getElementsByClassName(message.el[1]);

		// If the element is not playing - play - else - pause
		message.evt === 'play' ? el[0].play() : el[0].pause();

	});

};


/**
 * 
 * Initialise the application
 * 
 */
PRESO.init = function(){

	PRESO.presentationInit();

};


/**
 * 
 * Quick, dirty not 100% function invoked immediatley
 * and calling the init function when the documents
 * ready state is either interactive or complete
 * 
 */
(function() {
    var state = document.readyState;
    if(state === 'interactive' || state === 'complete') {
        PRESO.init();
    }else{
    	setTimeout(arguments.callee, 100);
    }
})();


