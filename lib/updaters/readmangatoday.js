//var Request = require("sdk/request").Request;
var {XMLHttpRequest} = window.XMLHttpRequest;
var HtmlHelper = require("../html_helper");

if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	CMUPDATER = {};
}

CMUPDATER.GetListOfChapters = function GetListOfChapters(domText) {
	var re = /(<.*?select.*?name="chapter_list"(\S|\s)*?<\/select>)/mi;
	var m;

	m = re.exec(domText);
	if(m && m[0]) {
		var str = m[0];
		var listOfChapters = new Array();
		var chN;

		re = /<\s*?option.*?value="([^"]*)"\s*.*?>(.*?)\s*</gim;

		while ((m = re.exec(str)) != null) {
			if (m.index === re.lastIndex) {
				re.lastIndex++;
			}

			chN = {
				name: HtmlHelper.EntityToHTML(m[2]).trim(),
				url: m[1]
			};

			listOfChapters.push(chN);
		}

		listOfChapters.splice(0, 1);

		listOfChapters.reverse();

		return listOfChapters;
	} else {
		return false;
	}
};

CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	var url = mangaData.chapters[0].url;
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
		callBackFnc();
		return;
	};

	request.ontimeout = function() {
		callBackFnc();
		return;
	};

	request.send(null);
};

exports.RequestUpdate = CMUPDATER.RequestUpdate;
