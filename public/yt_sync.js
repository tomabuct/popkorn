// YouTube embed script loader
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YouTube video loader 
var yt_player;
function onYouTubeIframeAPIReady() {
  yt_player = new YT.Player('yt_player', {
    width: '75%',
    videoId: video_id,
    enablejsapi: true,
    events: {
      'onStateChange': onYTPlayerStateChange
    }
  });
}

// Syncer 
var broadcast = true;
var q = []

channel.bind('client-hb', function(data) {
  q.push(data) 
});

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

var timer_id = null;

function onYTPlayerStateChange(newState) {
  newState = newState.data;

  if (broadcast === false) {
    broadcast = true;
    return;
  }

  if (newState == 1) {
    channel.trigger("client-play", {});
  }
  if (newState == 2) {
    channel.trigger("client-pause", { time: yt_player.getCurrentTime() });
  }
  if (newState == 5) { 
    channel.trigger("client-play", {});
  }
}

setInterval(heartbeat, 2000);

function heartbeat() {
  channel.trigger("client-hb", {
    client_id: "<%= client_id %>",
    current_time: new Date().getTime(),
    video_time: yt_player.getCurrentTime(),
    playing: yt_player.getPlayerState()
  })

  qq = q;
  q = [];
  var curr_time = new Date().getTime();
  counts = {};
  seen = {};
  min_cid = undefined 
  numPlaying = 0;
  numPeeps = 0;
  for (var i=qq.length-1; i>=0; i--) {
    if (seen[qq[i].client_id]) {
      continue;
    }
    numPeeps++;
    if (qq[i].playing) numPlaying++;
    seen[qq[i].client_id] = true;
    time = qq[i].video_time + (curr_time - qq[i].current_time);
    time = Math.round(time);
    counts[time-1] = (counts[time-1] || 0) + 1;
    counts[time] = (counts[time] || 0) + 1;
    counts[time+1] = (counts[time+1] || 0) + 1;
  }
  var maxTime=0;
  var maxCount = 0;
  for (var time in counts) {
    var count = counts[time];
    if (count > maxCount) {
      maxTime = time;
      maxCount = count;
    }
  }
if (maxTime - yt_player.getCurrentTime() < 2 || yt_player.getCurrentTime() - maxTime < 2) {} else {
  yt_player.seekTo(maxTime);
}
  if (numPlaying >= numPeeps - numPlaying) {
    yt_player.playVideo();
  }
}
