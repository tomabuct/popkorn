<!-- SoundCloud embed script -->
<script src="http://connect.soundcloud.com/sdk.js"></script>
<script>
  var track_url = <%=video_url=%>;
  SC.oEmbed(track_url, { auto_play: false }, function(oEmbed) {
    console.log('oEmbed response: ' + oEmbed);
  });
</script>

var sc_player;
function onSoundCloudIframe

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

  if (newState == 1)
    channel.trigger("client-play", {});
  if (newState == 2)
    channel.trigger("client-pause", { time: yt_player.getCurrentTime() });
  if (newState == 5)
    channel.trigger("client-play", {});
}

