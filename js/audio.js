var audio_files = {};
var music_track = null;
var music_tracknum = null;

MUSIC_TRACKS = ['music/background', 'music/battle', 'music/crystal',
		'music/death']

CODECS = [['audio/ogg;codecs="vorbis"', '.ogg'],
	  ['audio/mpeg', '.mp3']];

function audio_obj(path) {
    var obj;
    if (path in audio_files) {
	obj = audio_files[path];
	if (window.chrome)
	    obj.load()
    } else {
	obj = document.createElement('audio');
	var best_codec = null;
	var best_rating = 0;
	for (var i = 0; i < CODECS.length; i++) {
	    var rating = obj.canPlayType(CODECS[i][0]);
	    switch (rating) {
	    case 'probably': rating = 2; break;
	    case 'maybe': rating = 1; break;
	    default: rating = 0; break;
	    }
	    if (rating > best_rating) {
		best_rating = rating;
		best_codec = CODECS[i];
	    }
	}
	if (best_rating) {
	    var src = document.createElement('source');
	    src.type = best_codec[0];
	    src.src = path + best_codec[1];
	    obj.appendChild(src);
	} else {
	    console.log('desired audio codecs are not supported');
	}
	audio_files[path] = obj;
    }
    return obj;
}

function music_ended() {
    if (window.chrome)
	this.load();
    else
	this.currentTime = 0;
    this.play();
}

function music_play(tracknum, loop) {
    if (music_tracknum === tracknum)
	return;
    if (music_track) {
	music_track.removeEventListener('ended', music_ended);
	music_track.pause();
	if (window.chrome) {
	    music_track.load();
	} else {
	    music_track.currentTime = 0;
	}
	music_track = null;
	music_tracknum = null;
    }
    if (tracknum !== null) {
	var obj = audio_obj(MUSIC_TRACKS[tracknum]);
	if (loop)
	    obj.addEventListener('ended', music_ended);
	obj.play();
	music_track = obj;
	music_tracknum = tracknum;
    }
}

function sfxPlay2() {
    this.play();
    this.removeEventListener('canplaythrough', sfxPlay2, false)
}

function sfxPlay(name) {
    var obj = audio_obj('sfx/' + name);
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
