_V_("vid_player").src({ type: "video/mp4", src: video_url });
_V_("vid_player").ready(function(){
  this.play();
});

