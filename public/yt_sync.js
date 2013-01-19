// YouTube embed script loader
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YouTube video loader 
var yt_player;
function onYouTubeIframeAPIReady() {
  yt_player = new YT.Player('yt_player', {
    height: '500',
    width: '640',
    videoId: video_id,
    enablejsapi: true,
    events: {
      'onStateChange': onYTPlayerStateChange
    }
  });
}

// Syncer 
broadcast = true;

channel.bind('client-play', function(data) {
  broadcast = false;
  yt_player.playVideo();
});

channel.bind('client-pause', function(data) {
  broadcast = false;
  thresh = 0.5;
  t = data.time;
  if (t > yt_player.getCurrentTime() + thresh || t < yt_player.getCurrentTime() - thresh) {
    yt_player.seekTo(t);
  }
  if (yt_player.getPlayerState() != 3)
    yt_player.pauseVideo();
});

function onYTPlayerStateChange(newState) {
  newState = newState.data;

  if (broadcast === false) {
    broadcast = true;
    return;
  }

  console.log(newState);

  if (newState == 1)
    channel.trigger("client-play", {});
  if (newState == 2)
    channel.trigger("client-pause", { time: yt_player.getCurrentTime() });
  if (newState == 5)
    channel.trigger("client-play", {});
}

