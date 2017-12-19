if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	CMUPDATER = {};
	CMUPDATER.batoto = {};
}

CMUPDATER.batoto.RequestUpdate = function WaitForReaderData() {
	//console.log("batoto wait for reader data");

	let readerDOM = document.getElementById("reader");

	if (!readerDOM || readerDOM.textContent.indexOf("ERROR [") >= 0) {
		CERTAINMANGA.UpdateMangaResponse();
		return;
	}

	// create an observer instance
	let observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.addedNodes && mutation.addedNodes.length > 0) {
				if ( CMUPDATER.chapterListLoadingTimeOut ) {
					clearTimeout(CMUPDATER.chapterListLoadingTimeOut);
					CMUPDATER.chapterListLoadingTimeOut = null;
				}

				observer.disconnect();
				CMUPDATER.FinishedReaderData();
				return;
			}

			if ( CMUPDATER.chapterListLoadingTimeOut ) {
				clearTimeout(CMUPDATER.chapterListLoadingTimeOut);
			}

			CMUPDATER.chapterListLoadingTimeOut = setTimeout(function() {
				observer.disconnect();
				CMUPDATER.chapterListLoadingTimeOut = null;
				CMUPDATER.FinishedReaderData();
			}, 300);
		});
	});

	// pass in the target node, as well as the observer options
	observer.observe(readerDOM, {childList: true});
};

CMUPDATER.batoto.FinishedReaderData = function FinishedReaderData() {
	//console.log("batoto finished reader data");

	let readerDOM = document.getElementById("reader");

	if (!readerDOM || readerDOM.textContent.indexOf("ERROR [") >= 0) {
		CERTAINMANGA.UpdateMangaResponse();
		return;
	}

	let list = document.getElementsByName("chapter_select");

	if (!list || list.length === 0) {
		CMREADER.options.chapters = [];
		CERTAINMANGA.UpdateMangaResponse();
		return;
	}

	list = list[0];

	let options = list.options;
	let count = options.length;
	let listOfChapters = [];
	let listOfChapterNames = [];
	let chN;

	while(count--) {
		chN = {
			name: list.options[count].textContent.trim(),
			url: list.options[count].value
		};

		listOfChapters.push(chN);
		listOfChapterNames.push(chN.name);
	}

	CERTAINMANGA.UpdateMangaResponse(listOfChapters, self.options);
};