function init(id) {
	var section = document.getElementById(id);
	
	var tor1Display = section.getElementsByClassName('tor1')[0];
	var tor2Display = section.getElementsByClassName('tor2')[0];

	var open1 = section.getElementsByClassName('g_open1')[0].innerHTML;
	var close1 = section.getElementsByClassName('g_close1')[0].innerHTML;
	var open2 = section.getElementsByClassName('g_open2')[0].innerHTML;
	var close2 = section.getElementsByClassName('g_close2')[0].innerHTML;

	if (open1 == 'true' && close1 == 'true')
		tor1Display.setAttribute("state", "fehler");
	else if (open1 == 'true')
		tor1Display.setAttribute("state", "auf");
	else if (close1 == 'true')
		tor1Display.setAttribute("state", "zu");
	else
		tor1Display.setAttribute("state", "teil");
		
	if (open2 == 'true' && close2 == 'true')
		tor2Display.setAttribute("state", "fehler");
	else if (open2 == 'true')
		tor2Display.setAttribute("state", "auf");
	else if (close2 == 'true')
		tor2Display.setAttribute("state", "zu");
	else
		tor2Display.setAttribute("state", "fehler");

	//$('#garageOpen1').off();
	$('#' + id).find('.garageOpen1').off();
	$('#' + id).find('.garageOpen2').off();
	//$('#garageOpen1').on('mousedown touchstart', open1);
	//$('#garageOpen2').on('mousedown touchstart', open2);
	/*document.getElementById("garageOpen1").addEventListener("mousedown touchstart", open1, false);
	document.getElementById("garageOpen2").addEventListener("click", open2, false);*/
	//$('#garageOpen1').on('click', function() {
	$('#' + id).find('.garageOpen1').on('click', function() {
		var ok = confirm("Tor 1 öffnen?");
		if (ok) {
			sendMQTT('devices/garage/tor1', '1');
		}
	});
	$('#' + id).find('.garageOpen2').on('click', function() {
		var ok = confirm("Tor 2 öffnen?");
		if (ok) {
			sendMQTT('devices/garage/tor2', '1');
		}
	});
}