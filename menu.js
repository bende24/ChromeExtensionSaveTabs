let background = chrome.extension.getBackgroundPage();

function $(a) {
	return document.getElementById(a);
}

let temp = {
	tabs: [
		{
			favicon:
				"https://www.youtube.com/s/desktop/5718b32a/img/favicon_32.png",
			url:
				"https://www.youtube.com/watch?v=qDt-J0yHMS0&list=PLPdkBLbDPtqoHDcjUweIJqe6GKnOz0-Qw",
			name: "Computational Astrophysics",
		},
		{
			favicon:
				"https://www.youtube.com/s/desktop/5718b32a/img/favicon_32.png",
			url:
				"https://www.youtube.com/watch?v=PzwxxZJpb98&list=PLu02O8xRZn7xtNx03Rlq6xMRdYcQgEpar",
			name: "Computational Neuroscience",
		},
	],
};

let table = $("tab-container");

function addTabToTable(tab) {
	const { name, url, favicon } = tab;
	let tabDiv = document.createElement("div");
	tabDiv.classList.add("tab");
	$("tab-container").appendChild(tabDiv);

	let tabFavicon = new Image();
	tabFavicon.src = favicon;
	tabFavicon.className = "tabFavicon";
	tabDiv.appendChild(tabFavicon);

	let tabLabel = document.createElement("a");
	tabLabel.setAttribute("href", url);
	tabLabel.className = "tabLabel";
	tabLabel.innerHTML = name;
	tabDiv.appendChild(tabLabel);

	tabLabel.onclick = function () {
		window.open(url);
	};
}

function addTabsToTable(tabs) {
	for (tab of tabs) {
		addTabToTable(tab);
	}
}

function saveTab(tab) {
	chrome.storage.local.get(["tabs"], function (result) {
		result.tabs.push(tab);
		background.write(result.tabs);
		chrome.storage.local.set({ tabs: result.tabs });
	});
}

function initTabs() {
	let data = temp.tabs;
	chrome.storage.local.set({ tabs: data });
}

function initTable() {
	chrome.storage.local.get({ tabs: [] }, function (result) {
		addTabsToTable(result.tabs);
	});
}
//initTabs();
initTable();

$("add").addEventListener("click", () => {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		//chrome.tabs.remove(tabs[0].id);

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
