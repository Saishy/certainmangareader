if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	var CMUPDATER = {};
}

CMUPDATER.mangareader = {};

CMUPDATER.mangareader.GetListOfChapters = function GetListOfChapters(domText, mangaURL) {
	var jarray = JSON.parse(domText);

	if (jarray && jarray.length > 0) {
		var returnlistOfChapters = [];

		var count = jarray.length;
		for(var i = 0; i < count; i++) {
			returnlistOfChapters.push({
				name: ("Chapter " + jarray[i].chapter + ":" + (jarray[i].chapter_name != '' ? " " + jarray[i].chapter_name : '')).trim(),
				url: "http://www.mangareader.net" + jarray[i].chapterlink
			});
		}

		return returnlistOfChapters;
	} else {
		return false;
	}
};

CMUPDATER.mangareader.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	var url = "http://www.mangareader.net/actions/selector/?id=" + mangaData.sid + "&which=" + (new Date()).getTime();

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
