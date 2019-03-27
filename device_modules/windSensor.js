var wind = document.getElementById('wind').innerHTML;
var maxWind = document.getElementById('maxWind').innerHTML;


document.getElementById('windKmh').innerHTML = rotTimeToKmh(600/wind);
document.getElementById('windMaxKmh').innerHTML = rotTimeToKmh(maxWind/1000);

function rotTimeToKmh(rotTime) {
	//var kmh = -8.606 * Math.log(rotTime) + 19.027;
	var kmh = 17.983 * Math.pow(rotTime, -0.526);
	if (kmh <= 0) {
		return 0;
	} else {
		return kmh.toFixed(1);		
	}
}