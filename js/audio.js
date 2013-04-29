var audio_files = {};
var music_track = null;
var music_tracknum = null;

MUSIC_TRACKS = ['music/background', 'music/battle', 'music/crystal',
		'music/death']

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

function music_play(tracknum, loop) {
    if (music_tracknum === tracknum)
	return;
    if (tracknum === null) {
	music_track.removeEventListener('ended', music_ended);
	music_track.pause();
	music_track = null;
	music_tracknum = null;
	return;
    }
    var obj = audio_obj(MUSIC_TRACKS[tracknum]);
    if (obj == music_track)
	return;
    if (music_track) {
	music_track.removeEventListener('ended', music_ended);
	music_track.pause();
    }
    if (loop)
	obj.addEventListener('ended', music_ended);
    obj.play();
    music_track = obj;
    music_tracknum = tracknum;
}

function sfxPlay2() {
    this.play();
    this.removeEventListener('canplaythrough', sfxPlay2, false)
}

var SFX_COUNTRE = 0;
function sfxPlay(name) {
    var obj = audio_obj('sfx/' + name);
    console.log('play ' + name + ' ' + SFX_COUNTRE++);
    if (obj.readyState < 2) {
	obj.addEventListener('canplaythrough', sfxPlay2, false);
    } else {
	if (!(obj.paused || obj.ended)) {
	    obj.currentTime = 0;
	} else {
	    obj.play();
	}
    }
}
