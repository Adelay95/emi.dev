function setTab(name) {
	if (name == "map") {
		setMap();
	}
	if (name != "edit") {
		editing = -1;
	} else {
		if (editing == -1) {
			copyEditedMoves = true;
			clearEdits();
		} else {
			copyEditedMoves = false;
		}
		updateEdit();
	}
	var tabs = document.getElementsByClassName("tab");
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].style.display = "none";
	}
	document.getElementById(name).style.display = "block";
}

document.getElementById("search-box").oninput = function (event) {
	var v = event.target.value;
	updateSearch(v);
}

document.ondrop = function (event) {
	if (event.dataTransfer.files) {
		var file = event.dataTransfer.files[0];
		readFile(file);
	}
	event.preventDefault();
}

document.ondragover = function (event) {
	event.preventDefault();
}

document.getElementById("badges").oninput = function (event) {
	updateBadges();
}

if (localStorage.getItem("box")) {
	box = JSON.parse(localStorage.getItem("box"));
}

if (localStorage.getItem("dead-box")) {
	deadBox = JSON.parse(localStorage.getItem("dead-box"));
}

if (localStorage.getItem("badges")) {
	badges = parseInt(localStorage.getItem("badges"));
}

var editInputs = document.getElementsByClassName("poke-edit-input");
for (let i in editInputs) {
	editInputs[i].oninput = function (event) {
		if (event.target.id.includes("edit-move")) {
			copyEditedMoves = false;
		}
		updateEdit();
	}
}

document.getElementById("badges").value = badges;

updateSearch(document.getElementById("search-box").value);

fetchData();