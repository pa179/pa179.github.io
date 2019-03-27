var ipHoldTimeout = null;

function updateEventListeners() {
	/*Update mode on Ip Field*/
	$('.ipField').on('mousedown', function() {
		ipHoldTimeout = setTimeout(ipHoldDown, 5000, this);
	}).on('mouseup mouseleave', function() {
		clearTimeout(ipHoldTimeout);
	});
	
	/*Cube*/
	$('.cfFront').on('mousedown touchstart', function() {
		$(this).parent('.section_cube').attr('class', 'section_cube');
		$(this).parent('.section_cube').addClass('show-right');
	});
	$('.cfRight').on('mousedown touchstart', function() {
		$(this).parent('.section_cube').attr('class', 'section_cube');
		$(this).parent('.section_cube').addClass('show-front');
	});
	
	console.log("Eventlisteners updated");
}

var holdCooldown = false;
function ipHoldDown(object) {
	if (holdCooldown) {
		return;
	} else {
		sendMQTT("devices/" + object.closest(".device_section").id + "/update", "1");
		holdCooldown = true;
		setTimeout(function() { holdCooldown = false; }, 2000);
	}
}




//MQTT Answers
function sendMQTT(device, msg) {
	connection.send(JSON.stringify({cmd: "mqttMessage", topic: device.toString(), message: msg.toString()}));
}
function sendCmd(cmd, deviceId, value) {
	//console.log(JSON.stringify({cmd: cmd, deviceId: deviceId, value: value}));
	connection.send(JSON.stringify({cmd: cmd, deviceId: deviceId, value: value}));
}


//Update Timelables
setInterval(function(){ 
	formatTimeFields();
}, 60000);




//-------------------Handler-------------------

//Connect Button
$('#btnConnect').on('click', function(event) {
	if (connection.readyState == connection.CLOSED){
		connectSocket();
	}
});

$(window).focus(function() {
	if (connection.readyState == connection.CLOSED){
		connectSocket();
	}
});



//-------------------Settings Window-------------------
var settingsWindow = document.getElementById('settingsWindow');
function updateSettings() {
	var table = document.getElementById('setDeviceList');
	table.innerHTML = '';
	for (var device of lastMessage) {
		var zeile = table.insertRow(table.rows.length); //Zeile ans Ende
		zeile.id = device.deviceId;
		if (device.lastAnswer == -1)
			zeile.classList = 'setOffline';
		if (device.customName == null)
			device.customName = '';
		
		var state = zeile.insertCell(0).innerHTML = '<div class="statusLight slDefaultOn"></div>';
		var id = zeile.insertCell(1).innerHTML = '<a>' + device.deviceId + '</a>';
		var name = zeile.insertCell(2).innerHTML = '<input class="setCustomName" type="text" maxlength="15" value="' + device.customName + '"/><button class="setSpeichern">Ok</button>';
	}
	$('.setSpeichern').on('click', function(event) {
		sendCmd("customName", event.target.parentNode.parentNode.id, event.target.previousSibling.value);
		hideSettings();
	});
}

//Button zun oeffnen Click
$('#btnSettings').on('click', function() {
	if (settingsWindow.style.display != "block")
		showSettings();
	else 
		hideSettings();
	event.stopPropagation();

});
//Click ausserhalb des Fensters
$(window).click(function() {
	hideSettings();
});
$('#settingsWindow').on('click', function(event) {
	event.stopPropagation();
});
//Click auf Kreuz
$('#closeSettings').on('click', function() {
	hideSettings();
});
function showSettings() {
	settingsWindow.style.display = "block";
	document.getElementById("mainPage").classList = "blurred";
	updateSettings();
}
function hideSettings() {
	document.getElementById("mainPage").classList = "";
	settingsWindow.style.display = "none";
}
//--------------------------------------




/*var btnAdd = document.getElementById("btnAdd");

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  btnAdd.style.display = 'block';
});

btnAdd.addEventListener('click', (e) => {
  // hide our user interface that shows our A2HS button
  btnAdd.style.display = 'none';
  // Show the prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
		if (choiceResult.outcome === 'accepted') {
		console.log('User accepted the A2HS prompt');
		} else {
		console.log('User dismissed the A2HS prompt');
		}
		deferredPrompt = null;
    });
});




window.addEventListener('appinstalled', (evt) => {
	app.logEvent('a2hs', 'installed');
});


if (window.matchMedia('(display-mode: standalone)').matches) {
	console.log('display-mode is standalone');
}
*/

