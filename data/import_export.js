if (typeof CMIE == 'undefined' || CMIE == null) {
	CMIE = {};
};

CMIE.ChangeTab = function ChangeTab(e) {
	//console.log(e);
	var tabId = e.target.id;

	if (tabId == "TabExporter") {
		CMIE.options.DOM.import_tab.className = "";
		CMIE.options.DOM.import_container.className = "";

		CMIE.options.DOM.export_tab.className = "Shown";
		CMIE.options.DOM.export_container.className = "Shown";
	} else if (tabId == "TabImporter") {
		CMIE.options.DOM.export_tab.className = "";
		CMIE.options.DOM.export_container.className = "";

		CMIE.options.DOM.import_tab.className = "Shown";
		CMIE.options.DOM.import_container.className = "Shown";
	}
};

CMIE.StartExport = function StartExport() {
	self.port.emit("StartExport", {
		settings: CMIE.options.DOM.export_settings.checked,
		mangas: CMIE.options.DOM.export_mangas.checked
	})
};

CMIE.ExportText = function ExportText(textData) {
	CMIE.options.DOM.export_text.value = textData;

	CMIE.options.DOM.export_feedback.textContent = "Export finished.";
};

CMIE.StartImport = function StartImport() {
	CMIE.options.DOM.import_feedback.textContent = "Sending data.";

	try {
		var obj = JSON.parse(CMIE.options.DOM.import_text.value);

		if (obj && typeof obj === "object" && obj !== null) {
			self.port.emit("StartImport", {
				settings: CMIE.options.DOM.import_settings.checked,
				mangas: CMIE.options.DOM.import_mangas.checked,
				overwrite: CMIE.options.DOM.import_overwrite.checked,
				importData: obj
			})
		}
	}
	catch (e) {
		CMIE.options.DOM.import_feedback.textContent = "Data is invalid!";

		return;
	}
};

CMIE.ImportResult = function ImportResult(msgId) {
	if (msgId == 0) {
		CMIE.options.DOM.import_feedback.textContent = "Import failed¡";
	} else if (msgId == 1) {
		CMIE.options.DOM.import_feedback.textContent = "The data was imported successfully.";
	} else if (msgId == 2) {
		CMIE.options.DOM.import_feedback.textContent = "Import finished with errors.";
	}
};

CMIE.SetInitialState = function SetInitialState() {
	CMIE.options.DOM = {};

	CMIE.options.DOM.export_tab = document.getElementById("TabExporter");
	CMIE.options.DOM.export_container = document.getElementById("Exporter");
	CMIE.options.DOM.export_settings = document.getElementById("export_settings");
	CMIE.options.DOM.export_mangas = document.getElementById("export_mangas");
	CMIE.options.DOM.export_button = document.getElementById("ExportButton");
	CMIE.options.DOM.export_text = document.getElementById("exporttext");
	CMIE.options.DOM.export_feedback = document.getElementById("export_feedback");

	CMIE.options.DOM.import_tab = document.getElementById("TabImporter");
	CMIE.options.DOM.import_container = document.getElementById("Importer");
	CMIE.options.DOM.import_settings = document.getElementById("import_settings");
	CMIE.options.DOM.import_mangas = document.getElementById("import_mangas");
	CMIE.options.DOM.import_overwrite = document.getElementById("import_overwrite");
	CMIE.options.DOM.import_button = document.getElementById("ImportButton");
	CMIE.options.DOM.import_text = document.getElementById("importtext");
	CMIE.options.DOM.import_feedback = document.getElementById("import_feedback");

	CMIE.options.DOM.export_tab.onclick = CMIE.ChangeTab;
	CMIE.options.DOM.import_tab.onclick = CMIE.ChangeTab;

	CMIE.options.DOM.export_button.onclick = CMIE.StartExport;
	CMIE.options.DOM.import_button.onclick = CMIE.StartImport;
};

CMIE.Main = function Main() {
	CMIE.options = {};

	CMIE.SetInitialState();

	self.port.on("ExportText", CMIE.ExportText);
	self.port.on("ImportResult", CMIE.ImportResult);
	//self.port.on("WorkerUpdateSubscribed", CMIE.WorkerUpdateSubscribed);
	//self.port.on("ChangeInfiniteScrolling", CMIE.ChangeInfiniteScrolling);
};

self.port.on("StartMain", CMIE.Main);