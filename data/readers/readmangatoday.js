if (typeof CMREADER == 'undefined' || CMREADER == null) {
	CMREADER = {};
	CMREADER.options = {};
}
CMREADER.options.siteName = "Readmangatoday";

CMREADER.StripImageFromDOM = function StripImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var comicPage = DOMData.querySelector(".content .content-list>img");

	if (comicPage) {
		return comicPage.src;
	} else {
		//console.log(DOMData);
		//console.log(" = = = BREATHER = = = ");
		//console.log(comicPage);
	}

	return self.options.error404;
};

CMREADER.LoadImageAtPage = function LoadImageAtPage(pageNumber) {
	pageNumber = parseInt(pageNumber);

	if (CMREADER.options.pageSources[pageNumber]) {
		CMREADER.PageLoaded(pageNumber);
		//console.log("Pomf: " + pageNumber + " twist: " + CMREADER.options.pageSources[pageNumber]);
		if (CMREADER.options.getRequests && CMREADER.options.getRequests.length > 0) {
			var next = CMREADER.options.getRequests[0];
			CMREADER.options.getRequests.splice(0, 1);

			//console.log("NEXT");
			CMREADER.LoadImageAtPage(next);
		}

		return;
	}

	var request = new XMLHttpRequest;
	var pageUrl = CMREADER.options.chapterURL + "/" + (pageNumber + 1);

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

CMREADER.PrepareLayout = function PrepareLayout() {
	var wrapper;

	var container = document.querySelector("body>.content>.container-fixed");
	container.className = "clearfix";

	var ads = document.getElementsByClassName("chapter_right_160x600");
	if (ads && ads.length > 0) {
		ads[0].remove();
	}
	ads = document.getElementsByClassName("chapter_left_160x600");
	if (ads && ads.length > 0) {
		ads[0].remove();
	}
	ads = document.querySelectorAll("center");
	var count = ads.length;
	while (count--) {
		ads[count].remove();
	}

	var content = document.querySelectorAll(".content .content-list");
	if (content.length > 1) {
		if (content[0].children.length == 0) {
			wrapper = content[1];
			content[0].remove();
		} else {
			wrapper = content[0];
			content[1].remove();
		}
	} else {
		wrapper = content[0];
	}

	if (wrapper) {
		if (CMREADER.options.bAllPages) {
			var pages = wrapper.getElementsByTagName("img");
			for (var i = 0; i < pages.length; i++) {
				CMREADER.options.pageSources[i] = pages[i].src;
			}
		}

		wrapper.innerHTML = "";
		wrapper.removeAttribute('style');
	} else {
		throw new Error("Wrapper not found.");
	}

	var chapterBars = container.querySelectorAll(".col-md-12.col-top");
	count = chapterBars.length;
	while (count--) {
		chapterBars[count].style.display = 'none';
	}

	var classClear = container.querySelectorAll(".col-md-12,.row");
	count = classClear.length;
	while (count--) {
		classClear[count].className = '';
	}

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "$(document).unbind();";
	document.body.appendChild(myScript);

	CMREADER.PrepareLayoutPages(wrapper);
};

CMREADER.GetMangaCover = function GetMangaCover() {
	var list = document.querySelector(".content select.jump-menu");

	if (!list) {
		CMREADER.options.mangaURL = '';
		return;
	}

	CMREADER.options.mangaURL = list.options[0].value;

	var request = new XMLHttpRequest;

	request.open("GET", CMREADER.options.mangaURL, true);
	request.responseType = "document";

	//console.log("- REQUESTING MANGA COVER -");

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (request.response) {
				//var re = /(.*\.today\/uploads\/posters\/.*)/i;
				//var result;

				var img = request.response.querySelector('.movie-meta .panel-body img');

				CMREADER.options.mangaCoverSRC = img.src;
			}
		}
	};

	request.send(null);
};

CMREADER.GetListOfChapters = function GetListOfChapters() {
	var list = document.querySelector(".content select.jump-menu");

	if (!list) {
		CMREADER.options.chapters = new Array();
		return;
	}

	var options = list.options;
	var count = options.length;
	var listOfChapters = new Array();
	var listOfChapterNames = new Array();
	var chN;

	while(count--) {
		if (count == 0) {
			continue;
		}

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
	if (CMREADER.options.bAllPages) {
		var pages = document.querySelectorAll(".page_chapter>img");

		if (pages) {
			CMREADER.options.numberOfPages = pages.length;
			return;
		}
	} else {

		var pageSelect = document.querySelector("ul select.jump-menu");

		if (pageSelect) {
			CMREADER.options.numberOfPages = pageSelect.length;
			return;
		}
	}

	throw new Error("Pages not found.");
};

CMREADER.GetMangaName = function GetMangaName() {
	var re = /(^.*?)\s\d*?\.*?\d*?\s\-\sRead/;
	var name = re.exec(document.title);

	if (name) {
		CMREADER.options.mangaName = name[1];
	} else {
		CMREADER.options.mangaName = "Get Name Error";
	}
};

CMREADER.GetChapterURL = function GetChapterURL() {
	var link = window.content.location.href;

	if (link.indexOf("/all-pages") > -1) {
		CMREADER.options.bAllPages = true;
	} else {
		CMREADER.options.bAllPages = false;
	}

	CMREADER.options.chapterURL = window.content.location.href.replace("/all-pages", '');
	CMREADER.options.chapterURL = CMREADER.options.chapterURL.replace(/(\/\d*?)\/\d*?$/, '$1');
};

self.port.on("StartMain", CMREADER.Main);