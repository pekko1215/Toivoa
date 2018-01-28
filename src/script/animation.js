window.addEventListener('load', () => {
    (function() {
        var timer;
        var resized;
        var min = 160;
        var max = 400;
        document.getElementById('list-button').addEventListener('click', () => {
            if (timer) { return }
            if (!resized) {
                timer = setInterval(() => {
                    if (window.outerHeight < max) {
                        window.resizeBy(0, 10);
                    } else {
                        clearInterval(timer);
                        timer = null;
                        resized = true
                    }
                }, 10)
            } else {
                timer = setInterval(() => {
                    if (window.outerHeight > min) {
                        window.resizeBy(0, -10);
                    } else {
                        clearInterval(timer);
                        timer = null;
                        resized = false
                    }
                }, 10)
            }
        })
    })();
    (function() {
        var $playButton = document.getElementById('play-button');
        var $pauseButton = document.getElementById('pause-button');
        var $playButtonWrapper = document.getElementById('play-button-wrapper');
        var $pauseButtonWrapper = document.getElementById('pause-button-wrapper');
        var isStop = false;
        $pauseButtonWrapper.addEventListener('click', () => {
            if (isStop) { return };
            if (MusicQueue.pause()) {
                $pauseButton.classList.toggle('active')
                $pauseButtonWrapper.classList.toggle('active');
                $playButton.classList.toggle('active')
                $playButtonWrapper.classList.toggle('active');
                isStop = true;
            }
        })
        $playButtonWrapper.addEventListener('click', () => {
            if (!isStop) { return };
            if (MusicQueue.resume()) {
                $pauseButton.classList.toggle('active')
                $pauseButtonWrapper.classList.toggle('active');
                $playButton.classList.toggle('active')
                $playButtonWrapper.classList.toggle('active');
                isStop = false;
            }
        })
    })();
    (function() {
        var timer = null;
        MusicQueue.on('play', (music) => {
            if (timer) { clearInterval(timer) }
            var length = music.source.buffer.duration;
            var lengthtext = `${Math.floor(length/60)}:${('00'+Math.floor(length%60)).slice(-2)}`
            var starttime = music.source.context.currentTime;
            document.getElementById('title').innerText = music.name
            document.getElementById('time_under').innerText = lengthtext;

            function rewriter() {
                var currentTime = music.source.context.currentTime - starttime;
                if (currentTime > length) {
                    currentTime = length
                    clearInterval(timer);
                    timer = null;
                }
                var currenttext = `${Math.floor(currentTime/60)}:${('00'+Math.floor(currentTime%60)).slice(-2)}`
                document.getElementById('time_over').innerText = currenttext;
            }
            timer = setInterval(rewriter, 500);
            rewriter();
        })
    })();
    (function() {
        var $playlistContainer = document.getElementById('playlist-container');
        $playlistContainer.ondragover = function() {
			$playlistContainer.classList.add('drag')
			return false;
        }
        $playlistContainer.ondragleave = $playlistContainer.ondragend = function() {
			$playlistContainer.classList.remove('drag')
            return false;
        };
        $playlistContainer.ondrop = function(e) {
            e.preventDefault(); // イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
            $playlistContainer.classList.remove('drag')
            e.dataTransfer.types.forEach((type)=>{
				switch(type){
					case 'text/plain':
						break;
					case 'Files':
						for (var i = 0;i < e.dataTransfer.files.length;i++){
							var file = e.dataTransfer.files[i];
							if(fs.statSync(file.path).isDirectory()){

							}else{
								var music = new Music();
								music.loadByFile(file.path).then(()=>{
									MusicQueue.enqueue(music)
								})
							}
						}
						break;
				}
            })
            return false;
        };
    })();
    function reloadListDom(){
		var $tbody = document.getElementById('playlist_tbody');
		while ($tbody.firstChild)$tbody.removeChild($tbody.firstChild);
		MusicQueue.queue.forEach(music=>{
			var $tr = document.createElement('tr');
			var $nametd = document.createElement('td');
			var $pathtd = document.createElement('td');
			var $timetd = document.createElement('td');
			$nametd.innerText = music.name;
			$pathtd.innerText = music.path;
			var time = music.buffer.duration;
			$timetd.innerText = `${Math.floor(time/60)}:${('00'+Math.floor(time%60)).slice(-2)}`
			$tr.appendChild($nametd)
			$tr.appendChild($pathtd)
			$tr.appendChild($timetd);
			$tbody.appendChild($tr)
		})
    }
    MusicQueue.on('enqueue',reloadListDom);
    MusicQueue.on('dequeue',reloadListDom);
    (function(){
		var $recycleButton = document.getElementById('recycle-button')
		var $repeatButton = document.getElementById('repeat-button')
		$recycleButton.addEventListener('click',()=>{
			window.recycle = !window.recycle;
			$recycleButton.classList.toggle('active');
			if(window.repeat&&window.recycle){
				window.repeat = false;
				$repeatButton.classList.remove('active')
			}
		})
		$repeatButton.addEventListener('click',()=>{
			window.repeat = !window.repeat;
			$repeatButton.classList.toggle('active');
			if(window.repeat&&window.recycle){
				window.recycle = false;
				$recycleButton.classList.remove('active')
			}
		})
    })()
})