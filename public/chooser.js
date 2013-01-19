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

      function onSelect(e) {
        client.readdir($("#current").html(),
          function(error, entries, dir_stat, entry_stats) {
            var files = _.filter(entry_stats, 
              function(e) {
                return e.mimeType == "image/jpeg";
              });
            // TODO: Add a little spinner here while it's posting?
            $('#pop').hide();
            var img_urls = new Array();
            var arr = files.slice(0);
            function processOne() {
              var item = arr.pop(); 
              client.makeUrl(item.path,{'download': true}, 
                function(error, u) {
                  img_urls.push(u.url);
                  if (arr.length > 0) {
                    processOne();
                  } else {
                    $.post('/gallery', 'imgs=' + JSON.stringify(img_urls), 
                      function(data, textStatus, jq) {
                        window.location = "/gallery?id=" + data;
                      }
                    );
                  }
                });
              }
              if (arr.length > 0) {
                processOne();
              } 
          });
      }

      $(".button").click(onSelect);
    });
  }
});
