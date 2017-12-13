if (typeof CMREADER == 'undefined' || CMREADER == null) {
	var CMREADER = {};
	CMREADER.options = {};
}
CMREADER.options.siteName = "Mangafox";

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
				CMREADER.options.pageSources[pageNumber] = CMREADER.StripImageFromDOM(request.response).replace(/http:\/\/(.)/i, "http://a");
				CMREADER.PageLoaded(pageNumber);

				/*if (pageNumber == CMREADER.options.numberOfPages - 1) {
					return;
				}*/

				var secondImageSrc = CMREADER.StripSecondImageFromDOM(request.response);
				if (secondImageSrc !== false) {
					CMREADER.options.pageSources[pageNumber+1] = secondImageSrc.replace(/http:\/\/(.)/i, "http://a");
					CMREADER.PageLoaded(pageNumber+1);
				}

				if (CMREADER.options.getRequests && CMREADER.options.getRequests.length > 0) {
					var next = CMREADER.options.getRequests[0];
					CMREADER.options.getRequests.splice(0, 1);

					//console.log("NEXT: " + next);
					CMREADER.LoadImageAtPage(next);
				}/* else {
					var re = /(.*)(\d\d)\S*?(\.jpg|\.png)/i;
					var m;

					if (secondImageSrc !== false) {
						m = re.exec(secondImageSrc);
						var newCounter = parseInt(m[2]);
						if (m[2] == newCounter) {
							//CMREADER.options.currentLoadingPageNumberIncrease = newCounter - (pageNumber + 1);
							//CMREADER.options.currentLoadingPage = pageNumber + 2;
							CMREADER.LoadAllImages();
						} else {
							m = re.exec(CMREADER.options.pageSources[pageNumber]);
							if (m[2] == newCounter) {
								//CMREADER.options.currentLoadingPageNumberIncrease = newCounter - pageNumber;
								//CMREADER.options.currentLoadingPage = pageNumber + 1;
								CMREADER.LoadAllImages();
							}
						}
					} else {
						if (pageNumber < CMREADER.options.pages.length - 1) {
							CMREADER.LoadImageAtPage(pageNumber++);
						}
					}
				}*/
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
	CMREADER.GetSID();
	CMREADER.options.mangaCoverSRC = 'http://l.mfcdn.net/store/manga/' + CMREADER.options.sid + '/cover.jpg';
};

/*CMREADER.PageLoadEvent = function PageLoadEvent() {
	if (this.pageNumber !== undefined && this.pageNumber !== null) {
		if (this.width <= 1 || this.height <= 1) {
			this.onerror();
			return;
		}
		CMREADER.options.pageSources[this.pageNumber] = this.src;
		CMREADER.PageLoaded(this.pageNumber);

		//CMREADER.options.currentLoadingPage = this.pageNumber + 1;
		CMREADER.LoadAllImages();
	}
};

CMREADER.PageErrorEvent = function PageErrorEvent() {
	if (!this.bServerL) {
		this.bServerL = true;
		CMREADER.options.pageImages[this.pageNumber].src = CMREADER.options.pageImages[this.pageNumber].src.replace("z.mfcdn.net", "l.mfcdn.net");
	} else if (!this.bServerA) {
		this.bServerA = true;
		CMREADER.options.pageImages[this.pageNumber].src = CMREADER.options.pageImages[this.pageNumber].src.replace("l.mfcdn.net", "a.mfcdn.net");
	} else {
		if (!CMREADER.options.getRequests || CMREADER.options.getRequests.length == 0) {
			CMREADER.options.getRequests = [];
			CMREADER.LoadImageAtPage(this.pageNumber);
		} else {
			CMREADER.options.getRequests.push(this.pageNumber);
		}
	}
};*/

CMREADER.PageLoaded = function PageLoaded(pageNumber) {
	var count = CMREADER.options.getRequests.length;
	while(count--) {
		if (pageNumber == CMREADER.options.getRequests[count]) {
			CMREADER.options.getRequests.splice(count, 1);
			break;
		}
	}

	CMREADER.options.pages[pageNumber].img.onerror = function() {
		var re = /([achlz])\.mfcdn\.net/;
		var m = this.src.match(re);

		if (m == null || m.length < 2) {
			return;
		}

		switch(m[1]) {
			case 'a':
				this.src = this.src.replace("a.mfcdn.net", "c.mfcdn.net");
				break;
			case 'c':
				this.src = this.src.replace("c.mfcdn.net", "h.mfcdn.net");
				break;
			case 'h':
				this.src = this.src.replace("h.mfcdn.net", "l.mfcdn.net");
				break;
			case 'l':
				this.src = this.src.replace("l.mfcdn.net", "z.mfcdn.net");
				break;
			case 'z':
				break;
			default:
				break;
		}
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

	var ads = document.getElementById("ad_top");
	if (ads) {
		ads.remove();
	}
	ads = document.getElementsByClassName("ad");
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

	var re = /(.*mangafox.me\/manga\/.*?)\//i;
	CMREADER.options.mangaURL = re.exec(CMREADER.options.chapterURL)[1];
	CMREADER.options.chapters = new Array();
	CMREADER.options.chapterNames = new Array();

	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			CMREADER.options.chapters.push({
				name: mutation.addedNodes[0].textContent.trim(),
				url: CMREADER.options.mangaURL + '/' + mutation.addedNodes[0].value + '/1.html'
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
	var pageSelect = document.querySelector("select.m");
	var bComments = false;
	var options = pageSelect.options;
	var count = options.length;
	while(count--) {
		if (options[count].value == 0) {
			bComments = true;
		}
	}

	if (pageSelect) {
		if (bComments) {
			CMREADER.options.numberOfPages = pageSelect.length - 1;
		} else {
			CMREADER.options.numberOfPages = pageSelect.length;
		}
	}
};

CMREADER.GetMangaName = function GetMangaName() {
	var re = /(.*)\s\d+?/;
	var name = re.exec(document.querySelector("h1.no").textContent);

	if (name && name[1]) {
		CMREADER.options.mangaName = name[1];
	}
};

CMREADER.GetChapterURL = function GetChapterURL() {
	var re = /(\/\d*\..*)$/;
	var m = re.exec(window.content.location.href);
	if (!m || !m[0]) {
		window.location.assign('1.html');
		//throw new Error("Reloading the page...");
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
		//console.log(e.name);
		//console.log(e.message);
	}
};

//browser.runtime.onMessage.addListener("StartMain", CMREADER.Main);
CMREADER.Main();

