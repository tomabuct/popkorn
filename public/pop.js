$(document).ready(function() {
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

      var flders = _.filter(entry_stats, 
        function(e) {return e.isFolder;});
      var Folder = Backbone.Model.extend();
      var FolderList = Backbone.Collection.extend({
        model: Folder
      });

      var Folders = new FolderList;
      Folders.reset(flders);

      var FolderView = Backbone.View.extend({
        tagName: "li",
        template: _.template("<%= name %>"),
        events: {"click" : "onClick"},
        render: function() {
          this.$el.html(this.template(this.model.toJSON()));
          return this;
        },
        onClick: function() {
          client.readdir(this.model.get("path"),
            function(error, entries, dir_stat, entry_stats) {
              var files = _.filter(entry_stats, 
                function(e) {
                  return e.mimeType == "image/jpeg";
                });
              var i = 0;
              $('#pop').hide();
              _.each(files, function(f) {
                client.makeUrl(f.path,{'download': true}, 
                  function(error, u) {
                    $('#galleria').append("<img src='" + u.url + "'>");
                    i++;
                    if (i == files.length) {
                      Galleria.loadTheme('themes/classic/galleria.classic.min.js');
                      Galleria.configure({
                        transition: 'fade',
                        imageCrop: true,
                        width: 700,
                        height: 0.5625,
                        imageTimeout: 70000
                      });
                      Galleria.run('#galleria');
                    }
                  });
              });
              
            });
        }
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
      });
    });
  }


});
