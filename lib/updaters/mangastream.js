//var Request = require("sdk/request").Request;
var {XMLHttpRequest} = require("sdk/net/xhr");
var HtmlHelper = require("../html_helper");

if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	CMUPDATER = {};
}

CMUPDATER.GetListOfChapters = function GetListOfChapters(domText) {
	var re = /<td><a href="(.*?)">(.*?)<\/a>/gim;
	var m;
	var listOfChapters = new Array();
	var chN;

	while ((m = re.exec(domText)) != null) {
		if (m.index === re.lastIndex) {
			re.lastIndex++;
		}

		chN = {
			name: HtmlHelper.EntityToHTML(m[2]).trim(),
			url: m[1].replace(/(\?.*)/, '')
		};

		listOfChapters.push(chN);
	}

	if (listOfChapters.length > 0) {
		listOfChapters.reverse();
		return listOfChapters;
	}

	return false;
};

CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	var url = mangaData.mangaURL;
	url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();

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
		//console.log("- MANGASTREAM UPDATE ERROR -");
		callBackFnc();
		return;
	};

	request.ontimeout = function() {
		//console.log("- MANGASTREAM UPDATE TIMEOUT -");
		callBackFnc();
		return;
	};

	request.send(null);
};

/*CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	var url = mangaData.mangaURL;
	url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();

	var newReq = Request({
		url: url,
		onComplete: function (response) {
			if (!response || response.status != 200) {
				callBackFnc();
				return;
			}

			var chapters = CMUPDATER.GetListOfChapters(response.text);
			if (chapters !== false) {
				callBackFnc(chapters, mangaData);
			}
		}
	});

	newReq.get();
};*/

exports.RequestUpdate = CMUPDATER.RequestUpdate;