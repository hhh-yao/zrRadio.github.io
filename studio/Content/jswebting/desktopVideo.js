var EudicDesktopVideo = (function () {



    function initPage() {
        var tingName = document.body.getAttribute('data');

        var wrap = document.createElement('div');
        var bodyContent = document.body.innerHTML;
        var h1 = document.getElementsByTagName('h1')[0].innerHTML;
        wrap.className = 'wrap';
        wrap.innerHTML = '<div class="container"><div class="titleBar">当前播放：' + h1 + '</div><div class="contentInfor"></div><div class="contents">' + bodyContent + '</div></div>';
        document.body.innerHTML = '';
        var headerBar = document.createElement('div');
        headerBar.className = 'headerBar';
        headerBar.innerHTML = '<div class="tingName"><a href="/ting">' + tingName + '</a></div>';

        document.body.appendChild(headerBar);
        document.body.appendChild(wrap);

        var contentInfor = document.getElementsByClassName('contentInfor')[0],
            video = document.getElementsByTagName('video');
        contentInfor.appendChild(video[0]);
        var contentInforData = contentInfor.innerHTML;
        contentInforData += '<div class="software" id="software"><a class="link" href="/ting#download" target="_blank"></a><p>下载《' + tingName + '》客户端</p><dl><dt>更多精彩内容</dt><dd class="desktop"><span class="img"></span>桌面版下载</dd><dd class="phone"><span class="img"></span>手机版下载</dd></dl></div>';
        contentInfor.innerHTML = contentInforData;

        video[0].setAttribute('controls', 'true');
        video[0].setAttribute('playsinline', '');
        document.getElementsByClassName('content')[0].style.display = 'block';
    }

    var Media = (function() {
        var transfered = [],
            origin = {},
            playIndex = 0;

        var escape = 68,
            articleHeight,
            scrollTop;
        scrollFlag = true;

        function changeHighlight(index) {
            var $item = document.getElementsByClassName('sentence')[index],
                $highlight = document.getElementsByClassName('high_light');

            var ar = document.getElementById("article");
            if ($highlight.length > 0) {
                $highlight[0].className = 'sentence';
            }
            $item.className = 'sentence high_light';
            var offset = $item.offsetTop - escape;
            if (scrollFlag && (offset > articleHeight + scrollTop - 30 || offset + 30 < scrollTop)) {
                if (allowPlayFullMedia) {
                    ar.scrollTop = offset;
                }
               
            }
        }

        function getTimeItem(startTime) {
            var time, s, ms;
            time = startTime.split('.')[0].split(':');
            if (time.length < 3) {
                s = time[0] * 60 + time[1] * 100 / 100;
            } else {
                s = time[0] * 3600 + time[1] * 60 + time[2] * 100 / 100;
            }
            ms = startTime.split('.')[1];
            if (ms < 100) {
                ms *= 10;
            }
            ms /= 1000;
            s += ms;
            s = parseInt(s * 1000);
            return s;
        }

        function init() {
            initPage();
            var $article = document.getElementById('article'),
                articleContent = $article.innerHTML,
                time_range,startTime = [],
                v1 = articleContent.match(/[0-5][0-9]\:[0-5][0-9]\.[0-9][0-9]/g),
                v2 = articleContent.match(/([0-1][0-9]|2[0-3])\:[0-5][0-9]\:[0-5][0-9]/g);
            if (v1) {
                $article.innerHTML = articleContent.replace(/(["_,])(\d\d\:\d\d\.\d\d)/g, '$100:$2');
            }
            if (v2) {
                $article.innerHTML = articleContent.replace(/(["_,])(\d\d\:\d\d\:\d\d)/g, '$1$2.00');
            }


            var $content = document.getElementsByClassName('article')[0]
            var recoveryDiv = document.createElement('div');
            recoveryDiv.className = "recoveryDiv";
            recoveryDiv.setAttribute("style", "width:40px;height:40px;border-radius:20px;background:rgba(0,0,0,.1);position:absolute;bottom:10%;right:20px;display:none;")
            recoveryDiv.setAttribute("onclick", "scrollTo()")

            recoveryDiv.innerHTML = "<img style='width:100%' src='https://static.eudic.net/web/mobile/highlight_button_normal.png'>"
            $content.appendChild(recoveryDiv)


            var time_range = document.getElementById('J_CIKU_sentence_time_range'), timeItem;
            if (time_range) {
                startTime = time_range.value.split(',');
            }
            for (var i = 0, l = startTime.length; i < l; i++) {
                origin[startTime[i]] = i;
                timeItem = getTimeItem(startTime[i]);
                transfered.push(timeItem);
            }

            for (var i = 0, l = translate.translation.length; i < l; i++) {
                var trans = document.createElement('span');
                trans.className = 'trans';
                trans.innerHTML = translate.translation[i].text;
                var sentenceid = 'J_00:' + translate.translation[i].timestamp,
                    sentence = document.getElementById(sentenceid),
                    paragraph = sentence.parentNode,
                    transPos = paragraph.getElementsByTagName('div');
                if (transPos[0] != undefined) {
                    transPos[0].appendChild(trans);
                } else {
                    var transDiv = document.createElement('div');
                    transDiv.className = 'transDiv';
                    transDiv.appendChild(trans);
                    paragraph.appendChild(transDiv);
                }
                sentence.parentNode.appendChild(transDiv);
            };

            articleHeight = document.documentElement.offsetHeight - 140;
            scrollTop = $article.scrollTop;
            $article.onscroll = function() {
                scrollTop = $article.scrollTop;
                var $item = document.getElementsByClassName('high_light')[0];
                var offset = $item.offsetTop - 68;
                if ((offset > articleHeight + $article.scrollTop - 30 || offset + 30 < $article.scrollTop)) {
                    scrollFlag = false;
                    var recoveryDiv = document.getElementsByClassName("recoveryDiv")[0];
                    recoveryDiv.style.display = "block";
                }
            }
            window.onresize = function () {
                articleHeight = document.documentElement.offsetHeight - 140;
            }

            var video = document.getElementsByTagName('video')[0],
                len = transfered.length;

            var target, tagName, cname, $hightlight;
            $article.addEventListener('click', function (e) {
                target = e.target;
                tagName = target.tagName.toLowerCase();
                if (tagName == 'w' || tagName == 'd') {
                    target = target.parentNode;
                }
                cname = target.className;
                if (/sentence/.test(cname)) {
                    $hightlight = document.getElementsByClassName('high_light');
                    if ($hightlight.length > 0) {
                        $hightlight[0].className = 'sentence';
                    }
                    target.className = 'sentence high_light';
                    var time = target.getAttribute('data-starttime'),
                        timeItem = getTimeItem(time);
                    playIndex = origin[time];
                    video.currentTime = timeItem / 1000;
                    if (video.paused) {
                        video.play();
                    }
                }
            }, false);

            var recoveryDiv = document.getElementsByClassName("recoveryDiv")[0];
            recoveryDiv.onclick = function () {
                recoveryDiv.style.display = 'none';
                scrollFlag = true;
            }

            var currentTime, item;
            video.addEventListener('timeupdate', function () {
                currentTime = video.currentTime * 1000;
                for (var i = playIndex; i < len; i++) {
                    if (currentTime >= transfered[i] && currentTime <= transfered[i + 1]) {
                        changeHighlight(i);
                        break;
                    }
                    if (currentTime >= transfered[len - 1]) {
                        changeHighlight(len - 1);
                    }
                }
            }, false);
        }

        return {
            init: init
        }
    }());

    Media.init();


}());