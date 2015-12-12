if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	CMUPDATER = {};
}

CMUPDATER.WaitForReaderData = function WaitForReaderData() {
	//console.log("batoto wait for reader data");

	var readerDOM = document.getElementById("reader");

	if (!readerDOM) {
		self.port.emit("UpdateMangaResponse");
		return;
	}

	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.addedNodes && mutation.addedNodes.length > 0) {
				observer.disconnect();
				CMUPDATER.FinishedReaderData();
			}
		});
	});

	// pass in the target node, as well as the observer options
	observer.observe(readerDOM, {childList: true});
};

CMUPDATER.FinishedReaderData = function FinishedReaderData() {
	//console.log("batoto finished reader data");

	var list = document.getElementsByName("chapter_select");

	if (!list) {
		CMREADER.options.chapters = new Array();
		self.port.emit("UpdateMangaResponse");
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

	self.port.emit("UpdateMangaResponse", listOfChapters, self.options);
};

//console.log("batoto updater");

CMUPDATER.WaitForReaderData();