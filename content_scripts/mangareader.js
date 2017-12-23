CMREADER.options.siteName = "Mangareader";

CMREADER.StripSecondImageFromDOM = function StripSecondImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var prefetchimg = DOMData.getElementById("prefetchimg");
	if (prefetchimg) {
		var imgsrc = prefetchimg.style.backgroundImage;
	} else {
		return false;
	}

	if (!imgsrc || imgsrc == '') {
		//console.log("fail");
		return false;
	}

	return imgsrc.substring(5, imgsrc.length - 2);
};

CMREADER.StripImageFromDOM = function StripImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var comicPage = DOMData.getElementById("img");

	if (comicPage) {
		return comicPage.src;
	}

	return self.options.error404;
};

CMREADER.LoadImageAtPage = function LoadImageAtPage(pageNumber) {
	var request = new XMLHttpRequest;
	var pageUrl = CMREADER.options.chapterURL + "/" + (parseInt(pageNumber) + 1);

	request.open("GET", pageUrl, true);
	request.responseType = "document";
	request.timesFailed = 0;

	//console.log("- REQUESTING: " + pageNumber);

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			//console.log(request.responseText);
			if (request.response) {
				CMREADER.options.pageSources[pageNumber] = CMREADER.StripImageFromDOM(request.response);
				CMREADER.PageLoaded(pageNumber);

				var secondImageSrc = CMREADER.StripSecondImageFromDOM(request.response);
				if (secondImageSrc !== false) {
					CMREADER.options.pageSources[pageNumber+1] = secondImageSrc;
					CMREADER.PageLoaded(pageNumber+1);
				}

				if (CMREADER.options.getRequests && CMREADER.options.getRequests.length > 0) {
					var next = CMREADER.options.getRequests[0];
					CMREADER.options.getRequests.splice(0, 1);

					//console.log("NEXT");
					CMREADER.LoadImageAtPage(next);
				}
			}
		}
	};

	request.onerror = function() {
		request.timesFailed++;
		if (request.timesFailed < 2) {
			CMREADER.LoadImageAtPage(pageNumber);
		} else {
			CMREADER.options.pageSources[pageNumber] = self.options.error404;
			CMREADER.PageLoaded(pageNumber);

			if (CMREADER.options.getRequests && CMREADER.options.getRequests.length > 0) {
				var next = CMREADER.options.getRequests[0];
				CMREADER.options.getRequests.splice(0, 1);

				//console.log("NEXT");
				CMREADER.LoadImageAtPage(next);
			}
		}
	};

	request.send(null);
};

CMREADER.AddToList = function AddToList() {
	var mangaData = {
		name: CMREADER.options.mangaName,
		site: CMREADER.options.siteName,
		sid: CMREADER.options.sid,
		mangaURL: CMREADER.options.mangaURL,
		coverSrc: CMREADER.options.mangaCoverSRC,
		atChapter: CMREADER.options.chapterName,
		chapters: CMREADER.options.chapters,
		//chapters: [{"name": CMREADER.options.chapters[0].name, "url": CMREADER.options.chapters[0].url}],
		//currentURL: CMREADER.options.chapterURL,
		bRead: (CMREADER.options.chapterName == CMREADER.options.chapterNames[CMREADER.options.chapterNames.length - 1]),
		lastUpdatedAt: Date.now()
	};

	self.port.emit("AddToList", mangaData);
};

CMREADER.UpdateMangaInfo = function UpdateMangaInfo() {
	var mangaData = {
		name: CMREADER.options.mangaName,
		site: CMREADER.options.siteName,
		sid: CMREADER.options.sid,
		chapters: CMREADER.options.chapters,
		lastUpdatedAt: Date.now()
	};

	self.port.emit("UpdateMangaInfo", mangaData);
};

CMREADER.PrepareLayout = function PrepareLayout() {
	var wrapper = document.getElementsByClassName("episode-table");
	var blankDiv = document.createElement('div');

	if (wrapper && wrapper.length > 0) {
		wrapper = wrapper[0];
	} else {
		wrapper = false;
	}

	if (wrapper) {
		wrapper.parentNode.replaceChild(blankDiv, wrapper);
	}

	var ads = document.getElementById("adtop");
	if (ads) {
		ads.remove();
	}

	ads = document.getElementById("adfooter");
	if (ads) {
		ads.remove();
	}

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "document.onkeydown = undefined;";
	document.body.appendChild(myScript);

	CMREADER.PrepareLayoutPages(blankDiv);
};

window.addEventListener('message', function(event) {
	//console.log("Event origin: " + event.origin);

	if (event.origin != "http://www.mangareader.net") {
		return;
	}
	CMREADER.options.sid = parseInt(event.data);

	//console.log(CMREADER.options.sid);
}, false);

CMREADER.GetSID = function GetSID() {
	//CMREADER.options.sid = parseInt(unsafeWindow.document.mangaid);

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "window.postMessage(document.mangaid, 'http://www.mangareader.net');";
	document.body.appendChild(myScript);

	//console.log(CMREADER.options.sid);
};

CMREADER.GetMangaCover = function GetMangaCover() {
	CMREADER.GetSID();

	var link = document.querySelector('h2.c2>a');

	if (!link) {
		return;
	}

	link = link.getAttribute('href');

	CMREADER.options.mangaURL = "http://www.mangareader.net" + link;

	var request = new XMLHttpRequest;

	request.open("GET", CMREADER.options.mangaURL, true);
	request.responseType = "document";

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (request.response) {
				var img = request.response.querySelector('#mangaimg>img');
				if (img) {
					CMREADER.options.mangaCoverSRC = img.src;
				}
			}
		}
	};

	request.send(null);
};

CMREADER.GetListOfChapters = function GetListOfChapters() {
	var list = document.getElementById("chapterMenu");

	if (!list) {
		CMREADER.options.chapters = new Array();
		return;
	}

	CMREADER.options.chapters = new Array();
	CMREADER.options.chapterNames = new Array();

	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if ( CMREADER.chapterListLoadingTimeOut ) {
				clearTimeout(CMREADER.chapterListLoadingTimeOut);
			}

			CMREADER.chapterListLoadingTimeOut = setTimeout(function() {
				observer.disconnect();
				CMREADER.chapterListLoadingTimeOut = null;
				CMREADER.FinishedChapterList();
			}, 300);
		});
	});

	// pass in the target node, as well as the observer options
	observer.observe(list, {childList: true});
};

CMREADER.FinishedChapterList = function FinishedChapterList() {
	var list = document.getElementById("chapterMenu");

	var options = list.options;
	var count = options.length;
	var listOfChapters = new Array();
	var listOfChapterNames = new Array();
	var chN;

	//console.log("Reading chapters list");

	for (var i = 0; i < count; i++) {
		chN = {
			name: list.options[i].textContent.trim(),
			url: "http://www.mangareader.net" + list.options[i].value
		};

		listOfChapters.push(chN);
		listOfChapterNames.push(chN.name);
	}

	//console.log("Finished reading chapters list");

	CMREADER.options.chapters = listOfChapters;
	CMREADER.options.chapterNames = listOfChapterNames;
	CMREADER.options.chapterName = list.options[list.selectedIndex].textContent.trim();

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "$(document).unbind();";
	document.body.appendChild(myScript);

	var scripts = document.body.getElementsByTagName('script');
	var s = scripts.length;
	while (s--) {
		scripts[s].remove();
	}

	CMREADER.LoadAllImages();

	if (typeof CMMENU != 'undefined' && CMMENU != null) {
		CMMENU.SetChapterList(CMREADER.options.chapterNames, CMREADER.options.chapterName);
		CMMENU.SetHomeUrl(CMREADER.options.mangaURL);
		CMREADER.CheckSubscription();
	}
};

CMREADER.GetNumberOfPages = function GetNumberOfPages() {
	var pageSelect = document.getElementById("pageMenu");

	if (pageSelect) {
		CMREADER.options.numberOfPages = pageSelect.length;
		return;
	}
};

CMREADER.GetMangaName = function GetMangaName() {
	var link = document.querySelector('h2.c2>a');

	//console.log("Link is: " + link);

	var name = link.textContent.replace(" Manga", '');

	//console.log("Zelda is: " + link);

	CMREADER.options.mangaName = name;
};

CMREADER.GetChapterURL = function GetChapterURL() {
	if (document.getElementById('recom')) {
		throw new Error("Chapter not released.");
	}

	var re = /(.*?mangareader\.net\/.*?\/\d*)/i;

	var m = re.exec(window.content.location.href);

	CMREADER.options.chapterURL = m[1];
};

CMREADER.Main = function Main() {
	try {
		CMREADER.InitOptions();
		CMREADER.PrepareLayout();
	} catch(e) {
		//console.log(e.name);
		//console.log(e.message);
	}
};

CMREADER.Main();
