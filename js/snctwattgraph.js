snctWattGraph = {
	generate: function() {
		var url = "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv";
		var csv = getCsvFromUrl(url);
		var graph_data = extractWattData(csv);
		drawWattGraph(graph_data);
	},
};

function getCsvFromUrl(url) {
	var csv;// = undefined;
	$.ajax({
		url: url,
		type: "GET",
		async: false,
		success: function(res) {
			var content = $(res.responseText).text();
			csv = trim(content);
		},
	});
	console.log(csv);
	return csv;
}

function trim (csv) {
	// 先頭末尾のスペースとLF文字を削除
	var lf = String.fromCharCode(10);
	var trimedText = csv.replace(/^(\s|lf)+|(\s|lf)+$/g, "");
	return trimedText;

}

function extractWattData(csv) {
	console.log(csv);
	// カンマ,スペースで分割　["y/m/d", "h:m:s", "#n#", "value", ...]
	textList = csv.split(/\s*\,\s*|\s/);
	// 時刻の部分だけ取り出す　["h:m:s", "h:m:s", ...]
	timeList = _.filter(textList, function(d, i) { return i % 4 == 1});
	// watt値のところだけ取り出す　[value0, value1, ...]
	wattList = _.map(_.filter(textList, function(d, i) { return i % 4 == 3}), 
		function(d) { return parseInt(d)});

	return { time: timeList, watt: wattList };
}


function drawWattGraph(graph_data) {
	wattList = graph_data.watt;
	timeList = graph_data.time;
	var grach_data = {
    bindto: '#chart',
		size: {
	    //height: 450,
      width: 900
    },
    data: {
    	x: 'time',
    	columns: [ 
    		['time'].concat(timeList),
    		['watt'].concat(wattList)
    	]
    },
    axis: {
    	x: {
    		type: 'category',
    		tick: {
    			culling: {
    				max: 14
    			}
    		}
    	},
    	y: {
    		max: 450,
    		min: 0
    	}
    }
	}
	var chart = c3.generate(grach_data);

}
