if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	CMUPDATER = {};
}

CMUPDATER.batoto = {};

CMUPDATER.batoto.GetListOfChapters = function GetListOfChapters(domText) {
	var re = /(<.*?select.*?name="chapter_select"(\S|\s)*?<\/select>)/mi;
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

		listOfChapters.reverse();

		return listOfChapters;
	} else {
		return false;
	}
};

CMUPDATER.batoto.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
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
		//console.log("- BATOTO UPDATE ERROR -");
		callBackFnc();
		return;
	};

	request.ontimeout = function() {
		//console.log("- BATOTO UPDATE TIMEOUT -");
		callBackFnc();
		return;
	};

	request.send(null);
};

/*CMUPDATER.RequestUpdate = function RequestUpdate(mangaData, callBackFnc, tryInt) {
	var newReq = Request({
		url: url,
		onComplete: function (response) {
			if (!response || response.status != 200) {
				CMUPDATER.RequestUpdate(mangaData, callBackFnc, tryInt+1);
				return;
			}

			var chapters = CMUPDATER.GetListOfChapters(response.text);
			if (chapters === false) {
				CMUPDATER.RequestUpdate(mangaData, callBackFnc, tryInt+1);
			} else {
				callBackFnc(chapters, mangaData);
			}
		}
	});

	newReq.get();
};*/
