if (typeof CMREADER == 'undefined' || CMREADER == null) {
	CMREADER = {};
	CMREADER.options = {};
}
CMREADER.options.siteName = "CMREADER";
/** If true, will reload after a location.assign() */
CMREADER.options.bShouldReload = false;

CMREADER.StripImageFromDOM = false;

CMREADER.LoadImageAtPage = false;

CMREADER.LoadAllImages = function LoadAllImages() {
	CMREADER.SetChapterButtons();

	CMREADER.options.getRequests = [];

	for(var x = 1; x < CMREADER.options.numberOfPages; x++) {
		CMREADER.options.getRequests.push(x);
	}

	CMREADER.LoadImageAtPage(0);

	return;
};

/*CMREADER.PageLoadEvent = function PageLoadEvent() {
	if (this.pageNumber !== undefined && this.pageNumber !== null) {
		CMREADER.options.pageSources[this.pageNumber] = this.src;
		CMREADER.PageLoaded(this.pageNumber);
	}
};

CMREADER.PageErrorEvent = function PageErrorEvent() {
	if (this.bTriedJPG) {
		if (!CMREADER.options.getRequests || CMREADER.options.getRequests.length == 0) {
			CMREADER.options.getRequests = [];
			CMREADER.LoadImageAtPage(this.pageNumber);
		} else {
			CMREADER.options.getRequests.push(this.pageNumber);
		}
	} else {
		this.bTriedJPG = true;
		CMREADER.options.pageImages[this.pageNumber].src = CMREADER.options.pageImages[this.pageNumber].src.replace(".png", ".jpg");
	}
};*/

CMREADER.LoadComplete = function LoadComplete() {
	CMREADER.options.bLoadComplete = true;

	if (CMREADER.options.bTwoColumnsView) {
		CMREADER.SetView(true);
	}
};

CMREADER.PageLoaded = function PageLoaded(pageNumber) {
	var count = CMREADER.options.getRequests.length;
	while(count--) {
		if (pageNumber == CMREADER.options.getRequests[count]) {
			CMREADER.options.getRequests.splice(count, 1);
			break;
		}
	}

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
		mangaURL: CMREADER.options.mangaURL,
		coverSrc: CMREADER.options.mangaCoverSRC,
		atChapter: CMREADER.options.chapterName,
		chapters: CMREADER.options.chapters,
		//chapters: [{"name": CMREADER.options.chapters[0].name, "url": CMREADER.options.chapters[0].url}],
		//currentURL: CMREADER.options.chapterURL,
		bRead: (CMREADER.options.chapterName == CMREADER.options.chapterNames[CMREADER.options.chapterNames.length - 1]),
		//bRead: true,
		lastUpdatedAt: Date.now()
	};

	self.port.emit("AddToList", mangaData);
};

CMREADER.UpdateMangaInfo = function UpdateMangaInfo() {
	var mangaData = {
		name: CMREADER.options.mangaName,
		site: CMREADER.options.siteName,
		chapters: CMREADER.options.chapters,
		lastUpdatedAt: Date.now()
	};

	self.port.emit("UpdateMangaInfo", mangaData);
};

CMREADER.SetCurrentChapter = function SetCurrentChapter() {
	var mangaData = {
		name: CMREADER.options.mangaName,
		site: CMREADER.options.siteName,
		atChapter: CMREADER.options.chapterName,
		bRead: (CMREADER.options.chapterName == CMREADER.options.chapterNames[CMREADER.options.chapterNames.length - 1])
	};

	self.port.emit("UpdateMangaInfo", mangaData);
};

CMREADER.RemoveFromList = function RemoveFromList() {
	var mangaData = {
		name: CMREADER.options.mangaName,
		site: CMREADER.options.siteName
	};

	self.port.emit("RemoveFromList", mangaData);
};

CMREADER.GoHome = function GoHome() {
	if (CMREADER.options.mangaURL) {
		window.location.assign(CMREADER.options.mangaURL);
	}
};

CMREADER.GetCurrentChapterNumberInArray = function GetCurrentChapterNumberInArray() {
	if (!CMREADER.options.chapters || CMREADER.options.chapters.length == 0) {
		return -1;
	}

	var count = CMREADER.options.chapters.length;
	while(count--) {
		if (CMREADER.options.chapters[count].name == CMREADER.options.chapterName) {
			return count;
		}
	}

	return -1;
};

CMREADER.GoToChapter = function GoToChapter(number) {
	if (!CMREADER.options.chapters || CMREADER.options.chapters.length == 0) {
		return;
	}

	var dest = CMREADER.options.chapterURL;
	var count;

	if (number == "back" || number == "next") {
		count = CMREADER.options.chapters.length;
		while(count--) {
			if (CMREADER.options.chapters[count].name == CMREADER.options.chapterName) {
				if (number == "back") {
					if (CMREADER.options.chapters[count - 1]) {
						dest = CMREADER.options.chapters[count - 1].url;
						break;
					}
				} else {
					if (CMREADER.options.chapters[count + 1]) {
						dest = CMREADER.options.chapters[count + 1].url;
						break;
					}
				}
			}
		}
	} else {
		count = CMREADER.options.chapters.length;

		while(count--) {
			if (CMREADER.options.chapters[count].name == number) {
				dest = CMREADER.options.chapters[count].url;
				break;
			}
		}
	}

	if (dest != CMREADER.options.chapterURL) {
		window.location.assign(dest);
		if (CMREADER.options.bShouldReload) {
			window.location.reload(true);
		}
	}
};

CMREADER.CheckSubscription = function CheckSubscription() {
	self.port.emit("CheckSubscription", {
		name: CMREADER.options.mangaName,
		site: CMREADER.options.siteName,
		atChapter: CMREADER.options.chapterName
	})
};

CMREADER.ResizeThrottler = function ResizeThrottler() {
	if (!CMREADER.options.bTwoColumnsView) {
		return;
	}
	// ignore resize events as long as an actualResizeHandler execution is in the queue
	if ( !CMREADER.resizeTimeout ) {
		CMREADER.resizeTimeout = setTimeout(function() {
			CMREADER.resizeTimeout = null;
			CMREADER.ActualResizeHandler();

			// The actualResizeHandler will execute at a rate of 10fps
		}, 99);
	}
};

CMREADER.ActualResizeHandler = function ActualResizeHandler() {
	// handle the resize event
	var pages = document.getElementsByClassName("pageSet");

	var maxWidth = pages[0].offsetWidth;

	var count = pages.length;
	var imgs, x, size;
	for(var i = 0; i < count; i++) {
		size = 0;
		imgs = pages[i].getElementsByTagName("img");
		x = imgs.length;
		while(x--) {
			size += imgs[x].clientWidth;
		}
		size += 4;
		if (size >= maxWidth && pages[i].classList.contains("inverted")) {
			pages[i].appendChild(pages[i].firstChild);
			pages[i].classList.remove("inverted");
		} else if (size < maxWidth && !pages[i].classList.contains("inverted")) {
			pages[i].appendChild(pages[i].firstChild);
			pages[i].classList.add("inverted");
		}
	}
};

CMREADER.InvertView = function InvertView(bTwoColumn) {
	var pages = document.getElementsByClassName("pageSet");

	var maxWidth = pages[0].offsetWidth;

	var count = pages.length;
	var imgs, x, size;
	for(var i = 0; i < count; i++) {
		if (bTwoColumn) {
			pages[i].classList.add("twoColumn");
		} else {
			pages[i].classList.remove("twoColumn");
		}

		size = 0;
		imgs = pages[i].getElementsByTagName("img");
		x = imgs.length;
		while(x--) {
			size += imgs[x].clientWidth;
		}
		size += 4;
		if (pages[i].classList.contains("inverted") && !bTwoColumn) {
			pages[i].appendChild(pages[i].firstChild);
			pages[i].classList.remove("inverted");
		} else if (size < maxWidth && !pages[i].classList.contains("inverted") && bTwoColumn) {
			pages[i].appendChild(pages[i].firstChild);
			pages[i].classList.add("inverted");
		}
	}
};

CMREADER.SetView = function SetView(bTwoColumn) {
	if (!CMREADER.options.bLoadComplete) {
		CMREADER.options.bTwoColumnsView = bTwoColumn;
		return bTwoColumn;
	}

	CMREADER.InvertView(bTwoColumn);

	return bTwoColumn;
};

CMREADER.GoToBackPage = function() {
	if (CMREADER.options.activePageNumber == 0) {
		CMREADER.GoToChapter("back");
		return;
	}

	CMREADER.SetActivePage(CMREADER.options.activePageNumber - 1);
};

CMREADER.GoToNextPage = function() {
	if (CMREADER.options.activePageNumber == CMREADER.options.numberOfPages - 1) {
		CMREADER.GoToChapter("next");
		return;
	}

	CMREADER.SetActivePage(CMREADER.options.activePageNumber + 1);
};

CMREADER.SetActivePage = function SetActivePage(pageNumber) {
	CMREADER.options.activePageNumber = pageNumber;

	var elems = document.getElementsByClassName("CMangaPageActive");
	var count = elems.length;
	while(count--) {
		elems[count].classList.remove("CMangaPageActive");
	}

	var page = document.getElementById("page" + (pageNumber + 1));
	if (!page) {
		return;
	}

	page.classList.add("CMangaPageActive");

	if (!CMREADER.options.pageControls) {
		CMREADER.options.pageControls = {
			container: document.createElement('div'),
			back: document.createElement('div'),
			next: document.createElement('div')
		}

		CMREADER.options.pageControls.container.id = "CMangaPageControls";

		CMREADER.options.pageControls.back.id = "CMangaPageControlBack";
		CMREADER.options.pageControls.back.onclick = CMREADER.GoToBackPage;
		CMREADER.options.pageControls.container.appendChild(CMREADER.options.pageControls.back);

		CMREADER.options.pageControls.next.id = "CMangaPageControlNext";
		CMREADER.options.pageControls.next.onclick = CMREADER.GoToNextPage;
		CMREADER.options.pageControls.container.appendChild(CMREADER.options.pageControls.next);
	}

	if (CMREADER.options.activePageNumber == CMREADER.options.numberOfPages - 1) {
		CMREADER.options.pageControls.next.className = "CMAtLastPage";
	} else {
		CMREADER.options.pageControls.next.className = '';
	}

	if (CMREADER.options.activePageNumber == 0) {
		CMREADER.options.pageControls.back.className = "CMAtFirstPage";
	} else {
		CMREADER.options.pageControls.back.className = '';
	}

	page.appendChild(CMREADER.options.pageControls.container);
};

CMREADER.ChangeInfiniteScrolling = function ChangeInfiniteScrolling(bInfinite) {
	if (!CMREADER.options.wrapper) {
		return;
	}
	if (bInfinite) {
		CMREADER.options.wrapper.classList.remove("CMangaPagePerPage");
	} else {
		CMREADER.options.wrapper.classList.add("CMangaPagePerPage");
		CMREADER.SetActivePage(0);
	}
};

CMREADER.ChangeShowPageNumber = function ChangeShowPageNumber(bShow) {
	if (!CMREADER.options.wrapper) {
		return;
	}
	if (bShow) {
		CMREADER.options.wrapper.classList.remove("pageMarkerDisabled");
	} else {
		CMREADER.options.wrapper.classList.add("pageMarkerDisabled");
	}
};

CMREADER.PrepareLayoutPages = function PrepareLayoutPages(wrapper) {
	CMREADER.options.wrapper = wrapper;

	wrapper.classList.add("CMangaWrapper");

	wrapper.classList.add("pageMarkerDisabled");

	/*if (!self.options.bShowPageNumbers) {
		wrapper.classList.add("pageMarkerDisabled");
	}*/

	var count = CMREADER.options.numberOfPages;
	var newDiv, newImg, pageMarker, pageSet;

	for(var i = 0; i < count; i++) {
		newDiv = document.createElement('div');
		newDiv.id = "page" + (i + 1);
		newDiv.className = "mangaPage";
		//newDiv.style.backgroundImage = "url('" + self.options.loadingIcon + "')";
		newDiv.style.background = "url('" + self.options.loadingIcon + "') center no-repeat";
		//newDiv.style.width = "100%";
		//newDiv.style.minHeight = "600px";

		if (i % 2 == 0) {
			pageSet = document.createElement('div');
			pageSet.className = "pageSet";
			pageSet.style.width = "100%";
			//pageSet.style.minHeight = "600px";
			pageSet.appendChild(newDiv);

			if (i == count -1) {
				wrapper.appendChild(pageSet);
			}
		} else {
			pageSet.appendChild(newDiv);
			wrapper.appendChild(pageSet);
		}

		newImg = document.createElement('img');
		newDiv.appendChild(newImg);

		pageMarker = document.createElement('div');
		pageMarker.className = "pageMarker";
		pageMarker.textContent = i + 1;
		newDiv.appendChild(pageMarker);

		CMREADER.options.pages[i] = {
			div: newDiv,
			img: newImg
		};
	}

	var chapterButtonsDiv = document.createElement('div');
	chapterButtonsDiv.id = "CMRChaptersButtons";

	var previousChapterDiv = document.createElement('a');
	previousChapterDiv.id = "CMRPreviousChapter";
	previousChapterDiv.textContent = "Previous Chapter";
	previousChapterDiv.style.visibility = 'hidden';
	/*previousChapterDiv.onclick = function() {
		CMREADER.GoToChapter("back");
	};*/

	var nextChapterDiv = document.createElement('a');
	nextChapterDiv.id = "CMRNextChapter";
	nextChapterDiv.textContent = "Next Chapter";
	nextChapterDiv.style.visibility = 'hidden';
	/*nextChapterDiv.onclick = function() {
		CMREADER.GoToChapter("next");
	};*/

	chapterButtonsDiv.appendChild(previousChapterDiv);
	chapterButtonsDiv.appendChild(nextChapterDiv);

	wrapper.appendChild(chapterButtonsDiv);
	//<div style="width: 100%;" id="CMRChaptersButtons"><div id="CMRPreviousChapter">Previous Chapter</div><div id="CMRNextChapter">Next Chapter</div></div>

	/*if (!self.options.bInfiniteScrolling) {
		wrapper.classList.add("CMangaPagePerPage");
		CMREADER.SetActivePage(0);
	}*/

	window.addEventListener("resize", CMREADER.ResizeThrottler, false);
};

CMREADER.PrepareLayout = false;

CMREADER.GetMangaCover = false;

CMREADER.GetListOfChapters = false;

CMREADER.SetChapterButtons = function SetChapterButtons() {
	if (CMREADER.options.chapters.length > 1) {
		for (var i = 0; i < CMREADER.options.chapters.length; i++) {
			if (CMREADER.options.chapterName == CMREADER.options.chapters[i].name) {
				break;
			}
		}

		if (i < CMREADER.options.chapters.length - 1) {
			var nextChapterTag = document.getElementById('CMRNextChapter');
			nextChapterTag.style.visibility = 'visible';
			nextChapterTag.setAttribute("href", CMREADER.options.chapters[i+1].url);
		}
		if (i > 0) {
			var previousChapterTag = document.getElementById('CMRPreviousChapter');
			previousChapterTag.style.visibility = 'visible';
			previousChapterTag.setAttribute("href", CMREADER.options.chapters[i-1].url);
		}
	}
};

CMREADER.GetNumberOfPages = false;

CMREADER.GetMangaName = false;

CMREADER.GetChapterURL = false;

CMREADER.InitOptions = function InitOptions() {
	CMREADER.GetChapterURL();
	CMREADER.GetMangaCover();
	CMREADER.GetNumberOfPages();
	CMREADER.GetMangaName();
	CMREADER.GetListOfChapters();

	CMREADER.options.pages = new Array(CMREADER.options.numberOfPages);
	CMREADER.options.pageSources = new Array(CMREADER.options.numberOfPages);
};

CMREADER.Main = function Main() {
	try {
		CMREADER.InitOptions();
		CMREADER.PrepareLayout();
		CMREADER.LoadAllImages();

		if (typeof CMMENU != 'undefined' && CMMENU != null) {
			CMMENU.SetChapterList(CMREADER.options.chapterNames, CMREADER.options.chapterName);
			CMMENU.SetHomeUrl(CMREADER.options.mangaURL);
			CMREADER.CheckSubscription();
		}
	} catch(e) {
		//console.log(e.name);
		//console.log(e.message);
	}
};

//self.port.on("StartMain", CMREADER.Main);
self.port.on("ChangeInfiniteScrolling", CMREADER.ChangeInfiniteScrolling);
self.port.on("ChangeShowPageNumber", CMREADER.ChangeShowPageNumber);