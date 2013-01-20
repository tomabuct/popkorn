var html5_player = _V_("vid_player");

// Syncer
var broadcast = true;

channel.bind('client-play', function(data) {
  broadcast = false;
  html5_player.play();
});

channel.bind('client-pause', function(data) {
  broadcast = false;
  thresh = 0.5;
  t = data.time;
  if (t > html5_player.currentTime() + thresh || t < html5_player.currentTime() - thresh) {
    html5_player.currentTime(t);
  }
});

html5_player.addEvent("play", function() {
  if (broadcast === false) {
    broadcast = true;
  }
  channel.trigger("client-play", {});
});
html5_player.addEvent("pause", function() {
  if (broadcast === false) {
    broadcast = true;
  }
  channel.trigger("client-pause", { time: html5_player.currentTime() });
});

