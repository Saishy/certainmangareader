if (typeof CMUPDATER == 'undefined' || CMUPDATER == null) {
	var CMUPDATER = {};
}

CMUPDATER.readmangatoday = {};

CMUPDATER.readmangatoday.GetListOfChapters = function GetListOfChapters(domHTML) {
	let list = domHTML.querySelector(".content select.jump-menu");

	if (!list) {
		return false;
	}

	let count = list.options.length;
	let listOfChapters = [];
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
	}

	return listOfChapters;
};

CMUPDATER.readmangatoday.DecreasePageNumber = function DecreasePageNumber(mangaData, pageNumber) {
	pageNumber--;
	if (pageNumber <= 0) {
		return 0;
	}

	if (mangaData.chapters.length - pageNumber + 1 > 5) {
		return 0;
	}

	return pageNumber;
};

CMUPDATER.readmangatoday.FetchDOMFromChapter = function FetchDOMFromChapter(mangaData, pageNumber, callBackFnc) {
	const url = mangaData.chapters[pageNumber].url;

	fetch(url, {
		method: 'GET',
		credentials: 'include',
		cache: "no-cache"
	})
		.then((response) => {
			if (response.ok) {
				return response.text();
			}
			throw new Error('Network response was not ok.');
		})
		.then(text => {
			const parser = new DOMParser();
			const htmlDocument = parser.parseFromString(text, "text/html");

			if (htmlDocument.querySelector(".panel.panel-primary") != null) {
				pageNumber = CMUPDATER.readmangatoday.DecreasePageNumber(mangaData, pageNumber);
				CMUPDATER.readmangatoday.FetchDOMFromChapter(mangaData, pageNumber, callBackFnc);
				return;
			}

			let chapters = CMUPDATER.readmangatoday.GetListOfChapters(htmlDocument);

			if (chapters !== false) {
				callBackFnc(chapters, mangaData);
			} else {
				console.error("CMUPDATER.readmangatoday::FetchDOMFromChapter chapters is null");
				callBackFnc();
			}
		})
		.catch(function(error) {
			console.error("CMUPDATER.readmangatoday::FetchDOMFromChapter error: " + error);

			if (pageNumber != 0) {
				pageNumber = CMUPDATER.readmangatoday.DecreasePageNumber(mangaData, pageNumber);
				CMUPDATER.readmangatoday.FetchDOMFromChapter(mangaData, pageNumber, callBackFnc);
				return;
			}
			callBackFnc();
		});
};

CMUPDATER.readmangatoday.RequestUpdate = function RequestUpdate(mangaData, callBackFnc) {
	CMUPDATER.readmangatoday.FetchDOMFromChapter(mangaData, mangaData.chapters.length - 1, callBackFnc);
};
