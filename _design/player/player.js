/////////////////////////////////////
var divname = "playera";
/////////////////////////////////////
var hls = new Hls({
	capLevelToPlayerSize: true,
	startLevel: 5,
	maxBufferLength: 8,
	liveSyncDurationCount: 2
});
var hlssup = false;
var xhrsupp = false;
var curPublisher = null;
var curQality = null;
var srclist = null;
var pos = null;
var ispaused = true;
var holding = false;
var moveValue = null;
var justHidden = false;
var progressactive = false;
var volumeactive = false;
var muted = false;
var notmutedvolume = 1;
var ontitle = true;
var j;
var v;
var isLive = false;
window.onload = function() {
	document.getElementById(divname).innerHTML = '<video class="playerv" id="video" preload="metadata" controls poster="/_design/player/placeholder.png" style=width: 100%;"></video>';
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/_design/player/player.html?_=' + new Date().getTime(), true);
	xhr.onload = function() {
		xhrsupp = true;
		if (this.readyState !== 4) return;
		if (this.status !== 200) return;
		document.getElementById(divname).innerHTML = this.responseText;
		initlist();
	};
	xhr.send();

};

function initlist() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'info.json?_=' + new Date().getTime(), true);
	xhr.onreadystatechange = function() {
		if (this.readyState !== 4) return;
		if (this.status !== 200) return;
		srclist = JSON.parse(this.responseText);
		document.getElementById("numbers").innerHTML = srclist["options"]["numbers"];
		document.getElementById("title").innerHTML = srclist["options"]["title"];
		if (srclist["options"]["next"] != "ыть" && srclist["options"]["next"] != "") {
			document.getElementById("next").setAttribute("href", srclist["options"]["next"]);
		} else {
			document.getElementById("next").style.display = "none";
		}
		if (srclist["options"]["previous"] != "ыть" && srclist["options"]["previous"] != "") {
			document.getElementById("previous").setAttribute("href", srclist["options"]["previous"]);
		} else {
			document.getElementById("previous").style.display = "none";
		}
		if (srclist["options"]["live"] && srclist["options"]["live"] == true) {
			isLive = true;
			document.getElementById("progressbar").style.display = "none";
		}
		curPublisher = srclist["best"]["publisher"];
		curQality = srclist["best"]["quality"];
		radiopub();
		radioqu();
		init();
	};
	xhr.send();
}

function init() {
	v = document.getElementById("video");
	if (!Hls.isSupported()) {
		try {
			if (!window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"')) {

				if (!v.canPlayType("application/x-mpegURL")) {
					alert("Ваше устройство или браузер не поддерживает формат видео, в котором мы храним эпизоды.\nСообщите разработчикам название и версию браузера, операционной системы.\nКод ошибки: 100");
				} else {
					console.log("Ваш браузер не поддерживается нашим плеером, попытка запустить встроенный плеер браузера.\nЕсли видео всё-равно не воспроизводится ,то сообщите разработчикам название и версию браузера, операционной системы.\nКод ошибки: 100");
					v.src = srclist["publisher"][curPublisher][curQality];
				}
			} else {
				if (!v.canPlayType("application/x-mpegURL")) {
					console.log("Попытка запустить встроенный плеер\nКод ошибки: 101");
					v.src = srclist["publisher"][curPublisher][curQality];
				} else {
					console.log("Ваш браузер не поддерживается нашим плеером, попытка запустить встроенный плеер браузера.\nЕсли видео всё-равно не воспроизводится ,то сообщите разработчикам название и версию браузера, операционной системы.\nКод ошибки: 101");
					v.src = srclist["publisher"][curPublisher][curQality];
				}
			}
		} catch (e) {
			console.log("Ваш браузер не поддерживается нашим плеером, попытка запустить встроенный плеер браузера.\nЕсли видео всё-равно не воспроизводится ,то сообщите разработчикам название и версию браузера, операционной системы.\nКод ошибки: 102");
			v.src = srclist["publisher"][curPublisher][curQality];
		}
	} else {
		hlssup = true;
		//hls.autoLevelCapping = 1;
		if (!isLive) {
			hls.loadSource(srclist["publisher"][curPublisher][curQality]);
			hls.attachMedia(v);
		}
	}
	document.getElementById(divname).setAttribute("tabindex", "-1");
	document.getElementById(divname).onkeydown = keypresslistener;
	document.getElementById("button-gear").addEventListener("click", gear);
	document.getElementById("settings-close").addEventListener("click", gear);
	document.getElementById("button-volume").addEventListener("click", muteb);
	document.getElementById("button-mute").addEventListener("click", muteb);
	document.getElementById(divname).addEventListener("contextmenu", function(e) {
		gear();
		e.preventDefault();
	});
	v.addEventListener("ended", function() {
		ontitle = true;
		document.getElementById('poster').style.display = "block";
		document.getElementById('play-button').style.display = "";
		document.getElementById("upper-panel").style.animation = 'none';
		document.getElementById("upper-panel").style.webkitAnimation = 'none';
		setTimeout(function() {
			document.getElementById("upper-panel").style.webkitAnimation = '';
			document.getElementById("upper-panel").style.animation = '';
			document.getElementById("upper-panel").style.setProperty("animation-play-state", "paused");
		}, 100);


		document.getElementById("lower-panel").style.animation = 'none';
		document.getElementById("lower-panel").style.webkitAnimation = 'none';
		setTimeout(function() {
			document.getElementById("lower-panel").style.webkitAnimation = '';
			document.getElementById("lower-panel").style.animation = '';
			document.getElementById("lower-panel").style.setProperty("animation-play-state", "paused");
		}, 100);
	});
	v.addEventListener("waiting", function() {
		document.getElementById("loading").style.display = "block";
	});
	v.addEventListener("canplay", function() {
		document.getElementById("loading").style.display = "none";
	});
	document.getElementById('progress-slider').addEventListener('mousedown', function(e) {
		v.pause();
		holding = true;
		progressactive = true;
		movelistenerprogress(e);
		document.getElementById("seeking").style.display = "block";
		document.getElementById("lower-panel").style.setProperty("animation-play-state", "paused");
		document.addEventListener('mousemove', movelistenerprogress);
	});
	document.getElementById('progress-slider').addEventListener('mousemove', seekenglistener);
	document.getElementById('volume-slider').addEventListener('mousedown', function(e) {
		holding = true;
		volumeactive = true;
		movelistenervolume(e);
		document.getElementById('volume').style.visibility = "visible";
		document.getElementById("lower-panel").style.setProperty("animation-play-state", "paused");
		document.addEventListener('mousemove', movelistenervolume);
	});

	document.addEventListener('mouseup', function(e) {
		if(progressactive == true) {
			progressactive = false;

			document.getElementById("lower-panel").style.removeProperty("animation-play-state");
			document.getElementById("seeking").style.display = "";
			document.removeEventListener('mousemove', movelistenerprogress);
			if(holding) {
				v.currentTime = moveValue * v.duration;

				hls.startLoad(v.currentTime);
				//console.log(v.currentTime,moveValue,v.duration);
				holding = false;
				if(ontitle) playerp();
				if(ispaused == false) v.play();
			}
		} else if(volumeactive == true) {
			volumeactive = false;
			document.getElementById('volume').style.visibility = "";
			if(!ontitle) document.getElementById("lower-panel").style.removeProperty("animation-play-state");
			document.removeEventListener('mousemove', movelistenervolume);
			if(holding) {
				v.volume = moveValue;
				holding = false;
				if(v.volume > 0) {
					notmutedvolume = v.volume;
				}
			}
		}
	});

	v.addEventListener("timeupdate", function() {
		//console.log("time updated");
		document.getElementById("progress").style.width = (v.currentTime / v.duration * 100) + "%";
		var mins = Math.floor(v.currentTime / 60);
		var secs = Math.floor(v.currentTime - mins * 60);
		if(secs < 10) secs = "0" + secs;
		if(v.duration){
		var remDur = v.duration - v.currentTime;
		var minsRem = Math.floor(remDur / 60);
		var secsRem = Math.floor(remDur - minsRem * 60);
		if(secsRem < 10) secsRem = "0" + secsRem;
		document.getElementById("remaining").innerHTML = "-" + minsRem + ":" + secsRem;
		}
		document.getElementById("timecode").innerHTML = mins + ":" + secs;
	});
	v.addEventListener("progress", function() {
		//console.log("progress updated");
		var index = 0;
		for(index = 0; index < v.buffered.length - 1; index++) {
			if(v.buffered.start(index) <= v.currentTime && v.buffered.end(index) >= v.currentTime) break;
		}
		document.getElementById("progress-load").style.width = (v.buffered.end(index) / v.duration * 100) + "%";
	});

	document.getElementById('poster').style.backgroundImage = "url(" + srclist["options"]["poster"] + ")";

	document.getElementById("pub" + curPublisher).checked = true;
	document.getElementById("qu" + curQality).checked = true;
	v.addEventListener("dblclick", fs2);
	document.getElementById("button-play").addEventListener("click", playerp);
	document.getElementById("button-pause").addEventListener("click", playerp);
	//document.getElementById("play-buttons").addEventListener("click", playerp);
	document.getElementById("button-fullscreen").addEventListener("click", fs2);
	v.addEventListener("click", playerp);
	document.getElementById("poster").addEventListener("click", playerp);
	radiopublistener();
	radioqulistener();


}

function keypresslistener(e) {

	switch(e.which) {
		case 32:
			e.preventDefault();
			playerp(); // space
			break;
		case 37:
			if(!isLive) {
				e.preventDefault();
				if(!e.ctrlKey) { // left
					v.currentTime -= 5;
					movelistenerprogress(e, -5);
				} else {
					document.getElementById('previous').click();
				}
			}
			break;
		case 38:
			e.preventDefault(); // up
			movelistenervolume(e, 5 * 0.01);
			break;
		case 39:
			if(!isLive) {
				e.preventDefault();
				if(!e.ctrlKey) { // right
					v.currentTime += 5;
					movelistenerprogress(e, 5);
				} else {
					document.getElementById('next').click();
				}
			}
			break;
		case 40:

			e.preventDefault(); // down
			movelistenervolume(e, -5 * 0.01);
			break;
		case 67:
			e.preventDefault();
			gear(); // c
			break;
		case 70:
			e.preventDefault();
			fs2(); // f
			break;
		case 77:
			e.preventDefault();
			muteb(); // m
			break;
		case 68:
			if(e.ctrlKey && e.altKey) {
				e.preventDefault();
				DebugScreen(); // D ebug
			}
			break;
		default:
			return; // exit this handler for other keys
	}
	var text = e.type +
		' keyCode=' + e.keyCode +
		' which=' + e.which +
		' charCode=' + e.charCode +
		' char=' + String.fromCharCode(e.keyCode || e.charCode) +
		(e.shiftKey ? ' +shift' : '') +
		(e.ctrlKey ? ' +ctrl' : '') +
		(e.altKey ? ' +alt' : '') +
		(e.metaKey ? ' +meta' : '') + "\n";
	console.log(text);
}

function radiopublistener() {
	var a = document.getElementsByName("publisher");
	for (var i = 0; i < a.length; i++) a[i].addEventListener("change", function() {
		play(this.value, curQality)
	});
}

function radioqulistener() {
	var a = document.getElementsByName("quality");
	for (var i = 0; i < a.length; i++) a[i].addEventListener("change", function() {
		play(curPublisher, this.value)
	});
}

function hide() {
	v.style.cursor = 'none';
	justHidden = true;
	setTimeout(function() {
		justHidden = false;
	}, 500);
}

function radiopub() {
	var is = false;
	for (var i = 1; i < srclist["publisher"].length; i++) {
		document.getElementById("publesher-raduo-groop").innerHTML += radiogen("publisher", "pub", i, srclist["publisher"][i]["name"], ((srclist["publisher"][i]["disabled"] && srclist["publisher"][i]["disabled"]==true) ? true : null));
		is = true;
	}
	document.getElementById("publesher-raduo-groop").innerHTML += radiogen("publisher", "pub", 0, srclist["publisher"][0]["name"], ((srclist["publisher"][0]["disabled"] && srclist["publisher"][0]["disabled"]==true) ? true : null));
	if(is == false) document.getElementById("publesher-raduo-groop").innerHTML += '<br>';
}

function radioqu() {
	document.getElementById("quality-raduo-groop").innerHTML = "";
	if (srclist["publisher"][curPublisher]["1080"])
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 1080, "Максимальное (1080p)");
	if (srclist["publisher"][curPublisher]["720"])
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 720, "Хорошее (720p)");
	if (srclist["publisher"][curPublisher]["480"])
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 480, "Выше среднего (480p)");
	if (srclist["publisher"][curPublisher]["380"])
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 380, "Среднее (380p)");
	if (srclist["publisher"][curPublisher]["240"])
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 240, "Плохое (240p)");
	if (srclist["publisher"][curPublisher]["144"])
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 144, "Ужасное (144p)");
	if (srclist["publisher"][curPublisher]["0"]) {
		document.getElementById("quality-raduo-groop").innerHTML += radiogen("quality", "qu", 0, "Подбирать автоматически");
	}
}

function fs2() {
	if(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		v.addEventListener('mousemove', fsmovelistener);
		v.addEventListener('mouseover', mouseoverlistener);
		v.addEventListener('mouseout', mouseoutlistener);
		//window.addEventListener("resize", resizelistener);
		launchFullscreen(document.getElementById(divname));
	} else {
		exitFullscreen();
		v.removeEventListener('mouseover', mouseoverlistener);
		v.removeEventListener('mouseout', mouseoutlistener);

		v.removeEventListener('mousemove', fsmovelistener)
		clearTimeout(j);
		//window.removeEventListener("resize", resizelistener);
		v.style.cursor = 'default';
	}
}

function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

function exitFullscreen() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if(document.msFullscreenElement) {
		document.msExitFullscreen();
	}
}

function fsmovelistener() {
	if(!justHidden) {
		justHidden = false;
		//console.log('move');
		clearTimeout(j);
		v.style.cursor = 'default';
		j = setTimeout(hide, 2000);
	}
}

function mouseoverlistener() {
	v.addEventListener('mousemove', fsmovelistener);
}

function mouseoutlistener() {
	v.removeEventListener('mousemove', fsmovelistener);
}

function seekenglistener(e, moveValue, x) {
	if(x == undefined) {
		var x = e.pageX - document.getElementById('progress-slider').getBoundingClientRect().left - window.pageXOffset; // or e.offsetX (less support, though)
	}
	if(moveValue == undefined) {
		var moveValue = (x / document.getElementById('progress-slider').offsetWidth);
		if(moveValue < 0) {
			moveValue = 0;
		} else if(moveValue > 1) moveValue = 1;
	}
	var mins = Math.floor(v.duration * moveValue / 60);
	var secs = Math.floor(v.duration * moveValue - mins * 60);
	if(secs < 10) secs = "0" + secs;
	if(mins < 10) mins = "0" + mins;
	document.getElementById("seektime").innerHTML = mins + ":" + secs;
	document.getElementById("seeking").style.left = x + "px";
}
/*function resizelistener() {
	if(v.offsetWidth > document.getElementById(divname).offsetWidth){
	v.style.height = "";
	v.style.width = "100%";
	} else {
	//v.style.height = "100%";
	//v.style.width = "";
	}
}*/

function movelistenerprogress(e, change) {
	if(!change) {
		var x = e.pageX - document.getElementById('progress-slider').getBoundingClientRect().left - window.pageXOffset; // or e.offsetX (less support, though)
		moveValue = (x / document.getElementById('progress-slider').offsetWidth);
	} else moveValue = v.currentTime / v.duration + change / v.duration;
	if(moveValue < 0) {
		moveValue = 0;
	} else if(moveValue > 1) moveValue = 1;
	if(x < 0) {
		x = 0;
	} else if(x > document.getElementById('progress-slider').offsetWidth) x = document.getElementById('progress-slider').offsetWidth;
	document.getElementById('progress').style.width = moveValue * 100 + "%";
	seekenglistener(e, moveValue, x)
	//console.log(x, moveValue, change);
}

function movelistenervolume(e, change) {
	if(!change) {
		var y = e.pageY - document.getElementById('volume-slider').getBoundingClientRect().top - window.pageYOffset; // or e.offsetY
		moveValue = (1 - y / document.getElementById('volume-slider').offsetHeight);
	} else moveValue = v.volume + change;
	if(moveValue < 0) {
		moveValue = 0;
	} else if(moveValue > 1) moveValue = 1;
	if(moveValue == 0) mute(true);
	if(moveValue > 0) mute(false);
	v.volume = moveValue;
	document.getElementById('volumewhite').style.height = (moveValue) * 100 + "%";
	//console.log(y, moveValue);
}

function muteb() {
	if(muted == false) {
		notmutedvolume = v.volume;
		muted = true;
		v.muted = true;
		document.getElementById('volumewhite').style.height = "0%";
		document.getElementById('button-mute').style.display = "block";
		document.getElementById('button-volume').style.display = "none";
	} else {
		muted = false;
		v.muted = false;
		document.getElementById('volumewhite').style.height = notmutedvolume * 100 + "%";
		v.volume = notmutedvolume;
		document.getElementById('button-mute').style.display = "none";
		document.getElementById('button-volume').style.display = "block";
	}
}

function mute(is) {
	if(is == true) {
		muted = true;
		v.muted = true;
		document.getElementById('button-mute').style.display = "block";
		document.getElementById('button-volume').style.display = "none";
	} else {
		muted = false;
		v.muted = false;
		document.getElementById('button-mute').style.display = "none";
		document.getElementById('button-volume').style.display = "block";
	}
}

function playerp() {
	if(!v.paused) {
		v.pause();
		if(isLive && hlssup) hls.stopLoad();
		document.getElementById("button-play").style.display = "block";
		document.getElementById("button-pause").style.display = "none";
		ispaused = v.paused;
	} else {
		document.getElementById("button-play").style.display = "none";
		document.getElementById("button-pause").style.display = "block";
		if (hlssup) hls.startLoad(startPosition = v.currentTime);
		if(isLive) play(curPublisher, curQality);
		v.play();
		ispaused = v.paused;
	}
	ontitle = false;
	document.getElementById('poster').style.display = "none";
	document.getElementById('play-button').style.display = "none";
	document.getElementById("upper-panel").style.removeProperty("animation-play-state");
	document.getElementById("lower-panel").style.removeProperty("animation-play-state");
}

function gear() {
	if(document.getElementById("settings")) {
		var obj = document.getElementById("settings");
		if(obj.style.display != "block") {
			obj.style.display = "block";
		} else obj.style.display = "none";
	}
}
function radiogen(name, id, value, innerText, isDisabled){
	return '<br><input id="'+ id + value + '" type="radio" name="' + name + '" value="' + value + '" ' + (isDisabled ? "disabled=disabled" : null) + '><label for="' + id + value + '"><span><span></span></span>' + innerText + '</label>';
}
function play(publisher, quality) {
	if(srclist["publisher"][publisher][quality]) {
		curQality = quality;
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["720"]) {
		curQality = "720";
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["480"]) {
		curQality = "480";
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["380"]) {
		curQality = "380";
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["240"]) {
		curQality = "240";
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["1080"]) {
		curQality = "1080";
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["144"]) {
		curQality = "144";
		curPublisher = publisher;
	} else if(srclist["publisher"][publisher]["0"]) {
		curQality = "0";
		curPublisher = publisher;
	} else {
		curPublisher = publisher;
		radioqu();
		radioqulistener();
		pos = v.currentTime;
		//alert("Ошибка: Дорожка не найдена.\nСообщите об этом разработчикам, которые указны в настройках, вместе с именем перевода и качеством, а так же, при возможности, с данными из консоли\n Код ошибки: 104");
		v.src = "/_design/player/publisher-unavailable.mp4"
		if(!isLive) v.currentTime = pos;
		document.getElementById("button-play").style.display = "block";
		document.getElementById("button-pause").style.display = "none";
		return false;
	}
	radioqu();
	radioqulistener();
	document.getElementById("pub" + curPublisher).checked = true;
	document.getElementById("qu" + curQality).checked = true;
	pos = v.currentTime;
	ispaused = v.paused;
	//hls.detachMedia();
	if (hlssup) {
		hls.loadSource(srclist["publisher"][curPublisher][curQality]);
		hls.attachMedia(v);
		hls.on(Hls.Events.MANIFEST_PARSED, function(event) {
			hls.startLoad(startPosition = v.currentTime);
		});
		hls.on(Hls.Events.MANIFEST_LOADED, function(event) {
			if (!isLive) v.currentTime = pos;
			if (ispaused == false) v.play();
		});
	} else {
		v.src = srclist["publisher"][curPublisher][curQality];
		var a = function(e) {
			v.removeEventListener("canplay", a);
			if (!isLive) v.currentTime = pos;
			if (ispaused == false) v.play();
			console.log('test', a);
		}
		v.addEventListener("canplay", a);
	}


}

function DebugScreen() {
	alert("тип дебаг");
}