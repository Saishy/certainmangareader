if (typeof CMREADER == 'undefined' || CMREADER == null) {
	CMREADER = {};
	CMREADER.options = {};
}
CMREADER.options.siteName = "Mangastream";

CMREADER.StripImageFromDOM = function StripImageFromDOM(DOMData) {
	if (!DOMData) {
		return false;
	}

	var comicPage = DOMData.getElementById("manga-page");

	if (comicPage) {
		return comicPage.src;
	} else {
		//console.log(DOMData);
		//console.log(" = = = BREATHER = = = ");
		//console.log(comicPage);
	}

	return self.options.error404;//'http://i44.tinypic.com/2csar8h.jpg';
};

CMREADER.LoadImageAtPage = function LoadImageAtPage(pageNumber) {
	var request = new XMLHttpRequest;
	var pageUrl = CMREADER.options.pureURL + "/" + (parseInt(pageNumber) + 1);
	//pageUrl = pageUrl.replace("http://", "");
	//pageUrl = pageUrl.replace("readms.com", "");

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
};

CMREADER.PrepareLayout = function PrepareLayout() {
	var wrapper = document.querySelector(".row-fluid.page-wrap");
	var newDiv, newImg;

	if (wrapper) {
		//Try to keep the ads in respect to the scanlators
		//At least mangastream have ids in their ads thanks god, I will try to make "remove ads" an option instead of default
		wrapper.innerHTML = "";
		wrapper.removeAttribute('style');
	}

	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "$(window).unbind();";
	document.body.appendChild(myScript);
	document.onkeydown = null;

	var ads = document.getElementById("reader-leader");
	if (ads) {
		ads.remove();
	}
	ads = document.getElementById("reader-sky");
	if (ads) {
		ads.remove();
	}

	CMREADER.PrepareLayoutPages(wrapper);
};

CMREADER.GetMangaCover = function GetMangaCover() {
	CMREADER.options.mangaCoverSRC = 'null';
};

CMREADER.GetListOfChapters = function GetListOfChapters() {
	var list = document.querySelector(".controls .dropdown-menu");

	if (!list) {
		CMREADER.options.chapters = new Array();
		return;
	}

	var options = list.children;
	var count = options.length;

	while(count--) {
		if (options[count].classList.contains("divider")) {
			continue;
		}

		if (options[count].children[0].children.length == 0) {
			CMREADER.options.mangaURL = options[count].children[0].getAttribute("href").replace(/(\?.*)/, '');
			break;
		}
	}

	var request = new XMLHttpRequest;

	request.open("GET", CMREADER.options.mangaURL.replace("mangastream.com","readms.com"), true);
	request.responseType = "document";

	//console.log("- REQUESTING MANGA CHAPTERS FOR MANGA STREAM -");

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (request.response) {
				CMREADER.FinishedChapterList(request.response);
			}
		}
	};

	request.send(null);
};

CMREADER.GetNumberOfPages = function GetNumberOfPages() {
	var temp = document.querySelectorAll(".controls .btn.dropdown-toggle");

	if (!temp) {
		throw new Error("Could not get the number of pages");
		return;
	}

	temp = temp[1];

	if (temp) {
		temp = temp.nextElementSibling;
		temp = temp.children[temp.children.length - 1].children[0].getAttribute("href");

		if (temp) {
			var m = /\/(\d*$)/.exec(temp);
			if (m && m[1]) {
				CMREADER.options.numberOfPages = parseInt(m[1]);
			}
		}
	}
};

CMREADER.GetMangaName = function GetMangaName() {
	var name = document.querySelector(".btn.dropdown-toggle .visible-desktop.visible-tablet");

	if (name) {
		CMREADER.options.mangaName = name.textContent.trim();
	}
};

CMREADER.GetPureURL = function GetPureURL() {
	CMREADER.options.pureURL = window.content.location.href.replace(/(\?.*)/, '');
	CMREADER.options.pureURL = CMREADER.options.pureURL.replace(/(\/\d*$)/, '');
};

CMREADER.FinishedChapterList = function FinishedChapterList(domData) {
	var listOfChapters = new Array();
	var listOfChapterNames = new Array();
	var chN;

	var table = domData.querySelector("table.table").firstElementChild;
	var aElem;
	var i = table.children.length;
	while(i--) {
		aElem = table.children[i].getElementsByTagName('a')[0];
		if(aElem) {
			chN = {
				name: aElem.textContent.trim(),
				url: aElem.getAttribute("href").replace(/(\?.*)/, '')
			};

			listOfChapters.push(chN);
			listOfChapterNames.push(chN.name);
		}
	}

	CMREADER.options.chapters = listOfChapters;
	CMREADER.options.chapterNames = listOfChapterNames;
	var chapterNameDiv = document.querySelector(".controls .btn.dropdown-toggle");
	for each (var node in chapterNameDiv.childNodes) {
		if (node.data && node.data.trim()) {
			var chapterName = node.data.trim() + chapterNameDiv.children[1].textContent;
		}
	}
	CMREADER.options.chapterName = chapterName.trim();

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

self.port.on("StartMain", CMREADER.Main);