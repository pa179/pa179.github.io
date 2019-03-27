var connection = new WebSocket('ws://192.168.178.57:8080');

connection.onopen = function () {
	// connection is opened and ready to use
	console.log("Socket opened.");
	connection.send('ping');
};

connection.onerror = function (error) {
	// an error occurred when sending/receiving data
	console.log('WebSocket Error ' + error);
};

connection.onmessage = function (message) {
	try {
		console.log('Server: ' + message.data);
		var json = JSON.parse(message.data);

		var sections = [];
		for (var device of json) {
			var section = null;
			$.ajax({
				url: "device_modules/" + device.deviceCategory + ".html", 
				global: false,
				async:false,
				success: function(result){
					section = result;
				}, 
				error: function (xhr, ajaxOptions, thrownError) {
					alert(xhr.status);
					alert(thrownError);
				}
			});
			
			section = $($.parseHTML(section));
			$(section).attr("id", device.deviceId);
			if (device.lastAnswer == -1)
				$(section).addClass("offline");
			//$("body").append(section);
			sections.push(section);
		}
		
		sections.sort(sortDevices);
		
		for (var section of sections) {
			$("body").append(section);
		}
		
		for (var device of json) {
			var current_section = document.getElementById(device.deviceId);
			
			if (device.lastAnswer == -1)
				current_section.classList.add("offline");				
			
			for (var attribute in device) {
				current_section.querySelectorAll('[field=' + attribute + ']').forEach(function(element) {
					var value = device[attribute];
					element.innerHTML = value;
				});
			}
			
			//Update deviceUI with its script
			$.getScript("device_modules/" + device.deviceCategory + ".js");	
		}
		
		
		//Format time and voltage
		document.querySelectorAll(".time").forEach(function(element) {
			if (element.innerHTML != -1)
				element.innerHTML = new Date(element.innerHTML).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
			else {
				element.innerHTML = "--:--";
			}
		});

	} catch (e) {
		console.log(e);
		console.log('Message not in JSON Format.');
		return;
	}
};

function sendMQTT(device, msg) {
	connection.send(JSON.stringify({topic: device.toString(), message: msg.toString()}));
}


function sortDevices(a, b) {
	if ((a.hasClass('offline') && b.hasClass('offline'))||(!a.hasClass('offline') && !b.hasClass('offline'))) {
		return sortByName(a.id, b.id);
	}
	if (a.hasClass('offline')) {
		return 1;
	}
	if (b.hasClass('offline')) {
		return -1
	}
}

function sortByName(a, b) {
	var aName = a.toLowerCase();
	var bName = b.toLowerCase(); 
	return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}