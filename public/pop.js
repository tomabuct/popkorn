$(document).ready(function() {
  var apiKey = '22593122';
  var sessionId = '2_MX4yMjU5MzEyMn4xMjcuMC4wLjF-U2F0IEphbiAxOSAwODoxMjowNiBQU1QgMjAxM34wLjk4Mzc4NzA2fg';
  var token = 'T1==cGFydG5lcl9pZD0yMjU5MzEyMiZzaWc9ZDZiMzQzNWFmZjU5OWNjYzhmNjNkOWYxMDRjNmZmMGQ0ODY1MTJkMTpzZXNzaW9uX2lkPTJfTVg0eU1qVTVNekV5TW40eE1qY3VNQzR3TGpGLVUyRjBJRXBoYmlBeE9TQXdPRG94TWpvd05pQlFVMVFnTWpBeE0zNHdMams0TXpjNE56QTJmZyZjcmVhdGVfdGltZT0xMzU4NjExOTI5JmV4cGlyZV90aW1lPTEzNTg2OTgzMjkmcm9sZT1wdWJsaXNoZXImbm9uY2U9NDQzOTYyJnNka192ZXJzaW9uPXRiLWRhc2hib2FyZC1qYXZhc2NyaXB0LXYx';
  var client = new Dropbox.Client({
    key: "KGh2bRY1OTA=|uW+0UZq9oX+WVLvRsNCnnIcuEvgOkhOmU0vYFgzhkA==" 
  });

  client.authDriver(new Dropbox.Drivers.Redirect());
  client.authenticate(function(error, client) {
    run(client);
  });


  function run() {
    client.readdir("/", function(error, entries, dir_stat, entry_stats) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      var Folder = Backbone.Model.extend();
      var FolderList = Backbone.Collection.extend({
        model: Folder
      });

      var Folders = new FolderList;
      Folders.reset(entry_stats);

      var FolderView = Backbone.View.extend({
        tagName: "li",
        template: _.template("<div class='name'><%= name %></div><div class='kind'><%= mimeType %></div>"),
        events: {"click" : "onClick"},
        render: function() {
          this.$el.html(this.template(this.model.toJSON()));
          return this;
        },
        onClick: function() {
          if (this.model.get("isFolder")) {
            var ths = this;
            client.readdir(this.model.get("path"),
              function(error, entries, dir_stat, entry_stats) {
                var curr_path = ths.model.get("path");
                $("#current").html(curr_path);
                var stripped = curr_path.substr(0, curr_path.length - 1);
                var split_path = stripped.split("/");
                var prev_path = stripped.replace(split_path[split_path.length - 1], "");
                var up_folder = new Folder(
                  {
                    "name": "..", 
                    "mimeType": "inode/directory",
                    "path": prev_path,
                    "isFolder": true
                  });
                entry_stats.unshift(up_folder);
                Folders.reset(entry_stats);
              });
          }
        },
      });

      var AppView = Backbone.View.extend({
        el: $("#pop"),
        initialize: function() {
          this.listenTo(Folders, 'reset', this.render);
          this.render();
        },
        render: function() {
          $('#folders-list').html("");
          Folders.each(function(folder) {
            var folderView = new FolderView({
              model: folder
            });
            $('#folders-list').append(folderView.render().el);
          });
        }
      });

      var App = new AppView;
      var pusher = new Pusher('86baf974dd9fd950a9c8');
      channel = pusher.subscribe('private-together');
      var sent = false;

      function onSelect(e) {
        client.readdir($("#current").html(),
          function(error, entries, dir_stat, entry_stats) {
            var files = _.filter(entry_stats, 
              function(e) {
                return e.mimeType == "image/jpeg";
              });
            $('#pop').hide();
            var arr = files.slice(0);
            function processOne() {
              var item = arr.pop(); 
              client.makeUrl(item.path,{'download': true}, 
                function(error, u) {
                  $('#galleria').append("<img src='" + u.url + "'>");
                  if (arr.length <= 0) {
                    Galleria.loadTheme('galleria/themes/classic/galleria.classic.min.js');
                    Galleria.configure({
                      transition: 'fade',
                      imageCrop: true,
                      width: 700,
                      height: 0.5625,
                      imageTimeout: 70000
                    });
                    Galleria.run('#galleria');
                  } else {
                    processOne();
                  }
                });
            
            }
            if (arr.length > 0) {
              processOne();
            } 
          });
      }

        $(".button").click(onSelect);

      Galleria.ready(function() {
        var ths = this;
        this.bind("loadstart", function(e) {
          console.log("loadstart");
          channel.trigger("client-photo-load", { ind: e.index });
          sent = true;
        });
        this.bind("image", function(e) {
          console.log("image");
          sent = false;
        });
        channel.bind('client-photo-load', function(data) {
            console.log("received load " + data.ind);
          if (!sent) {
            ths.show(data.ind);
          } else {
            sent = false;
          }
        });

        TB.setLogLevel(TB.DEBUG);
        var session = TB.initSession(sessionId);
        session.addEventListener('sessionConnected', sessionConnectedHandler);
        session.addEventListener('streamCreated', streamCreatedHandler);
        session.connect(apiKey, token);

        var publisher;

        function sessionConnectedHandler(event) {
          console.log("connected!");
          // Put my webcam in a div
          var publishProps = {height:240, width:320};
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
            document.body.appendChild(div);

            session.subscribe(streams[i], div.id)
          }
        }
      });
    });
  }


});
