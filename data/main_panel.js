if (typeof CMMP == 'undefined' || CMMP == null) {
	CMMP = {};
	CMMP.options = {};
}

/**
 * @return {string}
 */
CMMP.TimeSince = function TimeSince(date) {
	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + " years";
	} else if (interval == 1) {
		return interval + " year";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months";
	} else if (interval == 1) {
		return interval + " month";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days";
	} else if (interval == 1) {
		return interval + " day";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours";
	} else if (interval == 1) {
		return interval + " hour";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes";
	} else if (interval == 1) {
		return interval + " minute";
	}
	return Math.floor(seconds) + " seconds";
	//return "a few moments";
};

// What is Udapte? A miserable pile of typos.

CMMP.UdapteUpdateManga = function UdapteUpdateManga(mangaData) {
	CMMP.UdapteUpdateMangaElement(mangaData);
};

/** Works with either insert or update operations */
CMMP.UdapteAddManga = function UdapteAddManga(mangaData) {
	CMMP.UdapteUpdateMangaElement(mangaData);
};

CMMP.UdapteRemoveManga = function UdapteAddManga(mangaData) {
	var mangaNameId = mangaData.name.replace(" ", "_");

	var mangaDiv = document.getElementById(mangaNameId + mangaData.site);
	if (mangaDiv) {
		mangaDiv.remove();
	}
};

CMMP.OpenMangaPage = function OpenMangaPage() {
	self.port.emit("OpenTab", this.dataset.mangaUrl);
};

CMMP.MangaSelector = function MangaSelector() {
	self.port.emit("OpenTab", this.options[this.selectedIndex].value);

	for (var i = 0; i < this.options.length; i++) {
		if (this.options[i].text === this.dataset.atChapter) {
			this.selectedIndex = i;
			break;
		}
	}
};

CMMP.ReadChapter = function ReadChapter() {
	var temp = this.parentNode;
	temp = temp.getElementsByClassName("CMangaSelector")[0];
	self.port.emit("OpenTab", temp.options[temp.selectedIndex].value);
};

CMMP.MarkAsRead = function MarkAsRead() {
	var temp = this.parentNode;
	var mangaData = {};

	mangaData.name = this.dataset.mangaName;
	mangaData.site = this.dataset.mangaSite;
	mangaData.atChapter = temp.getElementsByClassName("CMangaSelector")[0].options[0].textContent;

	self.port.emit("MarkAsRead", mangaData);
};

CMMP.Remove = function Remove() {
	var mangaData = {};

	mangaData.name = this.dataset.mangaName;
	mangaData.site = this.dataset.mangaSite;

	self.port.emit("Remove", mangaData);
};

CMMP.UdapteUpdateMangaElement = function UdapteUpdateMangaElement(mangaData, bReturn) {
	var mangaNameId, originalDiv, bFullRead;

	var mangaDiv, lineDiv, tempElem, tempElem2, optionDiv;

	var now = Date.now();

	bFullRead = true;
	mangaNameId = mangaData.name.replace(" ", "_") + mangaData.site;
	originalDiv = document.getElementById(mangaNameId);

	mangaDiv = document.createElement('div');
	mangaDiv.id = mangaNameId;
	mangaDiv.className = "CMangaList";

	tempElem = document.createElement('div');
	tempElem.className = 'CMangaCover';
	var mangaCoverSrc = mangaData.coverSrc === 'null' ? self.options.modOpt[mangaData.site.toLowerCase() + "Cover"] : mangaData.coverSrc;
	tempElem.style.backgroundImage = 'url("' + mangaCoverSrc + '")';

	mangaDiv.appendChild(tempElem);

	lineDiv = document.createElement('div');
	lineDiv.className = 'CMangaLine';

	tempElem = document.createElement('div');
	tempElem.className = 'CMangaName CMangaNameLink';
	if (now - mangaData.lastUpdatedAt <= 10000) {
		tempElem.className += ' CMangaJustUpdated';
	}
	tempElem.textContent = mangaData.name;
	tempElem.dataset.mangaUrl = mangaData.mangaURL;

	tempElem2 = document.createElement('div');
	tempElem2.className = 'CMangaNameBg';

	tempElem.appendChild(tempElem2);
	lineDiv.appendChild(tempElem);

	/*tempElem = document.createElement('div');
	 tempElem.className = 'CMangaSite ' + mangaData.site;
	 tempElem.textContent = mangaData.site;

	 lineDiv.appendChild(tempElem);*/

	tempElem = document.createElement('div');
	tempElem.className = 'CMangaText';
	tempElem.textContent = "Latest published: " + mangaData.chapters[mangaData.chapters.length - 1].name;

	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('div');
	tempElem.className = 'CMangaLabel';
	tempElem.textContent = "Chapter List:";

	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('select');
	tempElem.className = 'CMangaSelector';
	tempElem.dataset.atChapter = mangaData.atChapter;

	var countX = mangaData.chapters.length;
	var maxLength = countX - 1;
	while(countX--) {
		optionDiv = document.createElement('option');
		optionDiv.value = mangaData.chapters[countX].url;
		optionDiv.textContent = mangaData.chapters[countX].name;

		tempElem.options[maxLength - countX] = optionDiv;

		if (mangaData.atChapter == mangaData.chapters[countX].name) {
			tempElem.selectedIndex = maxLength - countX;
		}
	}

	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('img');
	tempElem.className = 'CMangaReadChapter';
	tempElem.src = self.options.modOpt.play;
	tempElem.setAttribute("title", "Start reading");
	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('img');
	tempElem.className = 'CMangaMarkAsRead';
	tempElem.src = self.options.modOpt.mark;
	tempElem.setAttribute("title", "Mark it as read");
	tempElem.dataset.mangaName = mangaData.name;
	tempElem.dataset.mangaSite = mangaData.site;
	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('img');
	tempElem.className = 'CMangaRemove';
	tempElem.src = self.options.modOpt.remove;
	tempElem.setAttribute("title", "Remove from list");
	tempElem.dataset.mangaName = mangaData.name;
	tempElem.dataset.mangaSite = mangaData.site;
	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('div');
	tempElem.className = 'CMangaLastUpdateTime';
	tempElem.textContent = "Last updated " + CMMP.TimeSince(mangaData.lastUpdatedAt) + ' ago';
	tempElem.dataset.lastUpdatedAt = mangaData.lastUpdatedAt;
	lineDiv.appendChild(tempElem);

	tempElem = document.createElement('img');
	tempElem.src = self.options.modOpt[mangaData.site.toLowerCase()];
	tempElem.className = 'CMangaSiteIcon Icon-' + mangaData.site;
	tempElem.setAttribute("title", mangaData.site);
	lineDiv.appendChild(tempElem);

	mangaDiv.appendChild(lineDiv);

	if (!mangaData.bRead) {
		bFullRead = false;
	}

	if (bFullRead) {
		mangaDiv.className += " fullRead";
	} else {
		mangaDiv.className += " notRead";
	}

	if (!bReturn) {
		if (originalDiv) {
			//CMMP.options.mangaViewContainer.replaceChild(mangaDiv, originalDiv);
			originalDiv.remove();
			//CMMP.options.mangaViewContainer.insertBefore(mangaDiv, CMMP.options.mangaViewContainer.firstChild);
		}

		var bAdded = false;
		var count = 0;
		var limit = CMMP.options.mangaViewContainer.children.length;
		var lastIndexUnread = count;

		if (bFullRead) {
			while(count < limit && !CMMP.options.mangaViewContainer.children[count].classList.contains("fullRead")) {
				count++;
				lastIndexUnread = count;
			}
		}

		while(count < limit) {
			if (mangaNameId.toLowerCase() <= CMMP.options.mangaViewContainer.children[count].id.toLowerCase() || !bFullRead && CMMP.options.mangaViewContainer.children[count].classList.contains("fullRead")) {
				CMMP.options.mangaViewContainer.insertBefore(mangaDiv, CMMP.options.mangaViewContainer.children[count]);
				bAdded = true;
				break;
			}
			count++
		}

		if (!bAdded) {
			if (bFullRead) {
				CMMP.options.mangaViewContainer.appendChild(mangaDiv);
			} else {
				CMMP.options.mangaViewContainer.insertBefore(mangaDiv, CMMP.options.mangaViewContainer.children[lastIndexUnread]);
			}
		}

		CMMP.AddEvents(mangaDiv);
	} else {
		return mangaDiv;
	}
};

// SOFTWARE CHANGED SETTINGS ===========================================================================================


CMMP.ReceiveAddonStatus = function ReceiveAddonStatus(status) {
	document.getElementById("CMangaSwitch").checked = status;
};

CMMP.ReceiveNotificationStatus = function ReceiveNotificationStatus(status) {
	document.getElementById("CMangaNotifications").checked = status;
};

CMMP.ReceiveNetSave = function ReceiveNetSave(status) {
	document.getElementById("CMangaNetSave").checked = status;
};

CMMP.ReceiveDesign = function ReceiveDesign(status) {
	document.getElementById("CMangaCompact").checked = status;

	if (status) {
		CMMP.options.mangaViewContainer.classList.remove("CMangaBigLayout");
		CMMP.options.mangaViewContainer.classList.add("CMangaCompactLayout");
	} else {
		CMMP.options.mangaViewContainer.classList.remove("CMangaCompactLayout");
		CMMP.options.mangaViewContainer.classList.add("CMangaBigLayout");
		CMMP.UdapteLastUpdatedAt();
	}
};

CMMP.ReceiveShowPageNumber = function ReceiveShowPageNumber(status) {
	document.getElementById("CMangaPageCheck").checked = status;
};

CMMP.ReceiveInfiniteScrolling = function ReceiveInfiniteScrolling(status) {
	document.getElementById("CMangaInfinite").checked = status;
};

CMMP.ReceiveUpdateTime = function ReceiveUpdateTime(status) {
	document.getElementById("CMangaUpdateTime").value = status;

	if (document.getElementById("CMangaMaxUpdateTime").value <= status) {
		CMMP.ChangeUpdateTime();
	}
};

CMMP.ReceiveMaxUpdateTime = function ReceiveMaxUpdateTime(status) {
	document.getElementById("CMangaMaxUpdateTime").value = status;

	if (document.getElementById("CMangaUpdateTime").value >= status) {
		CMMP.ChangeUpdateTime();
	}
};

// USER CHANGED SETTINGS ===============================================================================================

CMMP.AddonOnOff = function AddonOnOff() {
	var temp = document.getElementById("CMangaSwitch").checked;

	self.port.emit("ChangeAddonStatus", temp);
};

CMMP.ToggleSettingsMenu = function ToggleSettingsMenu() {
	var setMenu = document.getElementById("CMangaSettingsMenu");
	if (setMenu.className == "") {
		setMenu.className = "hidden";
	} else {
		setMenu.className = "";
	}
};

CMMP.NotificationCheck = function NotificationCheck() {
	var temp = document.getElementById("CMangaNotifications").checked;

	self.port.emit("ChangeNotificationStatus", temp);
};

CMMP.CompactCheck = function CompactCheck() {
	var temp = document.getElementById("CMangaCompact").checked;

	if (temp) {
		CMMP.options.mangaViewContainer.classList.remove("CMangaBigLayout");
		CMMP.options.mangaViewContainer.classList.add("CMangaCompactLayout");
	} else {
		CMMP.options.mangaViewContainer.classList.remove("CMangaCompactLayout");
		CMMP.options.mangaViewContainer.classList.add("CMangaBigLayout");
		CMMP.UdapteLastUpdatedAt();
	}

	self.port.emit("ChangeDesign", temp);
};

CMMP.PageMarkerCheck = function PageMarkerCheck() {
	var temp = document.getElementById("CMangaPageCheck").checked;

	self.port.emit("ChangeShowPageNumber", temp);
};

CMMP.InfiniteCheck = function InfiniteCheck() {
	var temp = document.getElementById("CMangaInfinite").checked;

	self.port.emit("ChangeInfiniteScrolling", temp);
};

CMMP.NetSaveCheck = function NetSaveCheck() {
	var temp = document.getElementById("CMangaNetSave").checked;

	if (temp) {
		document.getElementById("CMangaMaxUpdateTimeContainer").className = "";
	} else {
		document.getElementById("CMangaMaxUpdateTimeContainer").className = "hidden";
	}

	self.port.emit("ChangeNetSave", temp);
};

CMMP.ChangeUpdateTime = function ChangeUpdateTime() {
	var temp = document.getElementById("CMangaUpdateTime");
	var temp2 = document.getElementById("CMangaMaxUpdateTime");

	while(parseInt(temp.options[temp.selectedIndex].value) >= parseInt(temp2.options[temp2.selectedIndex].value)) {
		temp2.selectedIndex++;
	}

	self.port.emit("ChangeUpdateTime", temp.options[temp.selectedIndex].value);
	self.port.emit("ChangeMaxUpdateTime", temp2.options[temp2.selectedIndex].value);
};

CMMP.ChangeMaxUpdateTime = function ChangeMaxUpdateTime() {
	var temp = document.getElementById("CMangaUpdateTime");
	var temp2 = document.getElementById("CMangaMaxUpdateTime");

	while(parseInt(temp.options[temp.selectedIndex].value) >= parseInt(temp2.options[temp2.selectedIndex].value)) {
		temp.selectedIndex--;
	}

	self.port.emit("ChangeUpdateTime", temp.options[temp.selectedIndex].value);
	self.port.emit("ChangeMaxUpdateTime", temp2.options[temp2.selectedIndex].value);
};

// INITIAL SETTINGS ====================================================================================================

CMMP.AddEvents = function AddEvents(domElem) {
	var container = document;

	if (domElem) {
		container = domElem;
	}

	var elems = container.getElementsByClassName('CMangaNameLink');
	var count = elems.length;
	while(count--) {
		elems[count].onclick = CMMP.OpenMangaPage;
	}

	elems = container.getElementsByClassName('CMangaSelector');
	count = elems.length;
	while(count--) {
		elems[count].onchange = CMMP.MangaSelector;
	}

	elems = container.getElementsByClassName('CMangaReadChapter');
	count = elems.length;
	while(count--) {
		elems[count].onclick = CMMP.ReadChapter;
	}

	elems = container.getElementsByClassName('CMangaMarkAsRead');
	count = elems.length;
	while(count--) {
		elems[count].onclick = CMMP.MarkAsRead;
	}

	elems = container.getElementsByClassName('CMangaRemove');
	count = elems.length;
	while(count--) {
		elems[count].onclick = CMMP.Remove;
	}
};

CMMP.PrepareLayout = function PrepareLayout(options) {
	CMMP.options.updateButton = document.getElementById("CMangaUpdateNow");
	CMMP.options.mangaViewContainer = document.getElementById('CMangaViewLayout');

	CMMP.options.bCompactDesign = options.bCompactDesign;
	if (options.bCompactDesign) {
		CMMP.options.mangaViewContainer.classList.add("CMangaCompactLayout");
	} else {
		CMMP.options.mangaViewContainer.classList.add("CMangaBigLayout");
	}

	var docFrag = document.createDocumentFragment();

	var count = 0;
	var limit = options.mangaList.length;
	//A first loop to add the unread mangas
	while(count < limit) {
		if (!options.mangaList[count].bRead) {
			docFrag.appendChild(CMMP.UdapteUpdateMangaElement(options.mangaList[count], true));
		}
		count++;
	}
	count = 0;
	//A second loop to add the read mangas
	while(count < limit) {
		if (options.mangaList[count].bRead) {
			docFrag.appendChild(CMMP.UdapteUpdateMangaElement(options.mangaList[count], true));
		}
		count++;
	}

	CMMP.options.mangaViewContainer.appendChild(docFrag);

	CMMP.AddEvents();

	var tempDiv = document.getElementById("CMangaSwitch");
	tempDiv.onchange = CMMP.AddonOnOff;

	tempDiv = document.getElementById("CMangaSettings");
	tempDiv.onclick = CMMP.ToggleSettingsMenu;

	tempDiv = document.getElementById("CMangaNotifications");
	tempDiv.onchange = CMMP.NotificationCheck;

	tempDiv = document.getElementById("CMangaCompact");
	tempDiv.onchange = CMMP.CompactCheck;

	tempDiv = document.getElementById("CMangaPageCheck");
	tempDiv.onchange = CMMP.PageMarkerCheck;

	tempDiv = document.getElementById("CMangaInfinite");
	tempDiv.onchange = CMMP.InfiniteCheck;

	tempDiv = document.getElementById("CMangaUpdateTime");
	tempDiv.onchange = CMMP.ChangeUpdateTime;

	tempDiv = document.getElementById("CMangaNetSave");
	tempDiv.onclick = CMMP.NetSaveCheck;

	tempDiv = document.getElementById("CMangaMaxUpdateTime");
	tempDiv.onchange = CMMP.ChangeMaxUpdateTime;

	CMMP.options.updateButton.onclick = CMMP.StartUpdating;

	tempDiv = document.getElementById("CMangaExportImport");
	tempDiv.onclick = CMMP.OpenExportImportTab;

	tempDiv = document.getElementById('CMangaIcon');
	tempDiv.onclick = function() {
		console.log(document.getElementById("CMangaContainer").outerHTML);
	};

	tempDiv = document.getElementById("easteregg");
	tempDiv.onclick = function() {
		self.port.emit("OpenTab", "http://myanimelist.net/anime/66/Azumanga_Daioh");
	};
};

CMMP.SetInitialConfig = function SetInitialConfig(options) {
	document.getElementById("CMangaSwitch").checked = options.bIsOn;

	document.getElementById("CMangaNotifications").checked = options.bIsOn;

	document.getElementById("CMangaCompact").checked = options.bCompactDesign;

	document.getElementById("CMangaPageCheck").checked = options.bShowPageNumbers;

	document.getElementById("CMangaInfinite").checked = options.bInfiniteScrolling;

	if (options.bNetworkSaving) {
		document.getElementById("CMangaNetSave").checked = true;
		document.getElementById("CMangaMaxUpdateTimeContainer").className = "";
	} else {
		document.getElementById("CMangaNetSave").checked = false;
		document.getElementById("CMangaMaxUpdateTimeContainer").className = "hidden";
	}

	var temp = document.getElementById("CMangaUpdateTime");
	var count = temp.options.length;
	while(count--) {
		if(temp.options[count].value == options.updateTime) {
			temp.selectedIndex = count;
			break;
		}
	}

	temp = document.getElementById("CMangaMaxUpdateTime");
	count = temp.options.length;
	while(count--) {
		if(temp.options[count].value == options.maxUpdateTime) {
			temp.selectedIndex = count;
			break;
		}
	}
};

CMMP.UdapteLastUpdatedAt = function UdapteLastUpdatedAt() {
	var divs = document.getElementsByClassName('CMangaLastUpdateTime');
	var count = divs.length;

	while(count--) {
		divs[count].textContent = "Last updated " + CMMP.TimeSince(divs[count].dataset.lastUpdatedAt) + ' ago';
	}
};

CMMP.OpenExportImportTab = function OpenExportImportTab() {
	self.port.emit("OpenExportImportTab");
};

CMMP.UpdateStatus = function UpdateStatus(status) {
	if (status == 0) {
		CMMP.options.updateButton.className = "ready";
	} else if (status == 1) {
		CMMP.options.updateButton.className = "updating";
	}
};

CMMP.StartUpdating = function StartUpdating() {
	self.port.emit("StartUpdating");
};


CMMP.Show = function Show() {
	if (!CMMP.options.bCompactDesign) {
		CMMP.UdapteLastUpdatedAt();
	}
};

CMMP.Hide = function Hide() {
	var updateElems = document.getElementsByClassName("CMangaJustUpdated");
	var x = updateElems.length;

	while(x--) {
		updateElems[x].classList.remove("CMangaJustUpdated");
	}
};

CMMP.Main = function Main() {
	CMMP.PrepareLayout(self.options.data);
	CMMP.SetInitialConfig(self.options.data);

	self.port.on("UdapteUpdateManga", CMMP.UdapteUpdateManga);
	self.port.on("UdapteAddManga", CMMP.UdapteAddManga);
	self.port.on("UdapteRemoveManga", CMMP.UdapteRemoveManga);

	self.port.on("ReceiveAddonStatus", CMMP.ReceiveAddonStatus);
	self.port.on("ReceiveDesign", CMMP.ReceiveDesign);
	self.port.on("ReceiveInfiniteScrolling", CMMP.ReceiveInfiniteScrolling);
	self.port.on("ReceiveMaxUpdateTime", CMMP.ReceiveMaxUpdateTime);
	self.port.on("ReceiveNetSave", CMMP.ReceiveNetSave);
	self.port.on("ReceiveNotificationStatus", CMMP.ReceiveNotificationStatus);
	self.port.on("ReceiveShowPageNumber", CMMP.ReceiveShowPageNumber);
	self.port.on("ReceiveUpdateTime", CMMP.ReceiveUpdateTime);

	self.port.on("UpdateStatus", CMMP.UpdateStatus);

	self.port.on("Show", CMMP.Show);
	self.port.on("Hide", CMMP.Hide);
};

CMMP.Main();