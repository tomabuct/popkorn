$(function() {
  var spinner = new Spinner({
    lines: 12, // The number of lines to draw
    length: 7, // The length of each line
    width: 5, // The line thickness
    radius: 10, // The radius of the inner circle
    color: '#000', // #rbg or #rrggbb
    speed: 1, // Rounds per second
    trail: 100, // Afterglow percentage
    shadow: true // Whether to render a shadow
  }).spin(document.getElementById("spinner"));

  var apiKey = '22593122';
  var sessionId = '2_MX4yMjU5MzEyMn4xMjcuMC4wLjF-U3VuIEphbiAyMCAwOTo0Njo0NiBQU1QgMjAxM34wLjQxNjMxNTI2fg';
  var token = 'T1==cGFydG5lcl9pZD0yMjU5MzEyMiZzaWc9MWNkOTljNGRhOTE2YmYzNGIyYjE1YWY4OGFkMDJjNGY3MzQ0MzI3ODpzZXNzaW9uX2lkPTJfTVg0eU1qVTVNekV5TW40eE1qY3VNQzR3TGpGLVUzVnVJRXBoYmlBeU1DQXdPVG8wTmpvME5pQlFVMVFnTWpBeE0zNHdMalF4TmpNeE5USTJmZyZjcmVhdGVfdGltZT0xMzU4NzA0MDExJmV4cGlyZV90aW1lPTEzNTg3OTA0MTEmcm9sZT1wdWJsaXNoZXImbm9uY2U9NzE3NTAmc2RrX3ZlcnNpb249dGItZGFzaGJvYXJkLWphdmFzY3JpcHQtdjE=';

  TB.setLogLevel(TB.DEBUG);
  var started = false;
  function startTokBox() {
    started = true;
    $("#spinner").show();
    $(".video").hide();
    var publishProps = {height:185, width:300};
    channel.trigger("client-tok-" + id, { });
    var session = TB.initSession(sessionId);
    session.addEventListener('sessionConnected', sessionConnectedHandler);
    session.addEventListener('streamCreated', streamCreatedHandler);
    session.connect(apiKey, token);

    var publisher;
    function sessionConnectedHandler(event) {
      $("#spinner").hide();
      console.log("connected!");
      // Put my webcam in a div
      publisher = TB.initPublisher(apiKey, 'publisher', publishProps);
      // Send my stream to the session
      session.publish(publisher);

      subscribeToStreams(event.streams);
    }

    function streamCreatedHandler(event) {
      subscribeToStreams(event.streams);
    }
    function subscribeToStreams(streams) {
      for (var i = 0; i < streams.length; i++) {
        if (streams[i].connection.connectionId == session.connection.connectionId) {
          return;
        }

        var div = document.createElement('div');
        div.setAttribute('id', 'stream' + streams[i].steamId);
        $("#footer").prepend(div);

        session.subscribe(streams[i], div.id, publishProps)
      }
    }
  }
  $(".video").click(startTokBox);
  channel.bind('client-tok-' + id, function(data) {
      console.log("received load ");
    if (!started) {
      toastr.info('You are receiving a video call. Press the red button to answer it!');
    }
  });
});
