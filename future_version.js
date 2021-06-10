document.addEventListener("DOMContentLoaded", function (event) {
	//import View from "./view.js";

	function $(a) {
		return document.getElementById(a);
	}

	const dataType = {
		FOLDER: "folder",
		TAB: "tab",
	};


	class App {
		constructor(logic) {
			this.saveSession = $("save-session");
			this.loadSession = $("load-session");
			this.clear = $("clear");

			this.logic = logic;
			this.view = new ViewController(this.logic, this.logic.getFolders());
		}

		start() {
			this.initEvents();
			this.view.init();
		}

		initEvents() {
			this.saveSession.addEventListener("click", () => {
				chrome.tabs.query({}, (tabs) => {
					chrome.storage.local.set({ session: tabs });
					this.logic.createTab();
					for (let tab of tabs) {
						chrome.tabs.remove(tab.id);
					}
				});
			});

			this.loadSession.addEventListener("click", () => {
				chrome.storage.local.get({ session: [] }, (data) => {
					for (let tab of data.session) {
						this.logic.createTab(tab.url);
					}
				});
			});

			this.clear.addEventListener("click", () => {
				if (confirm("Are you sure you want to delete the cache?")) {
					chrome.storage.local.clear(function () {});
					console.log("Local cache deleted");
				}
			});
		}
	}

	class ViewController {
		constructor(logic, datas) {
			this.logic = logic;
			this.container = {
				newInput = $("new-input"),
				newButton = $("new"),
				data: $("data-container"),
				menu: $("menu-container"),
				back: $("back"),
				menuRight: $("menu-right"),
			};

			this.datas = datas;
			this.factory = new DataContainerFactory();

			this.history = [];
		}

		init() {
			this.createTable(this.datas);
			this.initEvents();
		}

		initEvents(){
			this.container.back.addEventListener("click", ()=>{
				this.onBackClick();
			});
			
			this.container.newButton.addEventListener("click", () => {
				let dType = dataType.FOLDER;
				switch (dType) {
					case dataType.FOLDER:
						this.view.factory.addFolderToTable(
							data,
							datas,
							this.container,
							this,
							this.logic,
						);
						break;
					case dataType.TAB:
						this.logic.saveNewTab(this.container.newInput.value);
						this.view.factory.addTabToTable(
							data,
							datas,
							this.container,
							this,
							this.logic,
						);
						break;
				}
			});
		}

		saveData() {
			this.logic.saveCurrentData();
		}

		clearContainer() {
			this.container.data.innerHTML = "";
		}

		createTable(datas) {
			this.clearContainer();

			for (let data of datas) {
				switch (data.type) {
					case dataType.FOLDER:
						this.factory.addFolderToTable(
							data,
							datas,
							this.container,
							this,
							this.logic,
						);
						break;
					case dataType.TAB:
						this.factory.addTabToTable(
							data,
							datas,
							this.container,
							this,
							this.logic,
						);
						break;
				}
			}
		}

		onFolderClick(data){
			this.history.push(data);
		}

		onBackClick(){
			if(this.history.length > 0){
				let parent = this.history.pop();
				this.createTable(parent);
			}
		}
	}

	class DataContainerFactory {
		addFolderToTable(folder, parent, container, view, logic) {
			let { id, name } = folder;

			let folderDiv = document.createElement("div");
			folderDiv.classList.add("tab", "vertical-center");
			container.data.appendChild(folderDiv);

			let folderAdd = document.createElement("span");
			folderAdd.setAttribute("data-id", id);
			folderAdd.classList.add(
				"add",
				"cursor-pointer",
				"margin-small-right",
			);
			folderDiv.appendChild(folderAdd);
			folderAdd.onclick = () => {
				this.logic.saveNewTab();
			};

			let folderLabel = document.createElement("span");
			folderLabel.classList.add("tab-label", "cursor-pointer");
			folderLabel.innerHTML = name;
			folderDiv.appendChild(folderLabel);
			folderLabel.onclick = () => {
				view.onFolderClick(parent);
				view.createTable(folder.tabs);
			};

			let folderDelete = document.createElement("button");
			folderDelete.setAttribute("data-id", id);
			folderDelete.classList.add("set-right", "close", "cursor-pointer");
			folderDiv.appendChild(folderDelete);
			folderDelete.onclick = () => {
				logic.delete(folderDelete.dataset.id, this.folders);
				this.deleteFromTable(folderDiv);
				view.saveData();
			};
		}

		addTabToTable(tab, folder, container, view, logic) {
			let { name, url, favicon } = tab;

			let tabDiv = document.createElement("div");
			tabDiv.classList.add("tab", "vertical-center");
			container.data.appendChild(tabDiv);

			let tabFavicon = new Image();
			tabFavicon.src = favicon;
			tabFavicon.className = "tab-favicon";
			tabDiv.appendChild(tabFavicon);

			let tabLabel = document.createElement("a");
			tabLabel.setAttribute("href", url);
			tabLabel.className = "tab-label";
			tabLabel.innerHTML = name;
			tabDiv.appendChild(tabLabel);
			tabLabel.onclick = () => {
				logic.createTab(url);
			};

			let tabDelete = document.createElement("button");
			tabDelete.setAttribute("data-id", tab.id);
			tabDelete.classList.add("set-right", "close", "cursor-pointer");
			tabDiv.appendChild(tabDelete);
			tabDelete.onclick = () => {
				logic.delete(tabDelete.dataset.id, folder.tabs);
				this.deleteFromTable(tabDiv);
				view.saveData();
			};
		}

		deleteFromTable(tab) {
			tab.parentNode.removeChild(tab);
		}
	}

	class Logic {
		constructor(data) {
			this.data = data;
		}

		getFolders() {
			return this.data.folders;
		}

		createUUID() {
			function chr4() {
				return Math.random().toString(16).slice(-4);
			}
			return (
				chr4() +
				chr4() +
				"-" +
				chr4() +
				"-" +
				chr4() +
				"-" +
				chr4() +
				"-" +
				chr4() +
				chr4() +
				chr4()
			);
		}

		createTab(url) {
			chrome.tabs.create({
				url: url,
			});
		}

		saveNewTab(tabName = ""){
			chrome.tabs.query(
				{ currentWindow: true, active: true },
				(tabs) => {
					let tabN = tabName == "" ? tabs[0].title : tabName;
					let tab = {
						id: logic.createUUID(),
						favicon: tabs[0].favIconUrl,
						url: tabs[0].url,
						name:
							tabN.length > 30
								? tabN.substring(0, 30) + "..."
								: tabN,
						type: dataType.TAB,
					};

					this.save(tab, folder.tabs);
					this.saveCurrentData();
				},
			);
		}

		delete(id, arr) {
			const index = arr.indexOf(arr.find((e) => e.id == id));
			if (index > -1) {
				arr.splice(index, 1);
			}
			console.log({ index: index, id: id, arr: arr });
		}

		save(value, arr) {
			arr.push(value);
		}

		saveCurrentData() {
			chrome.storage.local.set({ data: this.data });
		}
	}

	chrome.storage.local.get({ data: {} }, function (data) {
		let temp = {
			folders: [
				{
					id: "0",
					name: "Prog",
					tabs: [
						{
							id: "2",
							favicon: "https://devstronomy.com/rocket.png",
							name: "Devstronomy",
							url: "https://devstronomy.com/#/",
						},
						{
							id: "3",
							favicon:
								"http://www.astropython.org/static/images/favicons/favicon.ico",
							name: "Astropython",
							url: "http://www.astropython.org/",
						},
						{
							id: "4",
							favicon: "",
							name: "NASA Open APIs",
							url: "https://api.nasa.gov/",
						},
					],
				},
				{
					id: "1",
					name: "Education",
					tabs: [
						{
							id: "0",
							favicon:
								"https://www.youtube.com/s/desktop/5718b32a/img/favicon_32.png",
							url:
								"https://www.youtube.com/watch?v=qDt-J0yHMS0&list=PLPdkBLbDPtqoHDcjUweIJqe6GKnOz0-Qw",
							name: "Computational Astrophysics",
						},
						{
							id: "1",
							favicon:
								"https://www.youtube.com/s/desktop/5718b32a/img/favicon_32.png",
							url:
								"https://www.youtube.com/watch?v=PzwxxZJpb98&list=PLu02O8xRZn7xtNx03Rlq6xMRdYcQgEpar",
							name: "Computational Neuroscience",
						},
					],
				},
			],
		};

		function initTabs() {
			chrome.storage.local.set({ data: temp });
		}

		function initDataTypes() {
			for (let folder of data.data.folders) {
				folder.type = dataType.FOLDER;
				for (let tab of folder.tabs) {
					tab.type = dataType.TAB;
				}
			}
		}

		//initTabs();
		//initDataTypes();
		console.log(data.data);

		let logic = new Logic(data.data);
		let app = new App(logic);
		app.start();
	});
});
