document.addEventListener("DOMContentLoaded", function (event) {
	//import View from "./view.js";

	function $(a) {
		return document.getElementById(a);
	}

	class View {
		constructor(logic) {
			this.logic = logic;
			this.container = {
				data: $("data-container"),
				menu: $("menu-container"),
			};
		}

		saveData() {
			this.logic.saveCurrentData();
		}

		clearContainer() {
			this.container.data.innerHTML = "";
			this.container.menu.innerHTML = "";
		}
	}

	class App {
		constructor(logic) {
			this.add = $("add");
			this.newFolder = $("new");
			this.saveSession = $("save-session");
			this.loadSession = $("load-session");
			this.clear = $("clear");

			this.logic = logic;
			this.view = new FolderView(this.logic, this.logic.getFolders());

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

	class FolderView extends View {
		constructor(logic, folders) {
			super(logic);

			this.folders = folders;

			this.tabView = new TabView(logic, this);
		}

		saveData() {
			this.logic.saveCurrentData();
		}

		init() {
			super.clearContainer();
			this.addFoldersToTable(this.folders);
			this.initMenu();
		}

		initMenu() {
			let input = document.createElement("input");
			input.placeholder = "Folder name";
			input.classList.add("margin-small-left", "margin-small-right");
			input.maxLength = 30;
			this.container.menu.appendChild(input);

			let newButton = document.createElement("button");
			newButton.classList.add("btn", "btn-outline-info");
			newButton.innerHTML = "New";
			this.container.menu.appendChild(newButton);
			newButton.onclick = () => {
				let folder = {
					id: this.logic.createUUID(),
					name: input.value == "" ? "New Folder" : input.value,
					tabs: [],
				};

				this.addFolderToTable(folder);
				this.logic.save(folder, this.folders);
				super.saveData();
				
				input.value = "";
			};
		}

		addFoldersToTable(folders) {
			for (let folder of folders) {
				this.addFolderToTable(folder);
			}
		}

		addFolderToTable(folder) {
			let { id, name } = folder;

			let folderDiv = document.createElement("div");
			folderDiv.classList.add("tab", "vertical-center");
			this.container.data.appendChild(folderDiv);

			let folderAdd = document.createElement("span");
			folderAdd.setAttribute("data-id", id);
			folderAdd.classList.add(
				"add",
				"cursor-pointer",
				"margin-small-right",
			);
			folderDiv.appendChild(folderAdd);
			folderAdd.onclick = () => {
				chrome.tabs.query(
					{ currentWindow: true, active: true },
					(tabs) => {
						let tab = {
							id: this.logic.createUUID(),
							favicon: tabs[0].favIconUrl,
							url: tabs[0].url,
							name:
								tabs[0].title.length > 30
									? tabs[0].title.substring(0, 30) + "..."
									: tabs[0].title,
						};

						this.logic.save(tab, folder.tabs);
						super.saveData();
					},
				);
			};

			let folderLabel = document.createElement("span");
			folderLabel.classList.add("tab-label", "cursor-pointer");
			folderLabel.innerHTML = name;
			folderDiv.appendChild(folderLabel);
			folderLabel.onclick = () => {
				this.tabView.init(folder);
			};

			let folderDelete = document.createElement("button");
			folderDelete.setAttribute("data-id", id);
			folderDelete.classList.add("set-right", "close", "cursor-pointer");
			folderDiv.appendChild(folderDelete);
			folderDelete.onclick = () => {
				this.logic.delete(folderDelete.dataset.id, this.folders);
				this.deleteFolderFromTable(folderDiv);
				super.saveData();
			};
		}

		deleteFolderFromTable(folder) {
			folder.parentNode.removeChild(folder);
		}
	}

	class TabView extends View {
		constructor(logic, parent) {
			super(logic);

			this.parent = parent;
		}

		init(folder) {
			super.clearContainer();
			this.initMenu(folder);
			this.addTabsToTable(folder);
		}

		initMenu(folder) {
			let backButton = document.createElement("button");
			backButton.classList.add("btn");
			backButton.innerHTML = '<i class="fa fa-chevron-left"></i>';
			this.container.menu.appendChild(backButton);
			backButton.onclick = () => {
				this.parent.init();
			};

			let input = document.createElement("input");
			input.placeholder = "Name";
			input.classList.add("margin-small-right");
			input.maxLength = 30;
			this.container.menu.appendChild(input);

			let addButton = document.createElement("button");
			addButton.classList.add("btn", "btn-outline-info");
			addButton.innerHTML = "New";
			this.container.menu.appendChild(addButton);
			addButton.onclick = () => {
				chrome.tabs.query(
					{ currentWindow: true, active: true },
					(tabs) => {
						let name =
							tabs[0].title.length > 30
								? tabs[0].title.substring(0, 30) + "..."
								: tabs[0].title;

						let tab = {
							id: this.logic.createUUID(),
							favicon: tabs[0].favIconUrl,
							url: tabs[0].url,
							name: input.value == "" ? name : input.value,
						};

						this.addTabToTable(tab, folder);
						this.logic.save(tab, folder.tabs);
						super.saveData();

						input.value = "";
					},
				);
			};
		}

		addTabsToTable(folder) {
			for (let tab of folder.tabs) {
				this.addTabToTable(tab, folder);
			}
		}

		addTabToTable(tab, folder) {
			let { name, url, favicon } = tab;

			let tabDiv = document.createElement("div");
			tabDiv.classList.add("tab", "vertical-center");
			this.container.data.appendChild(tabDiv);

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
				this.logic.createTab(url);
			};

			let tabDelete = document.createElement("button");
			tabDelete.setAttribute("data-id", tab.id);
			tabDelete.classList.add("set-right", "close", "cursor-pointer");
			tabDiv.appendChild(tabDelete);
			tabDelete.onclick = () => {
				console.log(folder);
				this.logic.delete(tabDelete.dataset.id, folder.tabs);
				this.deleteFromTable(tabDiv);
				super.saveData();
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

		//initTabs();
		console.log(data.data);

		let logic = new Logic(data.data);
		let app = new App(logic);
	});
});
