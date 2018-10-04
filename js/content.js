console.log("Foreground script running successfully");
let ARROW_RIGHT = 39, ARROW_LEFT = 37;
let SPACE = 13, PAUSE = 32;
let SKIPDISTANCE_MULTIPLIER = 5;
var active = 0;

let message = {
	sender: "content.js", //sender of the message
	receiver: "", //intended message destination
	action: "",
	property: ""
}

let navControl = {
	navbar : null,      //the navbar element itself
	navbarDims : null,  //the dimensions of the navbar
	navbarPointer : null, //the time pointer element
	navbarPointerDims : null, //where the navbar is on the page
	playBtn : null, //play button element
	pauseBtn : null, //pause button element
	skipDistance : null, //amount of skipping per keypress
	clientY : null, //client's static y location on navbar
}

function constructMessage(rec, act, prop){
	message.receiver = rec;
	message.action = act;
	message.property = prop;
}

function enablePresetState() {
	console.log("enablepresentstate");
	constructMessage('background.js', 'request', 'state');
	chrome.runtime.sendMessage(message, (resp) => {
		console.log("resp is ", resp);
		if(resp.property == "true"){
			active = 1;
			initializeNavBar();
		}
		else {
			active = 0;
			destroyNavbar();
		}
	});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("message received", request);
	if(request.receiver == "content.js"){
		if(request.action != ""){
			switch (request.action){
				case "toggle" :
					switch(request.property){
						case "navControl" :
							if(active == 0) initializeNavBar();
							else destroyNavBar();
							constructMessage(request.sender, "response", "state toggled");
							sendResponse(message);
							break;
						default :
							constructMessage(request.sender, "Unknown property", "ERROR");
							sendResponse(message);
					}
					break;
				case "set" :
					console.log("set request received");
					switch(request.property){
						case 'speed' :
							navControl.skipDistance = SKIPDISTANCE_MULTIPLIER * Number(request.value);
							console.log("skip distance changed to", navControl.skipDistance);
							constructMessage(request.sender, 'speed set', 'ok');
							sendResponse(message);
							break;
						default :
					}
					break;
				default :
					constructMessage(request.sender, "Unknown action", "ERROR");
					sendResponse(message);
			}
		}
	}
});

function initializeNavBar () {
	active = 1;
	navControl.navbar = document.getElementById('id_controlbar').children[7].children[4];
	navControl.navbarDims = navControl.navbar.getBoundingClientRect();
	navControl.navbarPointer = document.getElementById('id_controlbar').children[7].children[5];
	navControl.navbarPointerDims = navControl.navbarPointer.getBoundingClientRect();
	navControl.playBtn = document.getElementById('id_controlbar').children[2];
	navControl.pauseBtn = document.getElementById('id_controlbar').children[1];
	navControl.skipDistance = SKIPDISTANCE_MULTIPLIER;
	navControl.clientY = navControl.navbarDims.y;
	document.addEventListener('keyup', (e) => { return processKeyup(e)});
}

function destroyNavBar(){
	active = 0;
	navControl.navbar = null;      //the navbar element itself
	navControl.navbarDims = null;  //the dimensions of the navbar
	navControl.navbarPointer = null; //the time pointer element
	navControl.navbarPointerDims = null; //where the navbar is on the page
	navControl.playBtn = null; //play button element
	navControl.pauseBtn = null; //pause button element
	navControl.skipDistance = null; //amount of skipping per keypress
	navControl.clientY = null; //client's static y location on navbar
	document.removeEventListener('keyup', processKeyup, true);
}

function updateNavBar () {
	navControl.navbarPointerDims = navControl.navbarPointer.getBoundingClientRect();
}

//Toggle to determine play/pause state
function toggler() {
	if (typeof toggler.swap === "undefined") toggler.swap = 0;
	return (++toggler.swap) % 2;
}

//Triggers a play or a pause based on the state
function toggleState(stopped){
	if(stopped) play();
	else pause();
}

function backward() {
	updateNavBar();
	simClick(navControl.navbar, 0, 0, navControl.navbarPointerDims.x - navControl.skipDistance, navControl.clientY);
}

function forward() {
	updateNavBar();
	simClick(navControl.navbar, 0, 0, navControl.navbarPointerDims.x + navControl.skipDistance + navControl.navbarPointerDims.width, navControl.clientY);
}

function play() {
	navControl.playBtn.click();
}

function pause() {
	navControl.pauseBtn.click();
}


//simulates a click event on the page
function simClick(element, screenx, screeny, clientx, clienty) {
	var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window,
			0, screenx, screeny, clientx, clienty, false, false, false, false, 0, null);
	element.dispatchEvent(evt);
}


//waits for enter/space to toggle play/pause


function processKeyup(e){
	e.preventDefault();
	if(active){
		if(e.keyCode == SPACE || e.keyCode == PAUSE) toggleState(toggler());
		else if (e.keyCode == ARROW_LEFT) backward();
		else if (e.keyCode == ARROW_RIGHT) forward();
	}
}
setTimeout(enablePresetState, 3000);
