var myAduio = document.getElementsByTagName('audio')[0];
var divLyrics = document.getElementsByClassName('div-lyrics')[0];
var divTitle = document.getElementsByClassName('div-title')[0];
var lyricsTime = document.getElementsByClassName('lyrics-time')[0];
var lyricsTime_a = lyricsTime.getElementsByTagName('a');
var progressTime = document.getElementsByClassName('time')[0];
var nowLine = 0;
var lyricsMove = false;
var playState = false;
var lyrics, lyricsStyle, lyricsFirst, rollT;
var timeArray1 = new Array();
var timeArray2 = new Array();
var timeInterval = new Array();
var index=0;
window.onload = function () {
	initialLyrics();
	lyricsStyle = getComputedStyle(lyricsFirst, null);
	setLyrics(0);
	setMouseEvent();
	setTimeText();
};
function ChangeImg() {
	index++;
	var a=document.getElementsByClassName("img-slide");
	if(index>=a.length) index=0;
	for(var i=0;i<a.length;i++){
		a[i].style.display='none';
	}
	a[index].style.display='block';
}
//设置定时器，每隔两秒切换一张图片
setInterval(ChangeImg,5000);
// 设置事件
function setMouseEvent() {
	// 歌词拖拽
	let lyrics_Y, line;
	divLyrics.onmousedown = function (e) {
		if (lyricsMove == false) {
			lyricsTime_a[0].style.display = lyricsTime_a[1].style.display = lyricsTime.style.display =
				'block';
			lyricsMove = true;
		}
		lyrics_Y = parseInt(lyricsStyle.marginTop);
		document.onmousemove = function (event) {
			lyricsFirst.style.marginTop =
				event.clientY - (e.clientY - lyrics_Y) + 'px';
			line = Math.floor(-(parseInt(lyricsStyle.marginTop) - 170) / 34);
			if (line < 0) {
				line = 0;
			} else if (line > lyrics.length - 1) {
				line = lyrics.length - 1;
			}
			lyricsTime_a[1].innerText = timeArray2[line];
		};
		document.onmouseup = function () {
			var lyrics_Y1 = parseInt(lyricsStyle.marginTop);
			setTimeout(function () {
				if (parseInt(lyricsStyle.marginTop) == lyrics_Y1) {
					lyricsMove = false;
					setLyrics(nowLine);
					lyricsTime_a[0].style.display = lyricsTime_a[1].style.display = lyricsTime.style.display =
						'none';
				}
			}, 1000);
			document.onmousemove = null;
			document.onmouseup = null;
		};
		// 防止选中文字
		return false;
	};

	// 音量控制
	let volume_now = document.getElementsByClassName('volume-now')[0];
	let volume_back = document.getElementsByClassName('volume-back')[0];
	let volume_text = document.getElementsByClassName('volume-text')[0];
	let volume_a = document.getElementsByClassName('volume')[0];
	volume_back.onmousedown = function (e) {
		volume_now.style.width = e.offsetX + 'px';
		myAduio.volume = e.offsetX / 100;
		volume_text.innerText = volume_now.clientWidth;
		volume_back.onmousemove = function (ev) {
			let volume = ev.offsetX;
			if (volume > 100) {
				volume = 100;
			}
			volume_now.style.width = volume + 'px';
			myAduio.volume = volume / 100;
			volume_text.innerText = volume_now.clientWidth;
		};
		document.onmouseup = function () {
			if (myAduio.volume == 0) {
				volume_a.style.backgroundImage = 'url(mute.png)';
			} else {
				volume_a.style.backgroundImage = 'url(volume.png)';
			}
			volume_back.onmousemove = null;
			document.onmouseup = null;
		};
		return false;
	};

	// 进度控制
	let progress_now = document.getElementsByClassName('progress-now')[0];
	let progress_bar = document.getElementsByClassName('progress-bar')[0];
	progress_bar.onmousedown = function (e) {
		progress_now.style.width = e.offsetX + 'px';
		myAduio.pause();
		myAduio.currentTime =
			(e.offsetX * myAduio.duration) / progress_bar.clientWidth;
		setTimeText();
		progress_bar.onmousemove = function (ev) {
			let progress = ev.offsetX;
			if (progress > progress_bar.clientWidth) {
				progress = progress_bar.clientWidth;
			}
			progress_now.style.width = progress + 'px';
			myAduio.currentTime =
				(progress * myAduio.duration) / progress_bar.clientWidth;
			setTimeText();
		};
		document.onmouseup = function () {
			myAduio.play();
			for (var i = 0; i < timeArray1.length; i++) {
				if (myAduio.currentTime < timeArray1[i]) {
					nowLine = i - 1;
					setLyrics(i - 2);
					timeInterval[nowLine] =
						timeArray1[nowLine + 1] - myAduio.currentTime;
					setPlay(true);
					break;
				}
			}
			progress_bar.onmousemove = null;
			document.onmouseup = null;
		};
		return false;
	};

	let goto = document.getElementsByClassName('goto')[0];
	goto.onmouseup = function () {
		nowLine = line;
		myAduio.currentTime = timeArray1[line];
		setLyrics(line - 1);
		setPlay(true);

		lyricsMove = false;
		lyricsTime_a[0].style.display = lyricsTime_a[1].style.display = lyricsTime.style.display =
			'none';

		document.onmouseup = null;
	};
}

// 设置播放状态
function setPlay(state) {
	var play_pause = document.getElementsByClassName('play-pause')[0];
	if (state == null) {
		state = myAduio.paused;
	}
	clearTimeout(rollT);
	if (state == true) {
		myAduio.play();
		play_pause.style.backgroundImage = 'url(play.png)';
		playState = true;
		setTimeText();
		lyricsRoll();
		setProgress();
		// 开始播放后要重新将时间间距改回来，不然下次播放计时器会出错
		timeInterval[nowLine] = timeArray1[nowLine + 1] - timeArray1[nowLine];
	} else {
		myAduio.pause();
		play_pause.style.backgroundImage = 'url(pause.png)';
		playState = false;
		timeInterval[nowLine] = timeArray1[nowLine + 1] - myAduio.currentTime;
	}
}

// 设置音量
function setVolume(volume) {
	myAduio.volume = volume;
}

// 设置静音
function setMuted() {
	let volume_now = document.getElementsByClassName('volume-now')[0];
	let volume_text = document.getElementsByClassName('volume-text')[0];
	let volume_a = document.getElementsByClassName('volume')[0];
	if (myAduio.muted == true) {
		myAduio.muted = false;
		volume_a.style.backgroundImage = 'url(volume.png)';
		volume_now.style.width = myAduio.volume * 100 + 'px';
		volume_text.innerText = myAduio.volume * 100;
	} else {
		myAduio.muted = true;
		volume_a.style.backgroundImage = 'url(mute.png)';
		volume_now.style.width = '0';
		volume_text.innerText = '0';
	}
}

// 歌词回弹
function lyricsRebound(lyricsTop) {
	if (parseInt(lyricsStyle.marginTop) != nowLine * -34 + 136) {
		if (lyricsTop == null) {
			lyricsTop = nowLine * -34 + 136;
		}
		let lyrics_animation = lyricsFirst.animate(
			[
				{
					marginTop: lyricsStyle.marginTop,
				},
				{
					marginTop: lyricsTop + 'px',
				},
			],
			{
				duration: 500,
			}
		);
		lyrics_animation.addEventListener(
			'finish',
			function () {
				lyricsFirst.style.marginTop = lyricsTop + 'px';
			},
			false
		);
	}
}

// 初始化歌词
function initialLyrics() {
	let sp = divTitle.getElementsByTagName('span')[0];
	let ar = divTitle.getElementsByTagName('span')[1];
	let ti = divTitle.getElementsByTagName('h1')[0];
	let lyricsData, timeString;
	let lyricsArray = new Array();
	// 清除数组
	timeArray1.splice(0, timeArray1.length);
	timeArray2.splice(0, timeArray2.length);
	lyricsArray.splice(0, lyricsArray.length);
	// 按相同格式放入歌词更换歌曲即可达到相同效果
	lyricsData =
		'[ar]韩安旭\n[ti]每日新闻\n[sp]每日新闻\n[00:00.74]韩安旭 - 每日新闻\n[00:01.76]稿：尤雅琪\n[00:02.76]后期：胜屿\n[00:17.62]夏天到来，社会时事也如这气温一样火热地发生着\n[00:24.11]快来看看5月上旬都发生了什么吧\n[00:30.11]相信关注国内娱乐圈或者经常看微博热搜\n[00:34.11]的朋友们前几日都看到过这样一条新闻：\n[00:40.11]北京市广播电视局责令爱奇艺暂停《青春有你》第三季节目录制。\n[00:48.11]这档节目被叫停的其中一个重要原因，就要属我们下面看到的内容。\n[00:57.11]月初，一段一群人受雇佣，将牛奶瓶盖一一拆开，\n[01:04.11]并将牛奶倒入沟渠的视频在网上热传，引起了网友的热议。\n';
	// 文本.split('分隔符')，用于分割文本
	lyricsArray = lyricsData.split('\n');
	// 添加歌曲信息
	ar.innerText = lyricsArray[0].split(']')[1];
	ti.innerText = lyricsArray[1].split(']')[1];
	sp.innerText = '新闻';//lyricsArray[2].split(']')[1];
	// 添加歌词
	for (var i = 3; i < lyricsArray.length; i++) {
		if (i == 3) {
			divLyrics.innerHTML +=
				'<p style="margin-top: 100%;color:#5192fe;">' +
				lyricsArray[i].split(']')[1] +
				'</p>';
		} else {
			divLyrics.innerHTML +=
				'<p>' + lyricsArray[i].split(']')[1] + '</p>';
		}
	}

	// 获取后续需要使用的变量
	lyricsFirst = divLyrics.getElementsByTagName('p')[0];
	lyrics = divLyrics.getElementsByTagName('p');

	// 计算每局歌词所在的秒数
	timeArray1.push(0);
	for (var i = 0; i < lyrics.length; i++) {
		timeString = lyricsArray[i + 3].substring(1, 9).split(':');
		timeArray1.push(
			parseFloat(timeString[0]) * 60 + parseFloat(timeString[1])
		);
	}

	// 计算时间间隔，将时间从秒数改为分钟+秒数
	for (var i = 0; i < timeArray1.length - 1; i++) {
		timeInterval[i] = timeArray1[i + 1] - timeArray1[i];
		if (Math.floor(timeArray1[i] % 60) < 10) {
			timeArray2.push(
				Math.floor(timeArray1[i] / 60) +
					':0' +
					Math.floor(timeArray1[i] % 60)
			);
		} else {
			timeArray2.push(
				Math.floor(timeArray1[i] / 60) +
					':' +
					Math.floor(timeArray1[i] % 60)
			);
		}
	}
}

// 设置歌词位置
function setLyrics(line) {
	for (let i = 0; i < lyrics.length; i++) {
		lyrics[i].style.color = '#000';
	}
	lyrics[line].style.color = '#5192fe';
	let lyrics_animation = lyrics[0].animate(
		[
			{
				marginTop: lyricsStyle.marginTop,
			},
			{
				marginTop: line * -34 + 136 + 'px',
			},
		],
		{
			duration: 100,
		}
	);
	lyrics_animation.addEventListener(
		'finish',
		function () {
			lyrics[0].style.marginTop = line * -34 + 136 + 'px';
		},
		false
	);
}

// 歌词滚动
function lyricsRoll() {
	rollT = setTimeout(function () {
		if (nowLine < lyrics.length && myAduio.paused == false) {
			if (lyricsMove == false) {
				setLyrics(nowLine);
			}
			nowLine += 1;
			lyricsRoll();
		}
	}, timeInterval[nowLine] * 1000);
}

// 设置进度文本
function setTimeText() {
	var nowTime = myAduio.currentTime;
	var allTime = myAduio.duration;
	// 计算时间，若为个位数，补0
	if (Math.floor(nowTime % 60) < 10) {
		nowTime = Math.floor(nowTime / 60) + ':0' + Math.floor(nowTime % 60);
	} else {
		nowTime = Math.floor(nowTime / 60) + ':' + Math.floor(nowTime % 60);
	}
	if (Math.floor(allTime % 60) < 10) {
		allTime = Math.floor(allTime / 60) + ':0' + Math.floor(allTime % 60);
	} else {
		allTime = Math.floor(allTime / 60) + ':' + Math.floor(allTime % 60);
	}
	progressTime.innerText = nowTime + '/' + allTime;
	// 每0.1秒执行一次
	if (myAduio.paused == false) {
		setTimeout(setTimeText, 100);
	}
}

// 设置进度条进度
function setProgress() {
	let progress_now = document.getElementsByClassName('progress-now')[0];
	let progress_bar = document.getElementsByClassName('progress-bar')[0];
	let progress = Math.floor(
		(myAduio.currentTime / myAduio.duration) * progress_bar.clientWidth
	);
	progress_now.style.width = progress + 'px';
	if (myAduio.paused == false) {
		setTimeout(setProgress, 100);
	}
}

// 获取网页属性
function getDocument(attribute) {
	if (attribute == 'sT') {
		return document.documentElement.scrollTop;
	} else if (attribute == 'sL') {
		return document.documentElement.scrollLeft;
	} else if (attribute == 'sH') {
		return document.documentElement.scrollHeight;
	} else if (attribute == 'sW') {
		return document.documentElement.scrollWidth;
	} else if (attribute == 'cH') {
		return document.documentElement.clientHeight;
	} else if (attribute == 'cW') {
		return document.documentElement.clientWidth;
	}
}
