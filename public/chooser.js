$(document).ready(function() {
  var client = new Dropbox.Client({
    key: "KGh2bRY1OTA=|uW+0UZq9oX+WVLvRsNCnnIcuEvgOkhOmU0vYFgzhkA==" 
  });

  client.authDriver(new Dropbox.Drivers.Redirect());
  client.authenticate(function(error, client) {
    run(client);
  });
  $("#list-header").hide();
  $("#list-footer").hide();
  $("#pop").hide();

  function run() {
    client.readdir("/", function(error, entries, dir_stat, entry_stats) {
      $("#list-header").show();
      $("#pop").slideDown(1000);
      $("#list-footer").show();
      var Folder = Backbone.Model.extend({
        initialize: function() {
          if (this.get("mimeType") == "inode/directory") {
            this.set({"kind": "folder"});
            this.set({"img": "<img src=\"../images/folder.png\">"});
          }
          else if (this.get("mimeType") == "application/pdf") {
            this.set({"kind": "pdf"});
            this.set({"img": "<img src=\"../images/file.png\">"});
          }
          else if (this.get("mimeType") == "application/zip") {
            this.set({"kind": "zip"});
            this.set({"img": "<img src=\"../images/file.png\">"});
          }
          else if (this.get("mimeType") == "text/plain") {
            this.set({"kind": "document"});
            this.set({"img": "<img src=\"../images/file.png\">"});
          }
          else if (/image*/.test(this.get("mimeType"))) {
            this.set({"kind": "image"});
            this.set({"img": "<img src=\"../images/picture.png\">"});
          }
          else if (this.get("mimeType") == "application/msword") {
            this.set({"kind": "document"});
            this.set({"img": "<img src=\"../images/file.png\">"});
          }
          else {
            this.set({"kind": this.get("mimeType")});
            this.set({"img": "<img src=\"../images/file.png\">"});
          }
        }
      });
      var FolderList = Backbone.Collection.extend({
        model: Folder
      });

      var Folders = new FolderList;
      var FolderViews;
      Folders.reset(entry_stats);

      var FolderView = Backbone.View.extend({
        tagName: "li",
        template: _.template("<div class='name'><%= img %><a><%= name %></a></div><div class='kind'><%= kind %></div>"),
        events: {
          "click a" : "onClickName",
          "click" : "onSelect"
        },
        render: function() {
          this.$el.html(this.template(this.model.toJSON()));
          return this;
        },
        onSelect: function() {
          console.log('selected!');
          this.$el.addClass("selected");
          this.trigger("selected", this);
        },
        unselect: function() {
          this.$el.removeClass("selected");
        },
        added: function() {
          this.$el.addClass("added");
        },
        onClickName: function() {
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
                if (curr_path != "/")
                  entry_stats.unshift(up_folder);
                Folders.reset(entry_stats);
              });
          }
        },
      });
      img_urls = new Array();
      img_names = new Array();

      var AppView = Backbone.View.extend({
        el: $("#pop"),
        initialize: function() {
          this.listenTo(Folders, 'reset', this.render);
          this.selected = undefined;
          this.add_button = $("#add");
          this.add_button.hide();
          this.add_folder_button = $("#add_folder");
          this.done_button = $("#done");
          this.render();
        },
        events: {
          "click #add": "add",
          "click #add_folder": "add_folder",
          "click #done": "postUrls"
        },
        render: function() {
          $('#folders-list').html("");
          var ths = this;
          FolderViews = Folders.map(function(folder) {
            var folderView = new FolderView({
              model: folder
            });
            if (_.contains(img_names, folder.get("name")))
              folderView.added();
            console.log('lol');
            $('#folders-list').append(folderView.render().el);
            folderView.bind("selected", ths.onSelected, ths);
            return folderView;
          });
          this.selected = undefined;
          this.add_button.hide();
        },

        onSelected: function(folderView) {
          console.log("onSelected");
          if (this.selected) {
            this.selected.unselect();
          }
          if (/image/.test(folderView.model.get("mimeType")))
            this.add_button.show();
          else
            this.add_button.hide();
          this.selected = folderView;
        },

        add: function() {
          if (/image/.test(this.selected.model.get("mimeType"))) {
            this.make_url(this.selected.model.toJSON());
            this.selected.added();
          }
        },

        add_folder: function() {
          var ths = this;
          _.each(FolderViews,
            function(e) {
              if (/image/.test(e.model.get("mimeType"))){
                e.added();
                ths.make_url(e.model.toJSON());
              }
          });
        },

        make_url: function(item) {
          client.makeUrl(item.path,{'download': true}, 
            function(error, u) {
              if (!_.contains(img_names, item.name)) {
                console.log("added " + u.url);
                img_urls.push(u.url);
                img_names.push(item.name);
                $("#count").html(img_urls.length);
              }
            });
        },

        postUrls: function() {
          $.post('/gallery', 'imgs=' + JSON.stringify(img_urls), 
            function(data, textStatus, jq) {
              window.location = "/gallery?id=" + data;
            }
          );
        }
      });

      var App = new AppView;

      function onSelect(e) {
        client.readdir($("#current").html(),
          function(error, entries, dir_stat, entry_stats) {
            var files = _.filter(entry_stats, 
              function(e) {
                return /image/.test(e.mimeType);
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
