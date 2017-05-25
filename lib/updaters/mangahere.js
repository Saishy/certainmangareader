//var Request = require("sdk/request").Request;
var {XMLHttpRequest} = window.XMLHttpRequest;

if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	CMUPDATER = {};
}

CMUPDATER.GetListOfChapters = function GetListOfChapters(domText, mangaURL) {
	var re = /\(([\s|\S]*?)\)\;/mi;
	var m;

	m = re.exec(domText);
	if(m && m[1]) {
		//var listOfChapters = "[" + m[1] + "]";

		var atest = m[1].split(/[,\s\S]*?\["(.*?)","(.*?)"\][,\s\S]*?/);

		var returnlistOfChapters = [];

		var count = atest.length;
		for(var i = 1; i < count; i += 3) {
			returnlistOfChapters.push({
				name: atest[i].trim(),
				url: mangaURL + atest[i+1].substr(45)
			});
		}

		return returnlistOfChapters;
	} else {
		return false;
	}
};

CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	var url = "http://www.mangahere.co/get_chapters" + mangaData.sid + ".js?v=" + (new Date()).getTime();

	var request = new XMLHttpRequest();

	request.open("GET", url, true);
	request.timeout = 30000;

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status >= 200 && request.status < 300 && request.response) {
			try {
				var chapters = CMUPDATER.GetListOfChapters(request.response, mangaData.mangaURL);

				if (chapters !== false) {
					callBackFnc(chapters, mangaData);
				} else {
					callBackFnc();
				}
			} catch(e) {
				callBackFnc();
			}
		} else if (request.readyState == 4) {
			callBackFnc();
		}
	};

	request.onerror = function() {
		//console.log("- MANGAFOX UPDATE ERROR -");
		callBackFnc();
		return;
	};

	request.ontimeout = function() {
		//console.log("- MANGAFOX UPDATE TIMEOUT -");
		callBackFnc();
		return;
	};

	request.send(null);
};

exports.RequestUpdate = CMUPDATER.RequestUpdate;
