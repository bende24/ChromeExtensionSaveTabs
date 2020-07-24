function getData() {
	let loadedData;

	chrome.storage.local.get(["tabs"], function (result) {
		loadedData = result.key;
		console.log(loadedData);
	});

	console.log(loadedData);
	return loadedData;
}

function saveTab(data) {
	chrome.storage.local.set({ tabs : data }, function () {
		console.log("Value is set to " + data);
	});
}

function write(a){
	console.log(a);
}
