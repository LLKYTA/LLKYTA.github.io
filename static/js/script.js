 console.log('%cCopyright © 2024 zyyo.net',
	'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);
console.log('%c   /\\_/\\', 'color: #20128b; font-size: 20px;');
console.log('%c  ( o.o )', 'color: #20128b; font-size: 20px;');
console.log(' %c  > ^ <', 'color: #20128b; font-size: 20px;');
console.log('  %c /  ~ \\', 'color: #20128b font-size: 20px;');
console.log('  %c/______\\', 'color: #20128b; font-size: 20px;');
document.addEventListener('contextmenu', function(event) {
	event.preventDefault();
});
function handlePress(event) {
	this.classList.add('pressed');
}
function handleRelease(event) {
	this.classList.remove('pressed');
}
function handleCancel(event) {
	this.classList.remove('pressed');
}
var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function(button) {
	button.addEventListener('mousedown', handlePress);
	button.addEventListener('mouseup', handleRelease);
	button.addEventListener('mouseleave', handleCancel);
	button.addEventListener('touchstart', handlePress);
	button.addEventListener('touchend', handleRelease);
	button.addEventListener('touchcancel', handleCancel);
});
function toggleClass(selector, className) {
	var elements = document.querySelectorAll(selector);
	elements.forEach(function(element) {
		element.classList.toggle(className);
	});
}
function pop(imageURL) {
	var tcMainElement = document.querySelector(".tc-img");
	if (imageURL) {
		tcMainElement.src = imageURL;
	}
	toggleClass(".tc-main", "active");
	toggleClass(".tc", "active");
}
var tc = document.getElementsByClassName('tc');
var tc_main = document.getElementsByClassName('tc-main');
tc[0].addEventListener('click', function(event) {
	pop();
});
tc_main[0].addEventListener('click', function(event) {
	event.stopPropagation();
});
function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		while (cookie.charAt(0) == ' ') {
			cookie = cookie.substring(1, cookie.length);
		}
		if (cookie.indexOf(nameEQ) == 0) {
			return cookie.substring(nameEQ.length, cookie.length);
		}
	}
	return null;
}
function LoadHi() {
	fetch('https://v1.hitokoto.cn/?c=j&c=i')
		.then(response => response.json())
		.then(data => {
			const hitokoto = document.querySelector('#hitokoto_text')
			const hitokoto_from = document.querySelector('#hitokoto_from')
			// hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`
			if (data.from_who = "null") {
				hitokoto.from = "---" + data.from
			} else {
				hitokoto.from = "---" + data.from + " " + data.from_who
			}
			hitokoto.innerText = data.hitokoto
			hitokoto_from.innerText = hitokoto.from
			console.log(data)
		})
		.catch(console.error)
}
LoadHi()
document.addEventListener('DOMContentLoaded', function() {
	var html = document.querySelector('html');
	var themeState = getCookie("themeState") || "Light";
	var tanChiShe = document.getElementById("tanChiShe");
	function changeTheme(theme) {
		tanChiShe.src = "./static/svg/snake-" + theme + ".svg";
		html.dataset.theme = theme;
		setCookie("themeState", theme, 365);
		themeState = theme;
	}
	var Checkbox = document.getElementById('myonoffswitch')
	Checkbox.addEventListener('change', function() {
		if (themeState == "Dark") {
			changeTheme("Light");
		} else if (themeState == "Light") {
			changeTheme("Dark");
		} else {
			changeTheme("Dark");
		}
	});
	if (themeState == "Dark") {
		Checkbox.checked = false;
	}
	changeTheme(themeState);
	var fpsElement = document.createElement('div');
	fpsElement.id = 'fps';
	fpsElement.style.zIndex = '10000';
	fpsElement.style.position = 'fixed';
	fpsElement.style.left = '0';
	document.body.insertBefore(fpsElement, document.body.firstChild);
	var showFPS = (function() {
		var requestAnimationFrame = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		var fps = 0,
			last = Date.now(),
			offset, step, appendFps;
		step = function() {
			offset = Date.now() - last;
			fps += 1;
			if (offset >= 1000) {
				last += offset;
				// appendFps(fps);
				fps = 0;
			}
			requestAnimationFrame(step);
		};
		// appendFps = function(fpsValue) {
		// 	fpsElement.textContent = 'FPS: ' + fpsValue;
		// };
		step();
	})();
	//pop('./static/img/tz.jpg')
});
var pageLoading = document.querySelector("#zyyo-loading");
window.addEventListener('load', function() {
	setTimeout(function() {
		pageLoading.style.opacity = '0';
	}, 100);
});
// 	  数据结构一言
//{
//     "id": 9525,
//     "uuid": "b3444351-174c-4834-973c-6d68a41afb09",
//     "hitokoto": "火车是往前开的，去哪并不重要，重要的是窗外的风景。",
//     "type": "h",
//     "from": "爱情公寓",
//     "from_who": "吕子乔",
//     "creator": "郁离",
//     "creator_uid": 15811,
//     "reviewer": 4756,
//     "commit_from": "web",
//     "created_at": "1694464264",
//     "length": 25
// }
