$(document).ready(function() {
  Galleria.loadTheme('galleria/themes/classic/galleria.classic.min.js');
  Galleria.configure({
    transition: 'fade',
    imageCrop: true,
    width: 700,
    height: 0.5625,
    imageTimeout: 70000
  });
  Galleria.run('#galleria');

  var pusher = new Pusher('86baf974dd9fd950a9c8');
  channel = pusher.subscribe('private-together');
  var sent = false;
  Galleria.ready(function() {
    var ths = this;
    this.bind("loadstart", function(e) {
      console.log("loadstart");
      channel.trigger("client-photo-load-" + id, { ind: e.index });
      sent = true;
    });
    this.bind("image", function(e) {
      console.log("image");
      sent = false;
    });
    channel.bind('client-photo-load-' + id, function(data) {
        console.log("received load " + data.ind);
      if (!sent && data.ind != ths.getIndex()) {
        ths.show(data.ind);
      } else {
        sent = false;
      }
    });
  });
});
