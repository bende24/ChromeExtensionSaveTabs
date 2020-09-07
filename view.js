export default class View {
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
