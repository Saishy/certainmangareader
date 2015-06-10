if (typeof CMREADER == 'undefined' || CMREADER == null) {
	CMREADER = {};
	CMREADER.options = {};
}
CMREADER.options.siteName = "Batoto";

CMREADER.StripImageFromDOM = function StripImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var comicPage = DOMData.getElementById("comic_page");

	if (comicPage) {
		return comicPage.src;
	} else {
		//console.log(DOMData);
		//console.log(" = = = BREATHER = = = ");
		//console.log(comicPage);
	}

	return self.options.error404;
	//return 'http://i44.tinypic.com/2csar8h.jpg';
};

CMREADER.LoadImageAtPage = function LoadImageAtPage(pageNumber) {
	var request = new XMLHttpRequest;
	var pageUrl = CMREADER.options.pureURL + "/" + (parseInt(pageNumber) + 1);
	//pageUrl = pageUrl.replace("http://", "");
	//pageUrl = pageUrl.replace("bato.to", "");

	request.open("GET", pageUrl, true);
	request.responseType = "document";
	request.timesFailed = 0;

	//console.log("- REQUESTING -");

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			//console.log(request.responseText);
			if (request.response) {
				CMREADER.options.pageSources[pageNumber] = CMREADER.StripImageFromDOM(request.response);
				CMREADER.PageLoaded(pageNumber);

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
			CMREADER.options.pageSources[pageNumber] = self.options.error404;//'http://i44.tinypic.com/2csar8h.jpg';
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

CMREADER.LoadAllImages = function LoadAllImages() {
	if (!CMREADER.options.templateImageURL) {
		CMREADER.options.getRequests = [];

		for(var x = 1; x < CMREADER.options.numberOfPages; x++) {
			CMREADER.options.getRequests.push(x);
		}

		CMREADER.LoadImageAtPage(0);

		return;
	}

	/*if (CMREADER.options.templateImageURL == undefined) {
		CMREADER.options.getRequests = [];

		for(var x = 1; x < CMREADER.options.numberOfPages; x++) {
			CMREADER.options.getRequests.push(x);
		}

		CMREADER.LoadImageAtPage(0);

		return;
	}

	CMREADER.options.pageImages = new Array(CMREADER.options.numberOfPages);

	//First we try to get all images by way of url guessing
	var count = CMREADER.options.numberOfPages;
	var str, number;

	for(var i = 0; i < count; i++) {
		number = "000000" + (i + 1);
		number = number.substr(number.length - 6);
		str = "img" + number + ".png";
		CMREADER.options.pageImages[i] = new Image();
		CMREADER.options.pageImages[i].pageNumber = i;
		CMREADER.options.pageImages[i].onload = CMREADER.PageLoadEvent;
		CMREADER.options.pageImages[i].onerror = CMREADER.PageErrorEvent;

		CMREADER.options.pageImages[i].src = CMREADER.options.templateImageURL + str;
	}*/
};

CMREADER.PrepareLayout = function PrepareLayout() {
	var wrapper = document.getElementById("comic_wrap");
	var newDiv, newImg;

	if (wrapper) {
		//Try to keep the ads in respect to the scanlators
		//GOD FUCKING DAMMIT PUT IDS IN YOUR ADS
		wrapper.innerHTML = "";
		wrapper.removeAttribute('style');

		var content = document.getElementById("content");
		if (content) {
			content.className = "hideContent";
		}
	} else {
		wrapper = document.getElementById("content");
		wrapper.className = "hideContent";

		newDiv = document.createElement('div');
		newDiv.id = "comic_wrap";
		wrapper.appendChild(newDiv);
		wrapper = newDiv;
	}

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "$(document).stopObserving();";
	document.body.appendChild(myScript);

	CMREADER.PrepareLayoutPages(wrapper);

	wrapper.appendChild(document.getElementById("footer_utilities"));
};

/*CMREADER.GetTemplateImageURL = function GetTemplateImageURL() {
	CMREADER.options.templateImageURL = false;

	var count = document.images.length;
	var re = /(.+img\.bato\.to\/comics\/.+\/)img/i;
	var m;

	while(count--) {
		m = re.exec(document.images[count].src);
		if (m && m[1]) {
			CMREADER.options.templateImageURL = m[1];

			return;
		}
	}
};*/

CMREADER.GetMangaCover = function GetMangaCover() {
	var re = /bato\.to(.*comic\/_\/comics\/.*)/i;
	var m, href;

	var container = document.getElementsByClassName('moderation_bar');
	if (container && container[0]) {
		container = container[0];
	} else {
		container = document;
	}

	var elems = container.getElementsByTagName('a');
	var count = elems.length;

	while(count--) {
		href = elems[count].getAttribute("href");
		if (href) {
			m = re.exec(href);
			if (m && m[1]) {
				CMREADER.options.mangaURL = "http://bato.to" + m[1];

				var request = new XMLHttpRequest;

				request.open("GET", CMREADER.options.mangaURL, true);
				request.responseType = "document";

				//console.log("- REQUESTING MANGA COVER -");

				request.onreadystatechange = function() {
					if (request.readyState == 4 && request.status == 200) {
						if (request.response) {
							var re = /(img\.batoto\.net\/forums\/uploads\/.*\..*)|(img\.bato\.to\/forums\/uploads\/.*\..*)/i;
							var result;

							var imgs = request.response.getElementsByTagName('img');
							var count = imgs.length;

							while(count--) {
								result = re.exec(imgs[count].src);
								if (result && result[0]) {
									CMREADER.options.mangaCoverSRC = "http://" + result[0];
									//console.log("- MANGA COVER GOT -");
									return;
								}
							}
						}
					}
				};

				request.send(null);
				break;
			}
		}
	}
};

CMREADER.GetListOfChapters = function GetListOfChapters() {
	var list = document.getElementsByName("chapter_select");

	if (!list) {
		CMREADER.options.chapters = new Array();
		return;
	}

	list = list[0];

	var options = list.options;
	var count = options.length;
	var listOfChapters = new Array();
	var listOfChapterNames = new Array();
	var chN;

	while(count--) {
		chN = {
			name: list.options[count].textContent.trim(),
			url: list.options[count].value
		};

		listOfChapters.push(chN);
		listOfChapterNames.push(chN.name);
	}

	CMREADER.options.chapters = listOfChapters;
	CMREADER.options.chapterNames = listOfChapterNames;
	CMREADER.options.chapterName = list.options[list.selectedIndex].textContent.trim();
};

CMREADER.GetNumberOfPages = function GetNumberOfPages() {
	var pageSelect = document.getElementById("page_select");

	if (pageSelect) {
		CMREADER.options.numberOfPages = pageSelect.length;
		return;
	}

	window.location.assign(CMREADER.options.pureURL + "?supress_webtoon=t");
};

CMREADER.GetMangaName = function GetMangaName() {
	var re = /(.+)\s-/;
	var name = re.exec(document.title);

	if (name) {
		CMREADER.options.mangaName = name[1];
	}
};

CMREADER.GetPureURL = function GetPureURL() {
	CMREADER.options.pureURL = window.content.location.href.replace(/(\/\d+$|\?.*)/, '');
	CMREADER.options.pureURL = CMREADER.options.pureURL.replace(/(\/\d*$)/, '');
};

self.port.on("StartMain", CMREADER.Main);