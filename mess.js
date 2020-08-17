chrome.storage.local.get({ tabs: [] }, function (data) {
	let background = chrome.extension.getBackgroundPage();
	console.log(data);

	function $(a) {
		return document.getElementById(a);
	}

	let temp = {
		tabs: [
			{
				id: 0,
				favicon:
					"https://www.youtube.com/s/desktop/5718b32a/img/favicon_32.png",
				url:
					"https://www.youtube.com/watch?v=qDt-J0yHMS0&list=PLPdkBLbDPtqoHDcjUweIJqe6GKnOz0-Qw",
				name: "Computational Astrophysics",
			},
			{
				id: 1,
				favicon:
					"https://www.youtube.com/s/desktop/5718b32a/img/favicon_32.png",
				url:
					"https://www.youtube.com/watch?v=PzwxxZJpb98&list=PLu02O8xRZn7xtNx03Rlq6xMRdYcQgEpar",
				name: "Computational Neuroscience",
			},
			{
				id: 2,
				favicon: "https://devstronomy.com/rocket.png",
				name: "Devstronomy",
				url: "https://devstronomy.com/#/",
			},
			{
				id: 3,
				favicon:
					"http://www.astropython.org/static/images/favicons/favicon.ico",
				name: "Astropython",
				url: "http://www.astropython.org/",
			},
			{
				id: 4,
				favicon: "https://api.nasa.gov/assets/img/favicons/favicon.ico",
				name: "NASA Open APIs",
				url: "https://api.nasa.gov/",
			},
		],
	};

	function deleteTabFromTable(tab) {
		tab.parentNode.removeChild(tab);
	}

	function createTab(url) {
		chrome.tabs.create({
			url: url,
		});
	}

	function saveCurrentData() {
		chrome.storage.local.set({ tabs: data.tabs });
	}

	function deleteTab(id) {
		id = parseInt(id);
		const index = data.tabs.indexOf(data.tabs.find((e) => e.id == id));
		if (index > -1) {
			data.tabs.splice(index, 1);
		}
		console.log({ index: index, id: id, data: data.tabs });
		saveCurrentData();
	}

	function addTabToTable(tab) {
		const { name, url, favicon } = tab;

		let tabDiv = document.createElement("div");
		tabDiv.classList.add("tab");
		$("tab-container").appendChild(tabDiv);

		let tabFavicon = new Image();
		tabFavicon.src = favicon;
		tabFavicon.className = "tab-favicon";
		tabDiv.appendChild(tabFavicon);

		let tabLabel = document.createElement("a");
		tabLabel.setAttribute("href", url);
		tabLabel.className = "tab-label";
		tabLabel.innerHTML = name;
		tabDiv.appendChild(tabLabel);
		tabLabel.onclick = function () {
			createTab(url);
		};

		let tabDelete = document.createElement("button");
		tabDelete.setAttribute("data-id", tab.id);
		tabDelete.classList.add("btn", "btn-danger", "tab-delete");
		tabDelete.innerHTML = "X";
		tabDiv.appendChild(tabDelete);
		tabDelete.onclick = function () {
			deleteTab(tabDelete.dataset.id);
			deleteTabFromTable(tabDiv);
		};
	}

	function addTabsToTable(tabs) {
		for (tab of tabs) {
			addTabToTable(tab);
		}
	}

	function saveTab(tab) {
		data.tabs.push(tab);
		background.write(data);
		saveCurrentData();
	}

	function initTabs() {
		let data = temp.tabs;
		chrome.storage.local.set({ tabs: data });
	}

	function initTable() {
		addTabsToTable(data.tabs);
	}
	//initTabs();
	initTable();

	$("add").addEventListener("click", () => {
		chrome.tabs.query({ currentWindow: true, active: true }, function (
			tabs,
		) {
			let tab = {
				id: data.tabs[data.tabs.length - 1].id + 1,
				favicon: tabs[0].favIconUrl,
				url: tabs[0].url,
				name:
					tabs[0].title.length > 37
						? tabs[0].title.substring(0, 37) + "..."
						: tabs[0].title,
			};

			addTabToTable(tab);
			saveTab(tab);
		});
	});

	$("save-session").addEventListener("click", () => {
		chrome.tabs.query({}, function (tabs) {
			chrome.storage.local.set({ session: tabs });
			createTab();
			for (tab of tabs) {
				chrome.tabs.remove(tab.id);
			}
		});
	});

	$("load-session").addEventListener("click", () => {
		chrome.storage.local.get({ session: [] }, function (data) {
			for (tab of data.session) {
				createTab(tab.url);
			}
		});
	});

	//TESTING PURPOSE ONLY
	$("clear").addEventListener("click", () => {
		if (confirm("Are you sure you want to delete the cache?")) {
			chrome.storage.local.clear(function () {});
			console.log("Local cache deleted");
		}
	});
});
