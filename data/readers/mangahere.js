if (typeof CMREADER == 'undefined' || CMREADER == null) {
	CMREADER = {};
	CMREADER.options = {};
}
CMREADER.options.siteName = "Mangahere";

CMREADER.StripSecondImageFromDOM = function StripSecondImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var count = DOMData.images.length;
	var re = /(.*)(\d\d)\S*?(\.jpg|\.png)/i;
	var m;

	while(count--) {
		if (DOMData.images[count].id != "image") {
			m = re.exec(DOMData.images[count].src);
			if (m && m[1]) {
				return DOMData.images[count].src;
			}
		}
	}

	return false;
};

CMREADER.StripImageFromDOM = function StripImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var comicPage = DOMData.getElementById("image");

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
	var request = new XMLHttpRequest;
	var pageUrl = CMREADER.options.chapterURL + "/" + (parseInt(pageNumber) + 1) + ".html";

	request.open("GET", pageUrl, true);
	request.responseType = "document";
	request.timesFailed = 0;

	//console.log("- REQUESTING: " + pageNumber);

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			//console.log(request.responseText);
			if (request.response) {
				CMREADER.options.pageSources[pageNumber] = CMREADER.StripImageFromDOM(request.response).replace(/http:\/\/(.)/i, "http://z");
				CMREADER.PageLoaded(pageNumber);

				/*if (pageNumber == CMREADER.options.numberOfPages - 1) {
					return;
				}*/

				var secondImageSrc = CMREADER.StripSecondImageFromDOM(request.response);
				if (secondImageSrc !== false) {
					CMREADER.options.pageSources[pageNumber+1] = secondImageSrc.replace(/http:\/\/(.)/i, "http://z");
					CMREADER.PageLoaded(pageNumber+1);
				}

				if (CMREADER.options.getRequests && CMREADER.options.getRequests.length > 0) {
					var next = CMREADER.options.getRequests[0];
					CMREADER.options.getRequests.splice(0, 1);

					//console.log("NEXT: " + next);
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

CMREADER.GetSID = function GetSID() {
	var image = document.getElementById("image");
	var re = /(.*)(\d\d)\S*?(\.jpg|\.png)/i;
	var m;

	m = re.exec(image.src);
	if (m && m[1]) {
		re = /.*\/manga\/([^\/]*)/i;
		m = re.exec(image.src);
		if (m && m[1]) {
			CMREADER.options.sid = m[1];
		}
	}
};

CMREADER.GetMangaCover = function GetMangaCover() {
	CMREADER.GetSID(); //http://a.mhcdn.net/store/manga/9816/cover.jpg
	CMREADER.options.mangaCoverSRC = 'http://a.mhcdn.net/store/manga/' + CMREADER.options.sid + '/cover.jpg';
};

CMREADER.PageLoaded = function PageLoaded(pageNumber) {
	var count = CMREADER.options.getRequests.length;
	while(count--) {
		if (pageNumber == CMREADER.options.getRequests[count]) {
			CMREADER.options.getRequests.splice(count, 1);
			break;
		}
	}

	CMREADER.options.pages[pageNumber].img.onerror = function() {
		this.onerror = function() {
			this.src = this.src.replace("a.mhcdn.net", "l.mhcdn.net");
		};
		this.src = this.src.replace("z.mhcdn.net", "a.mhcdn.net");
	};
	CMREADER.options.pages[pageNumber].img.src = CMREADER.options.pageSources[pageNumber];

	if (CMREADER.options.pagesLoaded == undefined) {
		CMREADER.options.pagesLoaded = 1;
	} else {
		CMREADER.options.pagesLoaded++;
	}

	if (CMREADER.options.pagesLoaded == CMREADER.options.pages.length) {
		CMREADER.LoadComplete();
	}
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
	var wrapper = document.getElementById("viewer");

	if (wrapper) {
		wrapper.innerHTML = "";
		wrapper.removeAttribute('style');
	}

	var ads = document.getElementsByClassName("clearfix mb10");
	var count = ads.length;
	while(count--) {
		ads[count].remove();
	}
	ads = document.getElementsByClassName("advimg72890");
	var count = ads.length;
	while(count--) {
		ads[count].remove();
	}

	CMREADER.PrepareLayoutPages(wrapper);
};

CMREADER.GetListOfChapters = function GetListOfChapters() {
	var list = document.getElementById("top_chapter_list");

	if (!list) {
		list = document.getElementById("bottom_chapter_list");
		if (!list) {
			CMREADER.options.chapters = new Array();
			return;
		}
	}

	var re = /(.*mangahere.co\/manga\/.*?)\//i;
	CMREADER.options.mangaURL = re.exec(CMREADER.options.chapterURL)[1];
	CMREADER.options.chapters = new Array();
	CMREADER.options.chapterNames = new Array();

	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			CMREADER.options.chapters.push({
				name: mutation.addedNodes[0].textContent.trim(),
				url: mutation.addedNodes[0].value
			});
			CMREADER.options.chapterNames.push(mutation.addedNodes[0].textContent.trim());
			//console.log(mutation.type);

			if ( CMREADER.chapterListLoadingTimeOut ) {
				clearTimeout(CMREADER.chapterListLoadingTimeOut);
			}

			CMREADER.chapterListLoadingTimeOut = setTimeout(function() {
				observer.disconnect();
				CMREADER.chapterListLoadingTimeOut = null;
				CMREADER.FinishedChapterList();
			}, 132);
		});
	});

	// pass in the target node, as well as the observer options
	observer.observe(list, {childList: true});
};

CMREADER.GetNumberOfPages = function GetNumberOfPages() {
	var pageSelect = document.querySelector("select.wid60");
	var bComments = false;

	if (pageSelect) {
		var options = pageSelect.options;
		var count = options.length;
		while(count--) {
			if (options[count].value == 0) {
				bComments = true;
			}
		}

		if (bComments) {
			CMREADER.options.numberOfPages = pageSelect.length - 1;
		} else {
			CMREADER.options.numberOfPages = pageSelect.length;
		}
	}
};

CMREADER.GetMangaName = function GetMangaName() {
	var name = document.querySelector("h2>a");

	if (name) {
		CMREADER.options.mangaName = name.textContent.replace(" Manga", '');
	}
};

CMREADER.GetChapterURL = function GetChapterURL() {
	var re = /(\/\d*\..*)$/;
	var m = re.exec(window.content.location.href);
	if (!m || !m[0]) {
		re = /manga\/.*?\/(.*?)\//i;
		m = re.exec(window.content.location.href);
		if (m && m[1]) {
			CMREADER.options.chapterURL = window.content.location.href;
		} else {
			throw new Error("Invalid href.");
		}
	} else {
		CMREADER.options.chapterURL = window.content.location.href.replace(re, '');
	}
};

CMREADER.FinishedChapterList = function FinishedChapterList() {
	var list = document.getElementById("top_chapter_list");

	if (!list) {
		list = document.getElementById("bottom_chapter_list");
	}
	CMREADER.options.chapterName = list.options[list.selectedIndex].textContent.trim();

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "$(document).unbind();";
	document.body.appendChild(myScript);

	CMREADER.LoadAllImages();

	if (typeof CMMENU != 'undefined' && CMMENU != null) {
		CMMENU.SetChapterList(CMREADER.options.chapterNames, CMREADER.options.chapterName);
		CMMENU.SetHomeUrl(CMREADER.options.mangaURL);
		CMREADER.CheckSubscription();
	}
};

CMREADER.Main = function Main() {
	try {
		CMREADER.InitOptions();
		CMREADER.PrepareLayout();
	} catch(e) {
		console.log(e.name);
		console.log(e.message);
	}
};

self.port.on("StartMain", CMREADER.Main);