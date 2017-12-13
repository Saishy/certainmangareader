if (typeof CMMENU == 'undefined' || CMMENU == null) {
	var CMMENU = {};
	CMMENU.filesRef = filesRef;
};

CMMENU.SendMessage = function SendMessage(messageType, messageParameter){
	browser.runtime.sendMessage({
		"type": messageType,
		"parameter": messageParameter}
	);
}

/* Receives an array with numbers and populates the select box at the menu */
CMMENU.SetChapterList = function SetChapterList(chapterList, currentChapter) {
	var selectBox = document.getElementById("CMangaSelect");

	var count = chapterList.length;
	var opt;
	while(count--) {
		opt = document.createElement("option");

		if (currentChapter == chapterList[count]) {
			opt.selected = true;
		}

		opt.value = chapterList[count];
		opt.text = /*"Ch " +*/ chapterList[count];

		selectBox.add(opt, null);
	}

	CMMENU.SetEvents();
};

CMMENU.SetHomeUrl = function SetHomeUrl(homeUrl) {
	CMREADER.homeUrl = homeUrl;

	document.getElementById("CMangaHomeLink").setAttribute("href", homeUrl);
};

CMMENU.AddToList = function AddToList(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		CMMENU.topMenu.classList.add("subscribed");
		CMREADER.AddToList();
	}
};

CMMENU.RemoveFromList = function RemoveFromList(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		CMREADER.RemoveFromList();
	}
};

/*CMMENU.GoHome = function GoHome(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		CMREADER.GoHome();
	}
};*/

CMMENU.GoBack = function GoBack(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		CMREADER.GoToChapter("back");
	}
};

CMMENU.GoNext = function GoNext(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		CMREADER.GoToChapter("next");
	}
};

CMMENU.GoToChapter = function GoToChapter(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		var selectBox = document.getElementById("CMangaSelect");

		CMREADER.GoToChapter(selectBox.options[selectBox.selectedIndex].value);
	}
};

CMMENU.SetCurrentChapter = function SetCurrentChapter(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		CMREADER.SetCurrentChapter();
	}
};

CMMENU.ToggleView = function ToggleView(event) {
	if (typeof CMREADER != 'undefined' && CMREADER != null) {
		var view = document.getElementById("CMangaView");
		var bToggle = view.classList.contains("Single");

		var result = CMREADER.SetView(bToggle);
		if (result) {
			view.className = "Double";
		} else {
			view.className = "Single";
		}
	}
};

CMMENU.ChangeInfiniteScrolling = function ChangeInfiniteScrolling(bInfinite) {
	if (bInfinite) {
		document.getElementById("CMangaView").style.display = "";
	} else {
		document.getElementById("CMangaView").style.display = "none";
	}
};

CMMENU.SetEvents = function AppendMenu() {
	/*CMMENU.topMenu.onmouseenter = function(event) {
		CMMENU.topMenu.style.top = "0";
	};

	CMMENU.topMenu.onmouseleave = function(event) {
		CMMENU.topMenu.style.top = "-20px";
	};*/

	if (CMMENU.options.bFirstTime) {
		CMMENU.topMenu.classList.add("BeginFlashMenu");
	} else {
		CMMENU.topMenu.style.top = "0";
	}

	var add = document.getElementById("CMangaAdd");
	add.onclick = CMMENU.AddToList;

	var remove = document.getElementById("CMangaRemove");
	remove.onclick = CMMENU.RemoveFromList;

	//var home = document.getElementById("CMangaHome");
	//home.onclick = CMMENU.GoHome;

	var back = document.getElementById("CMangaBack");
	back.onclick = CMMENU.GoBack;

	var next = document.getElementById("CMangaNext");
	next.onclick = CMMENU.GoNext;

	var selectBox = document.getElementById("CMangaSelect");
	selectBox.onchange = CMMENU.GoToChapter;

	var flag = document.getElementById("CMangaFlag");
	flag.onclick = CMMENU.SetCurrentChapter;

	var view = document.getElementById("CMangaView");
	view.onclick = CMMENU.ToggleView;

	if (selectBox.selectedIndex == 0) {
		next.style.visibility = "hidden";
		next.onclick = undefined;
	}
	if (selectBox.selectedIndex == selectBox.options.length - 1) {
		back.style.visibility = "hidden";
		back.onclick = undefined;
	}

	CMMENU.topMenu.onmouseleave = function() {
		CMMENU.topMenu.classList.remove("BeginFlashMenu");
		CMMENU.topMenu.style.top = "";
		CMMENU.topMenu.onmouseleave = undefined;
	};
	CMMENU.topMenu.style.display = "block";

	setTimeout(function() {
		if (CMMENU.options.bFirstTime) {
			CMMENU.topMenu.classList.remove("BeginFlashMenu");
		} else {
			CMMENU.topMenu.style.top = "";
		}
	}, CMMENU.options.bFirstTime ? 10000 : 4000);
};

CMMENU.WorkerUpdateSubscribed = function WorkerUpdateSubscribed(bWatch) {
	if (bWatch) {
		CMMENU.topMenu.classList.add("subscribed");
	} else {
		CMMENU.topMenu.classList.remove("subscribed");
	}
};

CMMENU.IsSubscribed = function IsSubscribed(bWatch) {
	if (bWatch) {
		CMMENU.topMenu.classList.add("subscribed");
		CMREADER.UpdateMangaInfo();
	} else {
		CMMENU.topMenu.classList.remove("subscribed");
	}
};

CMMENU.CreateMenu = function CreateMenu() {
	CMMENU.topMenu = document.createElement('div');
	CMMENU.topMenu.id = "CMangaTopMenu";
	CMMENU.topMenu.style.display = "none";

	//========

	var newDiv = document.createElement('div');
	newDiv.id = "CMangaAdd";

	var newImg = document.createElement('img');
	newImg.src = CMMENU.filesRef.addStar;
	newImg.setAttribute("title", "Add this manga to your list");
	newDiv.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('div');
	newDiv.id = "CMangaRemove";

	newImg = document.createElement('img');
	newImg.src = CMMENU.filesRef.removeStar;
	newImg.setAttribute("title", "Remove this manga from your list");
	newDiv.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('div');
	newDiv.id = "CMangaHome";

	var newDiv2 = document.createElement('a');
	newDiv2.id = "CMangaHomeLink";
	newDiv.appendChild(newDiv2);

	newImg = document.createElement('img');
	newImg.src = CMMENU.filesRef.home;
	newImg.setAttribute("title", "Go to the manga's main page");
	newDiv2.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('div');
	newDiv.id = "CMangaBack";

	newImg = document.createElement('img');
	newImg.src = CMMENU.filesRef.back;
	newImg.setAttribute("title", "Go to the previous chapter");
	newDiv.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('select');
	newDiv.id = "CMangaSelect";
	newDiv.setAttribute("name", "CMangaChapters");

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('div');
	newDiv.id = "CMangaNext";

	newImg = document.createElement('img');
	newImg.src = CMMENU.filesRef.next;
	newImg.setAttribute("title", "Go to the next chapter");
	newDiv.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('div');
	newDiv.id = "CMangaFlag";

	newImg = document.createElement('img');
	newImg.src = CMMENU.filesRef.flag;
	newImg.setAttribute("title", "Mark current chapter as latest read");
	newDiv.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	//=========

	newDiv = document.createElement('div');
	newDiv.id = "CMangaView";
	newDiv.className = "Single";

	newImg = document.createElement('img');
	newImg.className = "Single";
	newImg.src = CMMENU.filesRef.single;
	newImg.setAttribute("title", "View two pages side-by-side");
	newDiv.appendChild(newImg);

	newImg = document.createElement('img');
	newImg.className = "Double";
	newImg.src = CMMENU.filesRef.double;
	newImg.setAttribute("title", "View page per page in a vertical list");
	newDiv.appendChild(newImg);

	CMMENU.topMenu.appendChild(newDiv);

	/*var topMenu =
		'<div id="CMangaAdd"><img src="' + CMMENU.filesRef.addStar + '" title="Add this manga to your list"></div>' +
		'<div id="CMangaRemove"><img src="' + CMMENU.filesRef.removeStar + '" title="Remove this manga from your list"></div>' +
		'<div id="CMangaHome"><a id="CMangaHomeLink"><img src="' + CMMENU.filesRef.home + '" title="Go to the manga\'s main page"></a></div>' +
		'<div id="CMangaBack"><img src="' + CMMENU.filesRef.back + '" title="Go to the previous chapter"></div>' +
		'<select id="CMangaSelect" name="CMangaChapters"></select>' +
		'<div id="CMangaNext"><img src="' + CMMENU.filesRef.next + '" title="Go to the next chapter"></div>' +
		'<div id="CMangaFlag"><img src="' + CMMENU.filesRef.flag + '" title="Mark currently chapter as lastest read"></div>' +
		'<div id="CMangaView" class="Single"><img class="Single" src="' + CMMENU.filesRef.single + '" title="View two pages side-by-side"><img class="Double" src="' + CMMENU.filesRef.double + '" title="View page per page in a vertical list"></div>';
	*/

	/*var newDiv = document.createElement('div');
	newDiv.id = "CMangaTopMenu";
	newDiv.insertAdjacentHTML('afterbegin', topMenu);
	newDiv.style.display = "none";

	CMMENU.topMenu = newDiv;*/

	document.body.appendChild(CMMENU.topMenu);
};

CMMENU.ListenMessages = function ListenMessages(message){
	console.debug("ACMR (menu): Received a message");
	console.debug(message.type);
	switch (message.type) {
		case "IsSubscribed":
			CMMENU.IsSubscribed(message.parameter);
			break;
		case "WorkerUpdateSubscribed":
			CMMENU.WorkerUpdateSubscribed(message.parameter);
			break;
		case "ChangeInfiniteScrolling":
			CMREADER.ChangeInfiniteScrolling(message.parameter);
			break;
	}
}

CMMENU.Main = function Main(bFirstTime) {
	browser.runtime.onMessage.addListener(CMMENU.ListenMessages);

	CMMENU.options = {
		bFirstTime: bFirstTime
	};

	CMMENU.CreateMenu();
};

CMMENU.Main();
