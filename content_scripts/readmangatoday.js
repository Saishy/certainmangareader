CMREADER.options.siteName = "Readmangatoday";

CMREADER.LoadImageAtPage = function LoadImageAtPage(pageNumber) {
	pageNumber = parseInt(pageNumber);

	if (CMREADER.options.pageSources[pageNumber]) {
		CMREADER.PageLoaded(pageNumber);
		//console.log("Pomf: " + pageNumber + " twist: " + CMREADER.options.pageSources[pageNumber]);
		if (CMREADER.options.getRequests && CMREADER.options.getRequests.length > 0) {
			let next = CMREADER.options.getRequests[0];
			CMREADER.options.getRequests.splice(0, 1); //Get requests start at 1, and the first one is called with 0 and not in the array

			//console.log("NEXT");
			CMREADER.LoadImageAtPage(next);
		}
	}
};

CMREADER.PrepareLayout = function PrepareLayout() {
	let wrapper;

	let container = document.querySelector("body>.content>.container-fixed");
	container.className = "clearfix";

	let ads = document.getElementsByClassName("chapter_right_160x600");
	if (ads && ads.length > 0) {
		ads[0].remove();
	}
	ads = document.getElementsByClassName("chapter_left_160x600");
	if (ads && ads.length > 0) {
		ads[0].remove();
	}
	ads = document.querySelectorAll("center");
	let count = ads.length;
	while (count--) {
		ads[count].remove();
	}

	let content = document.querySelectorAll(".content .content-list");
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
		let pages = wrapper.getElementsByTagName("img");
		for (let i = 0; i < pages.length; i++) {
			CMREADER.options.pageSources[i] = pages[i].src;
		}

		wrapper.innerHTML = "";
		wrapper.removeAttribute('style');
	} else {
		throw new Error("Wrapper not found.");
	}

	let chapterBars = container.querySelectorAll(".col-md-12.col-top");
	count = chapterBars.length;
	while (count--) {
		chapterBars[count].style.display = 'none';
	}

	let classClear = container.querySelectorAll(".col-md-12,.row");
	count = classClear.length;
	while (count--) {
		classClear[count].className = '';
	}

	let myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = "$(document).unbind();";
	document.body.appendChild(myScript);

	CMREADER.PrepareLayoutPages(wrapper);
};

CMREADER.GetMangaCover = function GetMangaCover() {
	let list = document.querySelector(".content select.jump-menu");

	if (!list) {
		CMREADER.options.mangaURL = '';
		return;
	}

	CMREADER.options.mangaURL = list.options[0].value;

	let request = new XMLHttpRequest;

	request.open("GET", CMREADER.options.mangaURL, true);
	request.responseType = "document";

	//console.log("- REQUESTING MANGA COVER -");

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (request.response) {
				//let re = /(.*\.today\/uploads\/posters\/.*)/i;
				//let result;

				let img = request.response.querySelector('.movie-meta .panel-body img');

				CMREADER.options.mangaCoverSRC = img.src;
			}
		}
	};

	request.send(null);
};

CMREADER.GetListOfChapters = function GetListOfChapters() {
	let list = document.querySelector(".content select.jump-menu");

	if (!list) {
		CMREADER.options.chapters = [];
		return;
	}

	let count = list.options.length;
	let listOfChapters = [];
	let listOfChapterNames = [];
	let chN;

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
	let pages = document.querySelectorAll(".page_chapter>img");

	if (pages) {
		CMREADER.options.numberOfPages = pages.length;
	}
};

CMREADER.GetMangaName = function GetMangaName() {
	let re = /(^.*?)\s\d*?\.*?\d*?\s-\sRead/;
	let name = re.exec(document.title);

	if (name) {
		CMREADER.options.mangaName = name[1];
	} else {
		CMREADER.options.mangaName = "Get Name Error";
	}
};

CMREADER.GetChapterURL = function GetChapterURL() {
	//let link = window.content.location.href;

	/*if (link.indexOf("/all-pages") === -1) {
		window.location.assign(link.replace(/\d*?$/i, "all-pages"));
	}*/

	//CMREADER.options.chapterURL = window.content.location.href.replace("/all-pages", '');
	//CMREADER.options.chapterURL = CMREADER.options.chapterURL.replace(/(\/\d*?)\/\d*?$/, '$1');
	CMREADER.options.chapterURL = window.content.location.href;
};

CMREADER.Main();
