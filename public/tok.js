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

  var apiKey = '22606522';
  var sessionId = '2_MX4yMjYwNjUyMn4xMjcuMC4wLjF-U3VuIEphbiAyMCAxMDoxMDoxNyBQU1QgMjAxM34wLjk2MDM3OX4';
  var token = 'T1==cGFydG5lcl9pZD0yMjYwNjUyMiZzaWc9YzY5MjY3Yzk4YjMwNTM5Mjk2ODJiMTBlNjVkY2VlYmJiZDc5YzNlNDpzZXNzaW9uX2lkPTJfTVg0eU1qWXdOalV5TW40eE1qY3VNQzR3TGpGLVUzVnVJRXBoYmlBeU1DQXhNRG94TURveE55QlFVMVFnTWpBeE0zNHdMamsyTURNM09YNCZjcmVhdGVfdGltZT0xMzU4NzA1NDI5JmV4cGlyZV90aW1lPTEzNjEyOTc0Mjkmcm9sZT1wdWJsaXNoZXImbm9uY2U9NDY3OTgmc2RrX3ZlcnNpb249dGItZGFzaGJvYXJkLWphdmFzY3JpcHQtdjE=';

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

        session.subscribe(streams[i], div.id, publishProps);
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
