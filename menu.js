document.addEventListener("DOMContentLoaded", function (event) {
	function $(a) {
		return document.getElementById(a);
	}

	class App {
		constructor(data) {
			this.data = data;

			this.logic = new Logic();

			this.newFolder = $("new");
			this.add = $("add");
			this.saveSession = $("save-session");
			this.loadSession = $("load-session");
			this.clear = $("clear");
			this.container = $("container");

			this.initEvents();
			this.initTable();
		}

		initTable() {
			this.addTabsToTable(this.data.tabs);
		}

		addTabsToTable(tabs) {
			for (let tab of tabs) {
				this.addTabToTable(tab);
			}
		}

		addTabToTable(tab) {
			const { name, url, favicon } = tab;

			let tabDiv = document.createElement("div");
			tabDiv.classList.add("tab");
			this.container.appendChild(tabDiv);

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
			tabDelete.classList.add("btn", "btn-danger", "tab-delete");
			tabDelete.innerHTML = "X";
			tabDiv.appendChild(tabDelete);
			tabDelete.onclick = () => {
				this.logic.deleteTab(tabDelete.dataset.id, this.data);
				this.deleteTabFromTable(tabDiv);
			};
		}

		deleteTabFromTable(tab) {
			tab.parentNode.removeChild(tab);
		}

		initEvents() {
			this.add.addEventListener("click", () => {
				chrome.tabs.query(
					{ currentWindow: true, active: true },
					(tabs) => {
						let tab = {
							id: this.logic.createUUID(),
							favicon: tabs[0].favIconUrl,
							url: tabs[0].url,
							name:
								tabs[0].title.length > 37
									? tabs[0].title.substring(0, 37) + "..."
									: tabs[0].title,
						};

						this.addTabToTable(tab);
						this.logic.saveTab(tab, this.data);
					},
				);
			});

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

	class Logic {
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

		deleteTab(id, data) {
			const index = data.tabs.indexOf(data.tabs.find((e) => e.id == id));
			if (index > -1) {
				data.tabs.splice(index, 1);
			}
			console.log({ index: index, id: id, data: data });
			this.saveCurrentData(data);
		}

		saveTab(tab, data) {
			data.tabs.push(tab);
			this.saveCurrentData(data);
		}

		saveCurrentData(data) {
			chrome.storage.local.set({ data: data });
		}
	}

	chrome.storage.local.get({ data: {}}, function (data) {
		let temp = {
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
		};

		function initTabs() {
			chrome.storage.local.set({ data: temp });
		}

		initTabs();
		console.log(data.data);

		let app = new App(data.data);
		console.log(data.data);
	});
});
