// Enable pusher logging - don't include this in production
Pusher.log = function(message) {
  if (window.console && window.console.log)
    window.console.log(message);
};

// Flash fallback logging - don't include this in production
WEB_SOCKET_DEBUG = true;

var pusher = new Pusher('86baf974dd9fd950a9c8');
var channel = pusher.subscribe('private-' + session_id);

channel.bind('pusher:subscription_error', function(data) {
  console.log("ERROR: " + data)
});
