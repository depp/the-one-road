var audio_files = {};
var music_track = null;
var sfx_file = null;

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

var sfx_end = null;
var sfx_queue = null;

function audio_timer() {
    if (sfx_end && sfx_file.currentTime >= sfx_end)
	sfx_file.pause();
}

function sfxPlay2() {
    var name = sfx_queue;
    sfx_queue = null;
    sfxPlay(name);
}

function sfxPlay(name) {
    if (!sfx_file || sfx_queue) {
	sfx_queue = name;
	if (!sfx_file) {
	    sfx_file = audio_obj('audio/sfx');
	    sfx_file.addEventListener('timeupdate', audio_timer, false);
	    sfx_file.addEventListener('canplaythrough', sfxPlay2, false);
	}
    } else {
	var info = JSON_sfx[name];
	if (!sfx_file.paused)
	    sfx_file.pause();
	sfx_file.currentTime = info[0];
	sfx_end = info[1];
	sfx_file.play();
    }
}
