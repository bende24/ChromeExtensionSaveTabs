chrome.storage.local.get({ tabs: [] }, function (data) {
	let background = chrome.extension.getBackgroundPage();

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
		],
	};

	function deleteTabFromTable(tab){
		tab.parentNode.removeChild(tab);
	}

	function createTab(url){
		chrome.tabs.create({
			url: url
		});
	}

	function saveCurrentData() {
		chrome.storage.local.set({ tabs: data.tabs });
	}

	function deleteTab(id) {
		data.tabs.splice(id, 1);
		saveCurrentData();
	}

	function addTabToTable(tab, id) {
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
		tabDelete.setAttribute("data-id", id);
		tabDelete.classList.add("btn", "btn-danger", "tab-delete");
		tabDelete.innerHTML = "X";
		tabDiv.appendChild(tabDelete);
		tabDelete.onclick = function () {
			deleteTab(tabDelete.dataset.id);
			deleteTabFromTable(tabDiv);
		};
	}

	function addTabsToTable(tabs) {
		let id = 0;
		for (tab of tabs) {
			addTabToTable(tab, id);
			id++;
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

	$("save_session").addEventListener("click", () => {
		chrome.tabs.query({}, function (tabs) {
			chrome.storage.local.set({ session: tabs });	
			createTab();
			for(tab of tabs){
				chrome.tabs.remove(tab.id);
			}
		});
	});

	$("load_session").addEventListener("click", () => {
		chrome.storage.local.get({ session: [] }, function (data) {
			for(tab of data.session){
				createTab(tab.url);
			}
		});
	});

	//TESTING PURPOSE ONLY
	$("clear").addEventListener("click", () => {
		chrome.storage.local.clear(function () {});
	});
});
