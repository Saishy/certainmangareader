//var Request = require("sdk/request").Request;
var {XMLHttpRequest} = require("sdk/net/xhr");

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
		//listOfChapters = JSON.parse(listOfChapters);

		var returnlistOfChapters = [];

		var count = atest.length;
		for(var i = 1; i < count; i += 3) {
			returnlistOfChapters.push({
				name: atest[i],
				url: mangaURL + "/" + atest[i+1]
			});
		}

		/*var count = listOfChapters.length;
		for(var i = 0; i < count; i++) {
			returnlistOfChapters.push({
				name: listOfChapters[i][0],
				url: mangaURL + "/" + listOfChapters[i][1]
			});
		}*/

		return returnlistOfChapters;
	} else {
		return false;
	}
};

CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	var url = "http://mangafox.me/media/js/list." + mangaData.sid + ".js?" + (new Date()).getTime();

	var request = new XMLHttpRequest();

	request.open("GET", url, true);
	request.timeout = 30000;

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200 && request.response) {
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

/*CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {

	var url = "http://mangafox.me/media/js/list." + mangaData.sid + ".js?" + (new Date()).getTime();

	var newReq = Request({
		url: url,
		onComplete: function (response) {
			if (!response || response.status != 200) {
				callBackFnc();
				return;
			}

			var chapters = CMUPDATER.GetListOfChapters(response.text, mangaData.mangaURL);
			if (chapters !== false) {
				callBackFnc(chapters, mangaData);
			}
		}
	});

	newReq.get();
};*/

exports.RequestUpdate = CMUPDATER.RequestUpdate;