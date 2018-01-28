const { remote } = require('electron')
const { Menu } = remote;
const { MenuItem } = remote;
var contextMenu = new Menu();
const path = require('path');

const fs = require('fs')

contextMenu.append(new MenuItem({
    label: '追加',
    click: function() {
        console.log();
    }
}))

window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.popup(remote.getCurrentWindow());
}, false);

var MusicQueue = {
    events: {},
    queue: [],
    current: null,
    enqueue: function(music) {
        this.queue.push(music);
        this.emit('enqueue', music);
        return this.queue.length;
    },
    dequeue: function() {
        var music = this.queue.shift();
        this.emit('dequeue', music);
        return music;
    },
    remove: function(idx) {
        var music = this.queue.splice(idx, 1);
        this.emit('remove', music);
        return music;
    },
    emit: function(ev, param) {
        if (this.events[ev]) {
            this.events[ev].forEach((fn, i) => {
                fn(param);
                if (fn.once) { delete this.events[ev][i] }
            })
        }
    },
    on: function(ev, fn) {
        this.events[ev] ? this.events[ev].push(fn) : this.events[ev] = [fn];
    },
    once: function(ev, fn) {
        fn.once = true;
        this.on(ev, fn)
    },
    play: function() {
        if (this.current) {
			this.current.stop();
        }
        var music = this.loopFlag?this.currentMusic:this.dequeue();
        if (!music) { return false }
		this.current = context.createBufferSource();
		this.current.buffer = music.buffer;
		this.current.connect(this.node);
		this.current.start(0);
		music.source = this.current
		this.currentMusic = music
		this.current.onended = ()=>{
			this.emit('end',music);
		}
		this.emit('play',music);
		return this.current;
    },
    pause: function() {
        if (!this.current) {
			return false;
        }
        if(this.stoped){return false}
		this.stoped = true;
		context.suspend()
		return true;
    },
    resume:function(){
		if(!this.current){return false}
		if(!this.stoped){return false}
		this.stoped = false;
		context.resume()
		return true;
    },
    init: function(node) {
        this.node = node;
    },
    stoped:false,
    loopFlag: false,
    pausetime:-1
};

MusicQueue.on('end',(music)=>{
	if(window.recycle){
		MusicQueue.enqueue(music);
	}
	if(window.repeat){
		MusicQueue.loopFlag = true;
	}
	MusicQueue.play();
})

var Music = function(_option) {};

Music.prototype.loadByFile = function(dir) {
	dir = dir.replace(/\\/g,"/");
	return new Promise((resolve,reject)=>{
		fs.readFile(dir, (err, data) => {
			window.context.decodeAudioData(Music.toArrayBuffer(data), (buffer) => {
			    if(err){reject(err);return}
			    this.buffer = buffer;
			    this.path = dir;
			    var arr = dir.split('/');
			    this.name = arr[arr.length-1]
			    resolve();
		    })
	    })
	})
}


Music.toArrayBuffer = function(buf) {
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}


window.addEventListener('load', () => {
    window.context = new AudioContext;
    var gainNode = context.createGain();
    gainNode.gain.value = 0.5
    gainNode.connect(context.destination);
    MusicQueue.init(gainNode);
})