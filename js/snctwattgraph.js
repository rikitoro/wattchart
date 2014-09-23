snctWattGraph = {
	generate: function() {
		var url = "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv";
		$.get(url)
		.done(function(res) {
			var csv = getCsvString(res);
			console.log(csv);
			var data = extractWattData(csv);
			drawWattGraph(data);
		})
	}
};

// getCscString: 日付 時間, #no#, wattをセットとしたテキストを返す
// "2014/Sep/23 06:00:01, #0#, 107 2014/Sep/23 06:05:01, #1#, 103"
function getCsvString (res) {// 
	// ここを何とかすべし
	return $.parseHTML(res.results[0])[5].textContent;
}

function extractWattData(csv) {
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
	var graph_data = {
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
	var chart = c3.generate(graph_data);
}
