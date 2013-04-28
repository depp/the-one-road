var audio_files = {};
var music_track = null;

function audio_obj(path) {
    if (path in audio_files) {
	obj = audio_files[path];
    } else {
	obj = document.createElement('audio');
	var src = document.createElement('source');
	if (obj.canPlayType('audio/mpeg;')) {
	    src.type = 'audio/mpeg';
	    src.src = path + '.mp3';
	} else {
	    src.type = 'audio/ogg';
	    src.src = path + '.ogg';
	}
	obj.appendChild(src);
    }
    audio_files[path] = obj;
    return obj;
}

function music_ended() {
    this.currentTime = 0;
    this.play();
}

function music_play(track) {
    var obj = audio_obj(track);
    if (obj == music_track)
	return;
    if (music_track) {
	music_track.removeEventListener('ended', music_ended);
	music_track.stop();
    }
    obj.addEventListener('ended', music_ended);
    obj.play();
    music_track = obj;
}

music_play('audio/background');
