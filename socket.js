//User Valriables
//const SERVER_IP = 'ws://192.168.178.57:8080';
const HOST_NAME = "192.168.178.57";
const PORT = 8080;




//System Constants
const SECTION_OFFLINE_MARKER = "offline";
const SECTION_UPDATE_MARKER = "update";
const SECTION_DEFAULT_MARKER = "default";

const STATUS_TEXT_OFFLINE = "Offline";

const DOM_ATTRIBUTE_FIELD = "field";
const DOM_ATTRIBUTE_ROUND = "round";
const DOM_ATTRIBUTE_PRIORITY = "prio";
const DOM_CLASS_TIMEFIELD = "time";

const LOG_TEXT_NO_JSON = "Message not in JSON Format.";
const LOG_TEXT_SOCKET_OPENED = "Socket opened.";
const LOG_TEXT_SOCKET_CLOSED = "Socket closed.";
const LOG_TEXT_SOCKET_ERROR = "WebSocket Error: ";
const LOG_MESSAGE_FROM_SERVER = "Message from Server: "
const SCRIPT_LOAD_ERROR = "Script loading error: "

const CLIENT_PING_TEXT = "ping";

const SECTION_MODULE_PATH = "device_modules/";
const SECTION_DEFAULT_MODULE_FILE = "default";

const DEVICE_STATUS_TEXT_OFFLINE = -1;
const DEVICE_STATUS_TEXT_UPDATEMODE = "updateMode";



var connection = null;
var lastMessage = null;

//Connect Socket on load
document.addEventListener('DOMContentLoaded', function() {
    connectSocket();
}, false);

/** Create new socket connection */
function connectSocket() {
	connection = new WebSocket("ws://" + HOST_NAME + ":" + PORT);
	connection.onopen = wsOpened;
	connection.onerror = wsError;
	connection.onclose = wsClosed;
	connection.onmessage = wsMessage;
}


//------------------------------
//----Websocket Functions-------

/** connection is opened and ready to use */
function wsOpened() {
	
	console.log(LOG_TEXT_SOCKET_OPENED);
	connection.send(CLIENT_PING_TEXT);
	setConnectionDisplay(true);
}

/** an error occurred when sending/receiving data */
function wsError() {
	console.log(LOG_TEXT_SOCKET_ERROR + error);
	setConnectionDisplay(false);
}

/** connection was closed */
function wsClosed() {
	console.log(LOG_TEXT_SOCKET_CLOSED); 
	setConnectionDisplay(false);
}

/** message received */
function wsMessage(message) {
	// try to decode json (I assume that each message from server is json)
	try {
		console.log(LOG_MESSAGE_FROM_SERVER + message.data);
		var json = JSON.parse(message.data);
		lastMessage = json;
		//Sort Sections
		//json.sort(sortDevices);
		//Remove offline and update attributes
		resetSectionAttributes();
	
		// Handle incoming message
		for (var device of json) {
			//Check if section already exists
			if (document.getElementById(device.deviceId) == null) {
				loadModule(device.deviceId, device.deviceCategory);
			}
			//Set values of fields
			var current_section = document.getElementById(device.deviceId);
			setAttributes(current_section, device);
			//Update deviceUI with its script
			if (!current_section.classList.contains(SECTION_DEFAULT_MARKER)) {
				initScript(device);
			}

		}
		
		//Format time and voltage
		formatTimeFields();
		updateEventListeners();
		
		sortSections();
	} catch (e) {
		console.log(e);
		console.log(LOG_TEXT_NO_JSON);
		return;
	}
}

function loadModule(id, category) {
	var defaultUsed = false;
	//Load HTML Section
	var device_section = loadHTML(category);
	if (device_section == null) {
		device_section = loadHTML(SECTION_DEFAULT_MODULE_FILE);
	}
	
	device_section = $($.parseHTML(device_section)); //Parse HTML to Element
	$("#grid").append(device_section); //Append to Main Page
	device_section.attr("id", id); //Set id Attribute
	if (defaultUsed)
		device_section.addClass(SECTION_DEFAULT_MARKER);
	
	return defaultUsed;
}

function loadHTML(filename) {
	var fileContent = null;
	$.ajax({
		url: SECTION_MODULE_PATH + filename + ".html",
		global: false,
		async: false,
		success: function (data) {			
			fileContent = data;
		},
		dataType: 'html'
	});
	return fileContent;
}

function resetSectionAttributes() {
	document.querySelectorAll(".device_section").forEach(function(element) {
		//element.classList = "device_section";
		element.classList.remove(SECTION_OFFLINE_MARKER);
		element.classList.remove(SECTION_UPDATE_MARKER);
	});
}

function setAttributes(section, content) {
	if (content.lastAnswer == DEVICE_STATUS_TEXT_OFFLINE)
		section.classList.add(SECTION_OFFLINE_MARKER);	
	if (content.status == DEVICE_STATUS_TEXT_UPDATEMODE)
		section.classList.add(SECTION_UPDATE_MARKER);
	
	for (var attribute in content) {
		section.querySelectorAll('[' + DOM_ATTRIBUTE_FIELD + '=' + attribute + ']').forEach(function(element) {
			var value = content[attribute];
			var round = element.getAttribute(DOM_ATTRIBUTE_ROUND);
			if (round != null) {
				element.innerHTML = parseFloat(value).toFixed(round)
			} else if (element.className == DOM_CLASS_TIMEFIELD) {
				element.setAttribute("value", value);
			} else {
				element.innerHTML = value;
			}
		});
	}
}

function initScript(device) {
	try {
		$.getScript(SECTION_MODULE_PATH + device.deviceCategory + ".js", function(){
		   init(device.deviceId);
		});
	} catch(err) {
		console.log(SCRIPT_LOAD_ERROR + err);
	}
}

function formatTimeFields() {
	/*document.querySelectorAll("." + DOM_CLASS_TIMEFIELD).forEach(function(element) {
		if (element.innerHTML != DEVICE_STATUS_TEXT_OFFLINE)
			element.innerHTML = new Date(element.innerHTML).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		else {
			element.innerHTML = STATUS_TEXT_OFFLINE;
		}
	});*/
	document.querySelectorAll("." + DOM_CLASS_TIMEFIELD).forEach(function(element) {
		if (element.getAttribute("value") != DEVICE_STATUS_TEXT_OFFLINE)
			element.innerHTML = Math.abs(((Date.now() - Date.parse(element.getAttribute("value")))/60000).toFixed(0)) + " Min.";
	});
}

function sortSections() {
	var $grid = $('#grid'); //Grid to sort
	$grid.find('.device_section').sort(function(a, b) {
		var result = sortByStatus(a, b);
		if (result == 0)
			result = sortByPrio(a, b);
		if (result == 0)
			result = sortById(a, b);
		return result;
	})
	.appendTo($grid);
}


//------------------------------
//------------------------------



/** Sort Sections by lastAnswer and ID */
/*function sortDevices(a, b) {
	//Wenn beide Offline oder beide nicht Offline:
	if ((a.lastAnswer != DEVICE_STATUS_TEXT_OFFLINE && b.lastAnswer != DEVICE_STATUS_TEXT_OFFLINE)||(a.lastAnswer == DEVICE_STATUS_TEXT_OFFLINE && b.lastAnswer == DEVICE_STATUS_TEXT_OFFLINE))
		return sortByName(a.deviceId, b.deviceId);
	if (a.lastAnswer == DEVICE_STATUS_TEXT_OFFLINE)
		return 1;
	if (b.lastAnswer == DEVICE_STATUS_TEXT_OFFLINE)
		return -1
}*/
/** Sort Texts by Alphabet */
/*function sortByName(a, b) {
	var aName = a.toLowerCase();
	var bName = b.toLowerCase(); 
	return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}*/



/** Sort Sections by Offline */
function sortByStatus(a, b) {
	var aStatus = a.classList.contains(SECTION_OFFLINE_MARKER);
	var bStatus = b.classList.contains(SECTION_OFFLINE_MARKER); 
	return ((aStatus < bStatus) ? -1 : ((aStatus > bStatus) ? 1 : 0));
}
/** Sort Sections by Prio */
function sortByPrio(a, b) {
	var aPrio = a.getAttribute(DOM_ATTRIBUTE_PRIORITY);
	var bPrio = b.getAttribute(DOM_ATTRIBUTE_PRIORITY);
	if (aPrio == null && bPrio == null)
		return 0
	else if (aPrio == null)
		return 1
	else if (bPrio == null)
		return -1
	else
		return ((aPrio < bPrio) ? -1 : ((aPrio > bPrio) ? 1 : 0));
}
/** Sort Sections by Id */
function sortById(a, b) {
	var aName = a.id.toLowerCase();
	var bName = b.id.toLowerCase(); 
	return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}



/**
  * Set the status setction in Header
  * @param {string} connected - Connection is established.
  */
function setConnectionDisplay(connected) {
	if (connected) {
		$("#btnConnect").find('.statusLight').css('background-color', '#11b300');
		$("#btnConnect").find('.btnText').text("Verbunden");
	} else {
		$("#btnConnect").find('.statusLight').css('background-color', '#FF0000');
		$("#btnConnect").find('.btnText').text("Verbinden");
	}
}
