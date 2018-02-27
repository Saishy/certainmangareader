/* TODO:
 * The updaters in updaters/ must be ported too!
 * * Figure out how to actually use this file (might require splitting?)
 */

//Addon essential requires
// var pageMod = require("sdk/page-mod");
// var simpleStorage = require("sdk/simple-storage");
// var { indexedDB } = require('sdk/indexed-db');
//
// //UI related requires
// var { ToggleButton } = require('sdk/ui/button/toggle');
// var panels = require("sdk/panel");
//
// //Update related requires
// var pageWorkers = require("sdk/page-worker");
// var timers = require("sdk/timers");
// var notifications = false;
// var batoto = false;
// var mangafox = false;
// var mangastream = false;
// var mangareader = false;
// var mangahere = false;
// var readmangatoday = false;

//http://bato.to/read/_/322387/he-is-a-high-school-girl_ch13_by_easy-going-scans?supress_webtoon=t
//http://bato.to/read/_/330252/ashita-mata-kono-sekai-de_v1_ch2_by_one-snowshoe?supress_webtoon=t
//This chapter and the next is having problems loading the first page

//Support mangacow?!

// Mandar o shimizu tomar no cu

// Bug
// Mudar o layout para página dupla, redimensionar a janela para não caber as duas páginas e mudar para página simples, faz as páginas inverterem a ordem

// Udaptes are the Update functions for the panel DOM

if (typeof CERTAINMANGA == 'undefined' || CERTAINMANGA == null) {
	var CERTAINMANGA = {};

	CERTAINMANGA.filesRef = filesRef;

	CERTAINMANGA.data = {};
	CERTAINMANGA.data.mangaList = [];

	CERTAINMANGA.bLoading = {
		options: false,
		mangas: false,
		startAddon: function() {
			if (CERTAINMANGA.bLoading.options && CERTAINMANGA.bLoading.mangas) {
				CERTAINMANGA.StartAddon();
			}
		}
	};

	CERTAINMANGA.bIsUpdating = false;
	CERTAINMANGA.updateTimer = false;
	CERTAINMANGA.currentlyUpdating = 0;
	CERTAINMANGA.NETSAVEINCREASEBY = 43200000;

	CERTAINMANGA.workers = [];
	CERTAINMANGA.updaters = {};
}

CERTAINMANGA.SendMessage = function SendMessage(messageType, messageParameter){
	console.debug("CERTAINMANGA::SendMessage called with messageType: " + messageType);

	browser.runtime.sendMessage({
		"type": messageType,
		"parameter": messageParameter}
	).then(CERTAINMANGA.HandleResponse, CERTAINMANGA.HandleError);
};

CERTAINMANGA.HandleResponse = function HandleResponse(response){
	if (response) {
		/*switch (response.type) {
			case "UpdateMangaResponse":
				CERTAINMANGA.UpdateMangaResponse(response.chapters, response.mangaData);
				break;
		}*/
	}
};

CERTAINMANGA.HandleError = function HandleError(error){
	console.error("CERTAINMANGA::HandleError - Something bad happened:");
	console.error(error);
};

/*CERTAINMANGA.SendMessageToCurrentTab = function SendMessageToCurrentTab(messageType, messageParameter){
	function onError(error) {
		console.error(`Error: ${error}`);
	}

	function sendMessageToTabs(tabs) {
		for (let tab of tabs) {
			browser.tabs.sendMessage(
				tab.id,
				{"type": messageType,
				"parameter": messageParameter}
			).then(response => {
				console.debug("Message from the content script:");
				console.debug(response.response);
			}).catch(onError);
		}
	}

	browser.tabs.query({
		currentWindow: true,
		active: true
	}).then(sendMessageToTabs).catch(onError);
};*/

CERTAINMANGA.OpenDatabase = function OpenDatabase() {
	let database = {
		onerror: function(e) {
			//console.debug(e);
		},
		onsuccess: function(e) {

		}
	};

	let request = indexedDB.open("ACertainMangaReaderDatabase", { version: 1, storage: "persistent" });
	request.onerror = database.onerror;
	request.onsuccess = function (e) {
		database.db = e.target.result;
		database.db.onerror = database.onerror;

		CERTAINMANGA.databaseHandler = database;

		CERTAINMANGA.InitializeOptions();
		CERTAINMANGA.InitializeMangas();
		//console.debug("Database opened");
	};

	request.onupgradeneeded = function(event) {
		if (event.oldVersion == 0) {
			CERTAINMANGA.bFirstTime = true;
		}

		let db = event.target.result;

		let optionStore = db.createObjectStore("options", { keyPath: "key" });

		/* SimpleStorage is only used for migrating old data, won't be needed here
		if (simpleStorage.storage.data) {
			optionStore.add({key: "bIsOn", value: simpleStorage.storage.data.bIsOn ? true : false});
			optionStore.add({key: "bNotifications", value: simpleStorage.storage.data.bNotifications ? true : false});
			optionStore.add({key: "updateTime", value: simpleStorage.storage.data.updateTime ? simpleStorage.storage.data.updateTime : 43200000});
			optionStore.add({key: "maxUpdateTime", value: simpleStorage.storage.data.maxUpdateTime ? simpleStorage.storage.data.maxUpdateTime : 604800000});
			optionStore.add({key: "bNetworkSaving", value: simpleStorage.storage.data.bNetworkSaving ? true : false});
			optionStore.add({key: "bCompactDesign", value: simpleStorage.storage.data.bCompactDesign ? true : false});
			optionStore.add({key: "bShowPageNumbers", value: simpleStorage.storage.data.bShowPageNumbers ? true : false});
			optionStore.add({key: "bInfiniteScrolling", value: simpleStorage.storage.data.bInfiniteScrolling ? true : false});
		} else {
		*/
		optionStore.add({key: "bIsOn", value: true});
		optionStore.add({key: "bNotifications", value: true});
		optionStore.add({key: "updateTime", value: 43200000});
		optionStore.add({key: "maxUpdateTime", value: 604800000});
		optionStore.add({key: "bNetworkSaving", value: false});
		optionStore.add({key: "bCompactDesign", value: false});
		optionStore.add({key: "bShowPageNumbers", value: false});
		optionStore.add({key: "bInfiniteScrolling", value: true});

		let mangaStore = db.createObjectStore("mangas", { keyPath: ["name", "site"] });

		mangaStore.createIndex("name", "name", { unique: false });

		mangaStore.createIndex("site", "site", { unique: false });

		mangaStore.createIndex("bRead", "bRead", { unique: false });

		mangaStore.createIndex("lastUpdatedAt", "lastUpdatedAt", { unique: false });

		/*
		if (simpleStorage.storage.data && simpleStorage.storage.data.mangaList) {
			var mangaList = simpleStorage.storage.data.mangaList;
			var count = mangaList.length;
			var x;

			while(count--) {
				x = mangaList[count].list.length;
				while(x--) {
					mangaStore.add(mangaList[count].list[x]);
				}
			}
		}
		*/
	}
};

/**
 * @param {string} storeType Either "options" or "mangas"
 * @param {boolean} mode Use false for readonly, and true for readwrite
 * @returns {IDBObjectStore}
 */
CERTAINMANGA.GetObjectStore = function GetObjectStore(storeType, mode) {
	let trans = CERTAINMANGA.databaseHandler.db.transaction(storeType, mode ? "readwrite" : "readonly");
	return trans.objectStore(storeType);
};

CERTAINMANGA.StartExport = function StartExport(data) {
	let jsonText = {};

	if (data.settings) {
		for (let setting in CERTAINMANGA.data) {
			if( CERTAINMANGA.data.hasOwnProperty(setting) && setting != "mangaList" ) {
				jsonText[setting] = CERTAINMANGA.data[setting];
			}
		}
	}

	if (data.mangas) {
		jsonText.mangaList = CERTAINMANGA.data.mangaList;
	}

	jsonText = JSON.stringify(jsonText, null, '\t');

	CERTAINMANGA.SendMessage("ExportText", jsonText);
};

CERTAINMANGA.StartImport = function StartImport(data) {
	try {
		if (data.settings) {
			if ("bCompactDesign" in data.importData) {
				CERTAINMANGA.ChangeDesign(data.importData.bCompactDesign, true);
			}
			if ("bInfiniteScrolling" in data.importData) {
				CERTAINMANGA.ChangeInfiniteScrolling(data.importData.bInfiniteScrolling, true);
			}
			if ("bIsOn" in data.importData) {
				CERTAINMANGA.ChangeAddonStatus(data.importData.bIsOn, true);
			}
			if ("bNetworkSaving" in data.importData) {
				CERTAINMANGA.ChangeNetSave(data.importData.bNetworkSaving, true);
			}
			if ("bNotifications" in data.importData) {
				CERTAINMANGA.ChangeNotificationStatus(data.importData.bNotifications, true);
			}
			if ("bShowPageNumbers" in data.importData) {
				CERTAINMANGA.ChangeShowPageNumber(data.importData.bShowPageNumbers, true);
			}
			if ("maxUpdateTime" in data.importData) {
				CERTAINMANGA.ChangeMaxUpdateTime(data.importData.maxUpdateTime, true);
			}
			if ("updateTime" in data.importData) {
				CERTAINMANGA.ChangeUpdateTime(data.importData.updateTime, true);
			}
		}

		if (data.mangas) {
			let bOverwrite = data.overwrite;

			let count = data.importData.mangaList.length;
			let i;
			let bFound = false;

			while(count--) {
				bFound = false;
				i = CERTAINMANGA.data.mangaList.length;

				while(i--) {
					if (data.importData.mangaList[count].name.toLowerCase() == CERTAINMANGA.data.mangaList[i].name.toLowerCase()
					 && data.importData.mangaList[count].site.toLowerCase() == CERTAINMANGA.data.mangaList[i].site.toLowerCase()) {
						bFound = true;

						if (!bOverwrite) {
							break;
						}

						CERTAINMANGA.UpdateMangaInfo(data.importData.mangaList[count]);
						break;
					}
				}

				if (!bFound) {
					CERTAINMANGA.AddToList(data.importData.mangaList[count]);
				}
			}
		}

		CERTAINMANGA.SendMessage("ImportResult", 1);
	} catch(e) {
		console.error('ACMR (main): Something went wrong on import');
		console.error(e);
		CERTAINMANGA.SendMessage("ImportResult", 0);
	}
};

// OPTIONS =============================================================================================================

CERTAINMANGA.InitializeOptions = function InitializeOptions() {
	let objectStore = CERTAINMANGA.GetObjectStore("options", false);

	objectStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			CERTAINMANGA.data[cursor.value.key] = cursor.value.value;
			cursor.continue();
		} else {
			CERTAINMANGA.bLoading.options = true;
			CERTAINMANGA.bLoading.startAddon();
		}
	};
};

// MANGAS ==============================================================================================================

CERTAINMANGA.InitializeMangas = function InitializeMangas() {
	let objectStore = CERTAINMANGA.GetObjectStore("mangas", false);
	let index = objectStore.index("name");

	index.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			CERTAINMANGA.data.mangaList.push(cursor.value);
			cursor.continue();
		} else {
			CERTAINMANGA.bLoading.mangas = true;
			CERTAINMANGA.bLoading.startAddon();
		}
	};
};

CERTAINMANGA.AddToListGetSuccess = function AddToListGetSuccess(event) {
	let bAdded = false;

	let count = 0;
	let limit = CERTAINMANGA.data.mangaList.length;
	while(count < limit) {
		if (event.target.result.name.toLowerCase() <= CERTAINMANGA.data.mangaList[count].name.toLowerCase()
		 && event.target.result.site.toLowerCase() == CERTAINMANGA.data.mangaList[count].site.toLowerCase()) {
			CERTAINMANGA.data.mangaList.splice(count, 0, event.target.result);
			bAdded = true;
			break;
		}
		count++;
	}
	if (!bAdded) {
		CERTAINMANGA.data.mangaList.push(event.target.result);
	}

	CERTAINMANGA.SendMessage("UdapteAddManga", event.target.result);
	//CERTAINMANGA.UpdateWorkersManga(event.target.result.name, event.target.result.site, true);
};

CERTAINMANGA.AddToListPutSuccess = function AddToListPutSuccess(event) {
	let objectStore = CERTAINMANGA.GetObjectStore("mangas", false);
	let requestGet = objectStore.get(event.target.result);

	requestGet.onsuccess = CERTAINMANGA.AddToListGetSuccess;
	requestGet.onerror = CERTAINMANGA.databaseHandler.onerror;
};

CERTAINMANGA.AddToList = function AddToList(mangaData) {
	if (mangaData && mangaData.name) {
		let objectStore = CERTAINMANGA.GetObjectStore("mangas", true);
		let requestPut = objectStore.put(mangaData);

		requestPut.onsuccess = CERTAINMANGA.AddToListPutSuccess;
		requestPut.onerror = CERTAINMANGA.databaseHandler.onerror;
	}
};

CERTAINMANGA.RemoveFromListGetSuccess = function RemoveFromListGetSuccess(event) {
	let mangaData = {
		name: event.target.result.name,
		site: event.target.result.site
	};

	let objectStore = CERTAINMANGA.GetObjectStore("mangas", true);
	let requestDel = objectStore.delete([mangaData.name, mangaData.site]);

	requestDel.onsuccess = function(event) {
		let count = CERTAINMANGA.data.mangaList.length;
		while(count--) {
			if (CERTAINMANGA.data.mangaList[count].name == mangaData.name && CERTAINMANGA.data.mangaList[count].site == mangaData.site) {
				CERTAINMANGA.data.mangaList.splice(count, 1);
				break;
			}
		}
		CERTAINMANGA.SendMessage("UdapteRemoveManga", mangaData)
	};

	requestDel.onerror = CERTAINMANGA.databaseHandler.onerror;
};

CERTAINMANGA.RemoveFromList = function RemoveFromList(mangaData) {
	let objectStore = CERTAINMANGA.GetObjectStore("mangas", false);
	let requestGet = objectStore.get([mangaData.name, mangaData.site]);

	requestGet.onsuccess = CERTAINMANGA.RemoveFromListGetSuccess;
	requestGet.onerror = CERTAINMANGA.databaseHandler.onerror;
};

/**
 * Updates the data of a manga in the database.
 * @param mangaData
 */
CERTAINMANGA.UpdateMangaInfo = function UpdateMangaInfo(mangaData) {
	if (mangaData && mangaData.name) {
		let objectStore = CERTAINMANGA.GetObjectStore("mangas", true);
		let requestGet = objectStore.get([mangaData.name, mangaData.site]);

		requestGet.onerror = CERTAINMANGA.databaseHandler.onerror;
		requestGet.onsuccess = function(event) {
			let mangaDB = event.target.result;

			if (mangaData.sid) {
				mangaDB.sid = mangaData.sid;
			}

			if (mangaData.chapters) {
				if (!CERTAINMANGA.ChaptersEqual(mangaDB.chapters, mangaData.chapters)) {
					mangaDB.chapters = mangaData.chapters;
					if (mangaData.lastUpdatedAt) {
						mangaDB.lastUpdatedAt = mangaData.lastUpdatedAt;
					} else {
						mangaDB.lastUpdatedAt = Date.now();
					}
				}
			}

			if (mangaData.atChapter) {
				mangaDB.atChapter = mangaData.atChapter;
			}

			if (mangaData.bRead) {
				mangaDB.bRead = true;
			} else {
				mangaDB.bRead = true;
			}

			if (mangaData.bUpdated) {
				mangaDB.bUpdated = true;
			} else {
				mangaDB.bUpdated = false;
			}

			let requestUpdate = objectStore.put(mangaDB);
			requestUpdate.onerror = CERTAINMANGA.databaseHandler.onerror;
			requestUpdate.onsuccess = function(event) {
				let count = CERTAINMANGA.data.mangaList.length;
				while(count--) {
					if (CERTAINMANGA.data.mangaList[count].name == mangaDB.name && CERTAINMANGA.data.mangaList[count].site == mangaDB.site) {
						CERTAINMANGA.data.mangaList[count] = mangaDB;
						break;
					}
				}

				CERTAINMANGA.SendMessage("UdapteUpdateManga", mangaDB);
			};
		};
	}
};

CERTAINMANGA.CheckSubscription = function CheckSubscription(mangaData) {
	if (CERTAINMANGA.bFirstTime) {
		CERTAINMANGA.bFirstTime = false;
	}

	/*if (worker) {
		worker.mangaSite = mangaData.site;
		worker.mangaName = mangaData.name;
		CERTAINMANGA.workers.push(worker);
	}*/

	let objectStore = CERTAINMANGA.GetObjectStore("mangas", false);
	let requestGet = objectStore.get([mangaData.name, mangaData.site]);
	requestGet.onerror = CERTAINMANGA.databaseHandler.onerror;
	requestGet.onsuccess = function(event) {
		if (event.target.result != undefined) {
			//Yup, we have the manga!
			/*if (worker) {
				worker.port.emit("IsSubscribed", true);
			}*/

			let readingAt, savedAt;
			//Now we check if the chapter we opened is newer than the one we have saved
			let mangaGet = event.target.result;
			let count = mangaGet.chapters.length;
			while(count--) {
				if (mangaGet.chapters[count].name == mangaData.atChapter) {
					readingAt = count;
				}
				if (mangaGet.chapters[count].name == mangaGet.atChapter) {
					savedAt = count;
				}
			}

			if (savedAt == undefined || readingAt > savedAt) {
				mangaGet.atChapter = mangaData.atChapter;
				if (readingAt == mangaGet.chapters.length - 1) {
					mangaGet.bRead = true;
				}
				//CERTAINMANGA.SendMessage("UdapteUpdateManga", mangaGet);
				CERTAINMANGA.UpdateMangaInfo(mangaGet);
			}

			return;
		}

		/*if (worker) {
			worker.port.emit("IsSubscribed", false);
		}*/
	}
};

// Menu and Buttons ====================================================================================================

CERTAINMANGA.OpenTab = function OpenTab(url) {
	browser.tabs.create({
		"url": url
	});
};

CERTAINMANGA.MarkAsRead = function MarkAsRead(mangaData) {
	CERTAINMANGA.CheckSubscription(mangaData);
};

CERTAINMANGA.Remove = function Remove(mangaData) {
	CERTAINMANGA.RemoveFromList(mangaData);
};

CERTAINMANGA.ChangeAddonStatus = function ChangeAddonStatus(status, bSendFeedback) {
	CERTAINMANGA.data.bIsOn = status;
	if (CERTAINMANGA.data.bIsOn) {
		//CERTAINMANGA.StartPageMods();
	} else {
		//CERTAINMANGA.StopPageMods();
	}

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "bIsOn", value: status});

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveAddonStatus", status);
	}
};

CERTAINMANGA.ChangeNotificationStatus = function ChangeNotificationStatus(status, bSendFeedback) {
	CERTAINMANGA.data.bNotifications = status;

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "bNotifications", value: status});

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveNotificationStatus", status);
	}
};

CERTAINMANGA.ChangeNetSave = function ChangeNetSave(status, bSendFeedback) {
	CERTAINMANGA.data.bNetworkSaving = status;

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "bNetworkSaving", value: status});

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveNetSave", status);
	}
};

CERTAINMANGA.ChangeDesign = function ChangeDesign(status, bSendFeedback) {
	CERTAINMANGA.data.bCompactDesign = status;

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "bCompactDesign", value: status});

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveDesign", status);
	}
};

CERTAINMANGA.ChangeShowPageNumber = function ChangeShowPageNumber(status, bSendFeedback) {
	CERTAINMANGA.data.bShowPageNumbers = status;

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "bShowPageNumbers", value: status});

	CERTAINMANGA.UpdateShowPageNumberWorkers();

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveShowPageNumber", status);
	}
};

CERTAINMANGA.ChangeInfiniteScrolling = function ChangeInfiniteScrolling(status, bSendFeedback) {
	CERTAINMANGA.data.bInfiniteScrolling = status;

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "bInfiniteScrolling", value: status});

	CERTAINMANGA.UpdateInfiniteScrollingWorkers();

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveInfiniteScrolling", status);
	}
};

CERTAINMANGA.ChangeUpdateTime = function ChangeUpdateTime(status, bSendFeedback) {
	CERTAINMANGA.data.updateTime = parseInt(status);
	browser.alarms.clear("StartUpdating");
	if (CERTAINMANGA.data.updateTime > 0) {
		browser.alarms.create("StartUpdating", {
			delayInMinutes: CERTAINMANGA.data.updateTime
		});
	}

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "updateTime", value: status});

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveUpdateTime", status);
	}
};

CERTAINMANGA.ChangeMaxUpdateTime = function ChangeMaxUpdateTime(status, bSendFeedback) {
	CERTAINMANGA.data.maxUpdateTime = parseInt(status);

	let objectStore = CERTAINMANGA.GetObjectStore("options", true);
	objectStore.put({key: "maxUpdateTime", value: status});

	if (bSendFeedback) {
		CERTAINMANGA.SendMessage("ReceiveMaxUpdateTime", status);
	}
};

CERTAINMANGA.OpenExportImportTab = function OpenExportImportTab() {
	browser.tabs.create({
		"url": browser.extension.getURL("data/import_export.html")
	});
	//CERTAINMANGA.SendMessage("TestMessage");
};

CERTAINMANGA.StartUpdating = function StartUpdating() {
	if (!CERTAINMANGA.bIsUpdating) {
		CERTAINMANGA.bIsUpdating = true;
		CERTAINMANGA.SendMessage("UpdateStatus", 1);

		CERTAINMANGA.UpdateNextManga();
	}
};

CERTAINMANGA.UpdateInfiniteScrollingWorkers = function UpdateInfiniteScrollingWorkers() {
	let count = CERTAINMANGA.workers.length;

	while(count--) {
		CERTAINMANGA.workers[count].port.emit("ChangeInfiniteScrolling", CERTAINMANGA.data.bInfiniteScrolling);
	}
};

CERTAINMANGA.UpdateShowPageNumberWorkers = function UpdateShowPageNumberWorkers() {
	let count = CERTAINMANGA.workers.length;

	while(count--) {
		CERTAINMANGA.workers[count].port.emit("ChangeShowPageNumber", CERTAINMANGA.data.bShowPageNumbers);
	}
};

CERTAINMANGA.IncrementBadgeText = function IncrementBadgeText(newText) {
	if (newText == null || newText == "") {
		newText = 1;
	} else {
		newText = (parseInt(newText) + 1);
	}

	browser.browserAction.setBadgeText({ text: newText.toString() });
};

CERTAINMANGA.UpdateBadgeText = function UpdateBadgeText(newText) {
	browser.browserAction.setBadgeText({ text: newText });
};

/**
 * @return {boolean}
 */
CERTAINMANGA.ChaptersEqual = function ChaptersEqual(a, b) {
	if (a.length != b.length) {
		return false;
	}
	for (let i = 0; i < a.length; ++i) {
		if (a[i].name !== b[i].name || a[i].url !== b[i].url) {
			return false;
		}
	}
	return true;
};

CERTAINMANGA.UpdateMangaResponse = function UpdateMangaResponse(newChapters, mangaData) {
	let dateNow = Date.now();
	//console.debug(newChapters, mangaData);

	if (newChapters && mangaData) {
		if (!CERTAINMANGA.ChaptersEqual(mangaData.chapters,newChapters)) {

			if (CERTAINMANGA.data.bNotifications) {
				let intNewChapters = newChapters.length - mangaData.chapters.length;
				let nText = "Chapters have been updated";
				//let nData = "panel";
				if (intNewChapters == 1) {
					nText = intNewChapters + " new chapter found.";
					//nData = newChapters[newChapters.length - 1].url;
				} else if (intNewChapters > 1) {
					nText = intNewChapters + " new chapters found.";
				}

				browser.notifications.create(mangaData.name + mangaData.site, {
					type: "basic",
					title: mangaData.name + " has been updated",
					message: nText,
					iconUrl: CERTAINMANGA.filesRef.icon64
					/*onClick: function(data) {
						if (nData == "panel") {
							CERTAINMANGA.button.badge = undefined;
							CERTAINMANGA.mainPanel.show({
								position: CERTAINMANGA.button
							});
						} else {
							CERTAINMANGA.button.badge = (CERTAINMANGA.button.badge && CERTAINMANGA.button.badge > 0) ? CERTAINMANGA.button.badge - 1 : undefined;
							CERTAINMANGA.OpenTab(nData);
						}
					}*/
				});
			}

			mangaData.lastUpdatedAt = dateNow;
			mangaData.bUpdated = true;
			//mangaData.newChapterTimeAt = dateNow;
			mangaData.chapters = newChapters;
			if (mangaData.atChapter != mangaData.chapters[mangaData.chapters.length -1].name) {
				mangaData.bRead = false;
			}
			CERTAINMANGA.UpdateMangaInfo(mangaData);
			browser.browserAction.getBadgeText({}).then(CERTAINMANGA.IncrementBadgeText);

			if (mangaData.netSaveTimeIncrease) {
				mangaData.netSaveTimeIncrease = 0;
				mangaData.netSaveTimes = 0;
			}
			//console.debug("UPDATED");
		} else {
			//mangaData.lastUpdatedAt = dateNow;

			if (mangaData.netSaveTimeIncrease) {
				mangaData.netSaveTimes++;
				mangaData.netSaveTimeIncrease = dateNow + (CERTAINMANGA.NETSAVEINCREASEBY * mangaData.netSaveTimes);
				if (mangaData.netSaveTimes * CERTAINMANGA.NETSAVEINCREASEBY > CERTAINMANGA.data.maxUpdateTime) {
					mangaData.netSaveTimeIncrease = CERTAINMANGA.data.maxUpdateTime;
					mangaData.netSaveTimes--;
				}
			} else {
				mangaData.netSaveTimeIncrease = dateNow + CERTAINMANGA.NETSAVEINCREASEBY;
				mangaData.netSaveTimes = 1;
			}
			//console.debug("NEXT UPDATE PLUS: " + mangaData.netSaveTimes * CERTAINMANGA.NETSAVEINCREASEBY / 1000);
			//console.debug("NO UPDATED");
		}
	}

	/*browser.alarms.create("UpdateNextManga", {
		delayInMinutes: 300
	});*/
	setTimeout(CERTAINMANGA.UpdateNextManga, 300);
};

CERTAINMANGA.UpdateNextManga = function UpdateNextManga() {
	if (CERTAINMANGA.currentlyUpdating >= CERTAINMANGA.data.mangaList.length) {
		CERTAINMANGA.bIsUpdating = false;
		CERTAINMANGA.currentlyUpdating = 0;

		CERTAINMANGA.SendMessage("UpdateStatus", 0);

		if (CERTAINMANGA.data.updateTime > 0) {
			browser.alarms.create("StartUpdating", {
				delayInMinutes: CERTAINMANGA.data.updateTime
			});
		}
		return;
	}

	let mangaTemp;
	if (CERTAINMANGA.data.mangaList[CERTAINMANGA.currentlyUpdating]) {
		mangaTemp = CERTAINMANGA.data.mangaList[CERTAINMANGA.currentlyUpdating];

		if (CERTAINMANGA.data.bNetworkSaving) {
			if (mangaTemp.netSaveTimeIncrease) {
				if (Date.now() <= mangaTemp.netSaveTimeIncrease) {
					CERTAINMANGA.currentlyUpdating++;
					CERTAINMANGA.UpdateNextManga();
					return;
				}
			}
		}

		if (mangaTemp.site == "Batoto") {
			//console.debug(mangaTemp.mangaURL);
			CMUPDATER.batoto.RequestUpdate(mangaTemp, CERTAINMANGA.UpdateMangaResponse)
		} else if (mangaTemp.site == "Mangafox") {
			//console.debug(mangaTemp.mangaURL);
			CMUPDATER.mangafox.RequestUpdate(mangaTemp, CERTAINMANGA.UpdateMangaResponse);
		} else if (mangaTemp.site == "Mangastream") {
			//console.debug(mangaTemp.mangaURL);
			CMUPDATER.mangastream.RequestUpdate(mangaTemp, CERTAINMANGA.UpdateMangaResponse);
		} else if (mangaTemp.site == "Mangareader") {
			//console.debug(mangaTemp.mangaURL);
			CMUPDATER.mangareader.RequestUpdate(mangaTemp, CERTAINMANGA.UpdateMangaResponse);
		} else if (mangaTemp.site == "Mangahere") {
			//console.debug(mangaTemp.mangaURL);
			CMUPDATER.mangahere.RequestUpdate(mangaTemp, CERTAINMANGA.UpdateMangaResponse);
		} else if (mangaTemp.site == "Readmangatoday") {
			//console.debug(mangaTemp.mangaURL);
			CMUPDATER.readmangatoday.RequestUpdate(mangaTemp, CERTAINMANGA.UpdateMangaResponse);
		}

		CERTAINMANGA.currentlyUpdating++;
	}
};

/*
	var mangaData = {
		name: CMREADER.options.mangaName,
		site: "Batoto",
		atChapter: CMREADER.options.chapterName,
		chapters: CMREADER.options.chapters,
		bRead: (CMREADER.options.chapterName == CMREADER.options.chapterNumbers[CMREADER.options.chapterNumbers.length - 1]) ? true : false,
		lastUpdatedAt: Date.now(),
		bUpdated = true // If true, the user has not interacted with this manga since the last time it was updated.
	};
*/

// Web Requests ========================================================================================================

CERTAINMANGA.InterceptReadMangaToday = function InterceptReadMangaToday(requestDetails) {
	if (requestDetails.url.indexOf("/all-pages") > -1) {
		return;
	}

	let matches = requestDetails.url.match(/.*?readmng.*?\/.*?\/\d+/i)[0];
	if (matches == null) {
		return;
	}

	//console.debug("CERTAINMANGA::InterceptReadMangaToday url: " + requestDetails.url);

	return {
		redirectUrl: matches + "/all-pages"
	}
};

CERTAINMANGA.CreateWebRequestIntercepters = function CreateWebRequestIntercepters() {
	browser.webRequest.onBeforeRequest.addListener(
		CERTAINMANGA.InterceptReadMangaToday,
		{urls: ["*://*.readmng.com/*/*"], types: ["main_frame"]},
		["blocking"]
	);
};

// Initialize Code =====================================================================================================

CERTAINMANGA.OpenDatabase();

CERTAINMANGA.StartAddon = function StartAddon() {
	if (CERTAINMANGA.data.updateTime > 0) {
		// CERTAINMANGA.alarm = browser.alarms.create("Alarm", {
		browser.alarms.create("StartUpdating", {
			"delayInMinutes": 1
		});
	}

	if (CERTAINMANGA.data.bIsOn) {
		CERTAINMANGA.CreateWebRequestIntercepters();
	}
};

CERTAINMANGA.ListenTimers = function ListenTimers(alarm){
	switch (alarm.name) {
		case "StartUpdating":
			CERTAINMANGA.StartUpdating();
			break;
		/*case "UpdateNextManga":
			CERTAINMANGA.UpdateNextManga();
			break;*/
	}
};

browser.alarms.onAlarm.addListener(CERTAINMANGA.ListenTimers);

CERTAINMANGA.ListenMessages = function ListenMessages(message){
	console.debug("CERTAINMANGA::ListenMessages called with message: " + message);
	switch (message.type) {
		// From main_panel
		case "GetDataFromMain":
			CERTAINMANGA.SendMessage("SendDataFromMain", CERTAINMANGA.data);
			break;
		case "OpenTab":
			CERTAINMANGA.OpenTab(message.parameter);
			break;
		case "MarkAsRead":
			CERTAINMANGA.MarkAsRead(message.parameter);
			break;
		case "Remove":
			CERTAINMANGA.Remove(message.parameter);
			break;
		case "ChangeAddonStatus":
			CERTAINMANGA.ChangeAddonStatus(message.parameter);
			break;
		case "ChangeNotificationStatus":
			CERTAINMANGA.ChangeNotificationStatus(message.parameter);
			break;
		case "ChangeNetSave":
			CERTAINMANGA.ChangeNetSave(message.parameter);
			break;
		case "ChangeDesign":
			CERTAINMANGA.ChangeDesign(message.parameter);
			break;
		case "ChangeShowPageNumber":
			CERTAINMANGA.ChangeShowPageNumber(message.parameter);
			break;
		case "ChangeInfiniteScrolling":
			CERTAINMANGA.ChangeInfiniteScrolling(message.parameter);
			break;
		case "ChangeUpdateTime":
			CERTAINMANGA.ChangeUpdateTime(message.parameter);
			break;
		case "ChangeMaxUpdateTime":
			CERTAINMANGA.ChangeMaxUpdateTime(message.parameter);
			break;
		case "OpenExportImportTab":
			CERTAINMANGA.OpenExportImportTab();
			break;
		case "StartUpdating":
			CERTAINMANGA.StartUpdating();
			break;
		// From import_export
		case "StartExport":
			CERTAINMANGA.StartExport(message.parameter);
			break;
		case "StartImport":
			CERTAINMANGA.StartImport(message.parameter);
			break;
		// From content scripts
		case "AddToList":
			CERTAINMANGA.AddToList(message.parameter);
			break;
		case "RemoveFromList":
			CERTAINMANGA.RemoveFromList(message.parameter);
			break;
		case "UpdateMangaInfo":
			CERTAINMANGA.UpdateMangaInfo(message.parameter);
			break;
		case "CheckSubscription":
			CERTAINMANGA.CheckSubscription(message.parameter);
			break;
	}
};

browser.runtime.onMessage.addListener(CERTAINMANGA.ListenMessages);
