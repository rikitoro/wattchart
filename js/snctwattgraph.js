snctWattGraph = {
	make: function() {
		var url = "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv";
		var dataTranslator = text2dataset;
		var drawer = drawWattGraph;
		constructWattGraph(url, dataTranslator, drawer);

	},
	reload: function() {
		
	} 
};

// function getCsvFromUrl(url) {
// 	var csv = undefined;

// 	$.ajax({
// 		url: url,
// 		type: "GET",
// 		chache: false,
// 		success: function(res) {
// 			var content = $(res.responseText).text();
// 			csv = trim(content);
// 		}
// 	});

// 	return csv;
// }


function constructWattGraph(url, dataTranslator, drawer) {
	$.ajax({
		url: url,
		type:"GET",
		chache: false,
		success: function(res){
			var content = $(res.responseText).text();
			var dataset = dataTranslator(content);
			drawer(dataset);
		}
	});
};


function text2dataset(text){
	/*
	データ
	謎空白 y/m/d h:m:s, #n#, value y/m/d.... LFLF
	こういう変に空白を混ぜやがったデータを整形してdatasetにする
	*/

	// 先頭末尾のスペースとLF文字を削除
	var lf = String.fromCharCode(10);
	var trimedText = text.replace(/^(\s|lf)+|(\s|lf)+$/g, "");
	// カンマ,スペースで分割　["y/m/d", "h:m:s", "#n#", "value", ...]
	textList = trimedText.split(/\s*\,\s*|\s/);
	// 時刻の部分だけ取り出す　["h:m:s", "h:m:s", ...]
	timeList = _.filter(textList, function(d, i) { return i % 4 == 1});
	// watt値のところだけ取り出す　[value0, value1, ...]
	wattList = _.map(_.filter(textList, function(d, i) { return i % 4 == 3}), 
		function(d) { return parseInt(d)});
	// 時刻とwattのリストをZip [["h:m:s", value0], ["h:m:s", value1], ...]
	timeWattList = _.zip(timeList, wattList);
	// make_graphが読める形式に変換　[{no: 0, time: "h:m:s", watt: value0}, ...]
	dataset = _.map(timeWattList, function(d, i) { 
		return {no: i, time: d[0], watt: _.isNumber(d[1]) ? d[1] : 0 };
	});
	return dataset;
}

function drawWattGraph(dataset){
	wattList = _.map(dataset, function(d) { return d.watt })
	timeList = _.map(dataset, function(d) { return d.time })
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
