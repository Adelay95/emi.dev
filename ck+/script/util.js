function getTinyPokemonDisplay(tp, extra = "") {
	var p = pokemonByName.get(tp.name);
	var v = '<div class="tiny-poke">';
	v += '<div class="tiny-poke-icon"><img src="' + getPokeImage(tp) + '"></div>';
	v += '<div class="tiny-poke-info">';
	v += '<div>' + pokeLink(p.name) + ' - Lvl ' + tp.level + ' @ ' + itemLink(tp.item) + '</div>';
	v += "<table><tr>";
	for (var i = 0; i < 4; i++) {
		if (i == 2) {
			v += "</tr><tr>";
		}
		if (i == 1 || i == 3) {
			v += "<td></td>";
		}
		if (i < tp.moves.length) {
			var color = "#ffffff";
			if (movesByName.has(tp.moves[i])) {
				var type = movesByName.get(tp.moves[i]).type
				if (tp.moves[i] == "hidden-power") {
					type = getHiddenPower(tp).type;
				}
				color = typeColors.get(type);
			}
			v += '<td><span class="move-emblem" style="background-color:' + color
				+ ';"></span>' + moveLink(tp.moves[i]) + '</td>';
		} else {
			// Zero width space to force formatting
			v += "<td>​</td>"
		}
	}
	v += "</tr>"
	//v += "<tr><td>HP</td><td>" + p.stats.hp + "</td><td> </td><td>SpA</td><td>" + p.stats.spa + "</td></tr>";
	//v += "<tr><td>Atk</td><td>" + p.stats.atk + "</td><td> </td><td>SpD</td><td>" + p.stats.spd + "</td></tr>";
	//v += "<tr><td>Def</td><td>" + p.stats.atk + "</td><td> </td><td>Spe</td><td>" + p.stats.spe + "</td></tr>";
	v += "</table>";
	var s = getPokeStat(tp, "spe");
	if (extra != "" && badges >= speedBadges) {
		s = parseInt(s * 1.125);
	}
	v += "<div>Spe: " + s;
	if (tp.dvs) {
		v += " DVs: ";
		v += tp.dvs.hp + " "
		v += tp.dvs.atk + "/"
		v += tp.dvs.def + " "
		v += tp.dvs.spa + "/"
		v += tp.dvs.spd + " "
		v += tp.dvs.spe
	}
	v += "</div>"
	v += extra;
	v += "</div></div>";
	return v;
}

function getPokeImage(poke, unownExtra = undefined) {
	var shiny = poke.name && isShiny(poke) ? "shiny" : "normal";
	if (poke.name) {
		poke = poke.name;
	}
	if (unownExtra !== undefined && poke == "unown") {
		poke += ["-b", "-u", "-n", "-n", "-y", "-q", "-t"][unownExtra];
	}
	return 'https://img.pokemondb.net/sprites/crystal/' + shiny + '/' + poke + '.png';
}

function getMoveName(move) {
	if (nameFormatting.has(move)) {
		return nameFormatting.get(move);
	}
	return fullCapitalize(move.replace(/-/g, " "));
}

function padNumber(s) {
	s = "" + s;
	if (s.length == 1) {
		return "00" + s;
	} else if (s.length == 2) {
		return "0" + s;
	}
	return s;
}

function fullCapitalize(s) {
	s = s.toLowerCase();
	if (nameFormatting.has(s)) {
		return nameFormatting.get(s);
	}
	return s.replace(/[-_]/g, " ").replace(/\w\S*/g, (word) => (word.replace(/^\w/, (c) => c.toUpperCase())));
}

function getTrainerName(s) {
	var m = s.match(/([^\s]+) ([^\s]+) \((\d+)\) ([^\s]+)/);
	if (m) {
		var tc = fullCapitalize(m[2]);
		var cn = fullCapitalize(m[3]);
		var tn = fullCapitalize(m[4]);
		if (tc == tn) {
			tn = "";
		}
		if (cn == "1") {
			if (!trainersByName.has(s.replace(/\(1\)/, "(2)"))) {
				cn = "";
			}
		} else if (!trainersByName.has(s.replace(/\(\d+\)/, "(1)"))) {
			cn = "";
		}
		return `${tc} ${tn} ${cn}`;
	}
	return s;
}

function isShiny(poke) {
	return getDv(poke, "def") == 10 && getDv(poke, "spa") == 10 && getDv(poke, "spe") == 10 && ((getDv(poke, "atk") & 2) == 2)
}

function getGender(poke) {
	atk = getDv(poke, "atk");
	p = pokemonByName.get(poke.name);
	if (p.gender.startsWith("f")) {
		var m = parseInt(parseFloat(p.gender.substring(1)) * 16 / 100);
		if (atk >= m) {
			return 2;
		} else {
			return 1;
		}
	} else {
		return 0;
	}
}

function getDv(poke, stat) {
	if (poke.dvs) {
		return poke.dvs[stat];
	}
	return 15;
}

function getEmptyStages() {
	return {
		"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0
	}
}

function getHiddenPower(poke) {
	function mod4(stat) {
		return (getDv(poke, stat) & 0b11);
	}
	function mSig(stat) {
		return (getDv(poke, stat) & 0b1000) >> 3;
	}
	var t = (mod4("atk") << 2) | mod4("def");
	var types = [
		"fighting", "flying", "poison", "ground",
		"rock", "bug", "ghost", "steel",
		"fire", "water", "grass", "electric",
		"psychic", "ice", "dragon", "dark"
	];
	var ty = types[t];
	var po = (((mSig("spa") + 2 * mSig("spe") + 4 * mSig("def") + 8 * mSig("atk")) * 5 + mod4("spa")) >> 1) + 31;
	return { type: ty, power: po };
}

function getSwitchPriority(enemy, player) {
	var prio = 0;
	if (hasSuperEffectiveMove(enemy, player))  {
		prio++;
	}
	if (hasTypeAdvantage(player, enemy)) {
		prio--;
	}
	return prio;
}

function hasSuperEffectiveMove(attacker, defender) {
	var pp = pokemonByName.get(defender.name);
	for (var i = 0; i < attacker.moves.length; i++) {
		var move = movesByName.get(attacker.moves[i]);
		var type = move.type;
		if (move.name.startsWith("hp-")) {
			type = "normal";
		}
		var eff = 1;
		eff *= getMatchup(type, pp.types[0]);
		if (pp.types.length > 1) {
			eff *= getMatchup(type, pp.types[1]);
		}
		if (eff > 1) {
			return true;
		}
	}
	return false;
}

function hasTypeAdvantage(attacker, defender) {
	var ap = pokemonByName.get(attacker.name);
	var dp = pokemonByName.get(defender.name);
	for (var i = 0; i < ap.types.length; i++) {
		var t = ap.types[i];
		var eff = 1;
		eff *= getMatchup(t, dp.types[0]);
		if (dp.types.length > 1) {
			eff *= getMatchup(t, dp.types[1]);
		}
		if (eff > 1) {
			return true;
		}
	}
	return false;
}

function getMatchup(attackType, defenseType) {
	if (typeMatchups.has(attackType)) {
		var map = typeMatchups.get(attackType);
		if (map.has(defenseType)) {
			return map.get(defenseType);
		}
	}
	return 1;
}

function hasPriority(poke) {
	if (poke.item == "quick-claw") {
		return true;
	}
	for (var i = 0; i < poke.moves.length; i++) {
		if (priorityMoves.has(poke.moves[i])) {
			return true;
		}
	}
	return false;
}

function getStages(c) {
	var inputs = document.getElementsByClassName(c);
	var stages = getEmptyStages();
	assignStage(stages, "atk", inputs[0]);
	assignStage(stages, "def", inputs[1]);
	assignStage(stages, "spa", inputs[2]);
	assignStage(stages, "spd", inputs[3]);
	assignStage(stages, "spe", inputs[4]);
	return stages;
}

function assignStage(stages, s, v) {
	var i = parseInt(v.value);
	if (isNaN(i) || i < -6 || i > 6) {
		return;
	}
	stages[s] = i;
}

function updateBadges() {
	this.badges = parseInt(document.getElementById("badges").value);
	localStorage.setItem("badges", badges);
	updateCalc();
	updateBox();
}

function closePopup() {
	document.getElementById("info-popup").innerHTML = "";
}