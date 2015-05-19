// create function to have user type a song a search it (echoNest api)
// get request for searched song (youTube api)
// show new youTube song based on matching 'tempo' and 'key' results from previously searched (echoNest)
// play found video with matched 'tempo' and 'key'

// echonest keys below:
// Your API Key: UERCJAEULHNDGA8KX 
// Your Consumer Key: 44dd6bd6ac2a73cc8d54510be5b4ffd9 
// Your Shared Secret: 1yKwPo93RZ2lYTn8HkCUdg

// echonest song search
// http://developer.echonest.com/api/v4/song/search?api_key=FILDTEOIK2HBORODV&artist=kanye%20west&title=all%20of%20the%20lights
var app ={};
// youTube key
app.youTubeKey = 'AIzaSyD4tral4uWGhAuXca57lW0x2En9r1u-m0g';
// echoNest key
app.echoNestKey = 'UERCJAEULHNDGA8KX';

app.videos = [];
app.songs = [];

app.origSongId = '';
//Setts it so that if we use an array in the 
//data key in the $.ajax method it will NOT! do key[]=value, but key=value;
$.ajaxSettings.traditional = true;
// song request
app.getSong = function(query) {
	$.ajax({
		url: 'http://developer.echonest.com/api/v4/song/search',
		type: 'GET',
		data: {
			api_key: app.echoNestKey,
			format: 'json',
			combined: query,
			results: 1,
		},
		success:function(res) {
			app.origSongId = res.response.songs[0].id;
			app.getSongTempAndKey(app.origSongId);
		}
	});
};

//This will get song info based on the id, like the tracks
app.getTrackInfoById = function(songId) {
	return $.ajax({
		url: 'http://developer.echonest.com/api/v4/song/profile',
		type: 'GET',
		data: {
			api_key: app.echoNestKey,
			format: 'json',
			id: songId,
			results: 1,
			bucket: ['tracks','id:7digital-US','audio_summary'],
		}
	});
};

// get song ID
app.getSongTempAndKey= function(songId) {
	$.ajax({
		url: 'http://developer.echonest.com/api/v4/song/profile',
		type: 'GET',
		data: {
			api_key: app.echoNestKey,
			id: songId, //'SOKZDQQ1313438684D'
			bucket: 'audio_summary'
		},
		success:function(res) {
			// get song key and tempo
			var key = res.response.songs[0].audio_summary.key;
			var tempo = res.response.songs[0].audio_summary.tempo;

			app.searchByTempAndKey(key,tempo);
			// console.log(app.searchByTempAndKey);
		}
	});
};

//now search by tempo and key
app.searchByTempAndKey = function(key,tempo) {
	$.ajax({
		url: 'http://developer.echonest.com/api/v4/song/search',
		type: 'GET',
		dataType: 'jsonp',
		data: {
			format: 'jsonp',
			key: key,
			api_key: app.echoNestKey,
			max_tempo: tempo,
			min_tempo: tempo
		},
		success:function(res) {
			//Matched song id
			var id = res.response.songs[0].id;
			// our Tempo and key search
			$.when( app.getTrackInfoById(id), app.getTrackInfoById(app.origSongId)  )
			.then(function(matchedSong,matchedArtist,matchedAlbum) {
				// console.log(matchedSong);
				// console.log(originalSong);
				//now you know you can do something with the data
				app.displayFirstSongInfo(matchedSong,matchedArtist,matchedAlbum);
				// app.displaySecondSongInfo(OriginalSong);
			});

		}
	});
};

// start of events
app.events = function(){
	// apply a submit event listener to the form with a class of search
	$('.search').on('submit', function(evnt) {
		evnt.preventDefault();
	// get the entered user input
		var searchQuery = $(this).find('input[type=search]').val();
		console.log('The query: ', searchQuery);
	// pass that value to the app.getArt() method;
		app.getSong(searchQuery);
	// clear the search value
	// $(this).find('input[type=search]').val('');
	});
};

// searched song display
app.displayFirstSongInfo = function(apiData) {

	$('#matchedSong,#matchedArtist,#matchedAlbum').empty();

	var matchedSong = apiData[0].response.songs[0].title;
	var matchedArtist = apiData[0].response.songs[0].artist_name;

	console.log(matchedSong);
	console.log(matchedArtist);
	console.log(matchedAlbum);

	$('#matchedArtist').text('Artist: ' + matchedArtist);
	$('#matchedSong').text('Song: ' + matchedSong);
	//Check if image is there, if not, don't append
	if(apiData[0].response.songs[0].tracks.length > 0) {
		var matchedAlbum = $('<img>').attr('src', apiData[0].response.songs[0].tracks[0].release_image);
		$('#matchedAlbum').append(matchedAlbum);
	}
};

// Start app
app.init = function() {
	app.events();
	// app.displayFirstSongInfo();
	// app.displaySecondSongInfo();

};
$(function() {
	app.init();
});

// side nav pop up jquery
jQuery(document).ready(function($){
	//open the lateral panel
	$('.cd-btn').on('click', function(event){
		event.preventDefault();
		$('.cd-panel').addClass('is-visible');
	});
	//clode the lateral panel
	$('.cd-panel').on('click', function(event){
		if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) { 
			$('.cd-panel').removeClass('is-visible');
			event.preventDefault();
		}
	});
});
// end of javascript for app