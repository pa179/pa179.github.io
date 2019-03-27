function init(id) {
	var section = document.getElementById(id);

	//Icon anzeige
	var temp = section.getElementsByClassName("ws_tempValue")[0].innerHTML;
	var tempIcon = section.getElementsByClassName("wsIcon")[0];
	if (temp < 0)
		tempIcon.style.backgroundPosition = "0% 0%";
	else if (temp >= 0 && temp < 5)
		tempIcon.style.backgroundPosition = "16.666% 0%";
	else if (temp >= 5 && temp < 10)
		tempIcon.style.backgroundPosition = "33.333% 0%";
	else if (temp >= 10 && temp < 15)
		tempIcon.style.backgroundPosition = "50% 0%";
	else if (temp >= 15 && temp < 20)
		tempIcon.style.backgroundPosition = "66.666% 0%";
	else if (temp >= 20 && temp < 25)
		tempIcon.style.backgroundPosition = "83.333% 0%";
	else if (temp >= 30)
		tempIcon.style.backgroundPosition = "100% 0%";

	
		
	//Chart
	var tempChartObject = section.getElementsByClassName('tempGraph')[0];

	$(document).ready(function() {
		//getLastValues();
		getTempTrend(id);
	});


	function getTempTrend(id) {
		$.ajax({
			url: "/dbRequest.php",
			data: {cmd: 'SELECT timestamp as x, temperature as y FROM ' + id + ' WHERE x >= "' + moment().subtract(3, 'h').format('YYYY-MM-DD HH:mm:ss') + '"'}, //Aus letzten 3 Stunden
			method: "GET",
			success: function(data) {
				//x = time, y = temp
				var json = jQuery.parseJSON(data);
				
				var tempReg = linReg(json); //tempReg[m, b]
				
				var tempTrend = getY(tempReg, moment().unix() + 3600);
				
				
				//Chart
				
				var time = [];
				var temp = [];
				var trend = [];
				
				for (var i in json) {
					time.push(json[i].x);
					temp.push(json[i].y);
					//trend.push({x: json[i].timestamp ,y: round(m * moment(json[i].timestamp).unix() + b)});
				}
				trend.push({x: json[0].x ,y: getY(tempReg, moment(json[0].x).unix())}); //Erster Punkt
				trend.push({x: moment(moment().add(1, 'hours')), y: tempTrend}); //Eine Stunde Zukunft
				
				var chartdata = {
					labels: time,
					datasets: [{
						label: 'Temperatur',
						lineTension: 0,
						borderColor: 'rgba(220, 0, 0, 0.7)',
						backgroundColor: 'rgba(0, 0, 0, 0)',
						pointRadius: 0,
						pointHoverRadius: 0,
						borderWidth: 2,
						data: temp
					},
					{
						label: 'Trend',
						lineTension: 0,
						borderColor: 'rgba(150, 150, 150, 0.7)',
						backgroundColor: 'rgba(0, 0, 0, 0)',
						pointRadius: 0,
						pointHoverRadius: 0,
						//borderDash: [5,10],
						borderWidth: 2,
						data: trend
					}]
				}
				
				var chart = new Chart(tempChartObject, {
					type: 'line',
					data: chartdata,
					options: {
						title: {
							display: true,
							text: 'Temperaturentwicklung'
						},
						scales: {
							yAxes: [
							{
								ticks: {
									stepSize: 1
									//min: Math.min.apply(this, temp) - 0.5,
									//max: Math.max.apply(this, temp) + 0.5
								}
							}],
							xAxes: [{
								type: 'time',
								time: {
									parser: 'YYYY-MM-DD HH:mm:ss',
									unit: 'hour',
									unitStepSize: 1,
									displayFormats: {
										hour: 'HH:mm',
										minute: 'HH:mm'
									}
								}
							}]
						},
						legend: {
							display: false
						},
						tooltips: {
							enabled: false
						}
					}
				});
				
				
			},
			error: function(data) {
				console.log(data);
			}
		});
	}
}



function linReg(json) {
	var sumY = 0;
	var sumX = 0;
	for (var i=0; i < json.length; i++) {
		sumY += json[i].y;
		sumX += moment(json[i].x).unix();
	}
	var avgY = sumY/json.length;
	var avgX = sumX/json.length;
	
	/*var Sxx = 0;
	for (var i=0; i < json.length; i++) {
		Sxx += Math.pow((json[0].y - avgY), 2);
	}*/
	var Sxy = 0;
	for (var i=0; i < json.length; i++) {
		Sxy += (json[i].y - avgY) * (moment(json[i].x).unix() - avgX);
	}
	var Syy = 0;
	for (var i=0; i < json.length; i++) {
		Syy += Math.pow((moment(json[i].x).unix() - avgX), 2);
	}
	
	var m = Sxy/Syy;
	var b = avgY - m * avgX;
	
	return [m, b]
}
function getY (params, x){
	return round(params[0] * x + params[1]);
}

function round(num) {
	return (Math.round(num*100)/100).toFixed(2);
}