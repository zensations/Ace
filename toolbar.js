(function($){
  define('drupal/ace/toolbar/default', ['exports'], function(require, exports) {
    var Toolbar = function() {};
    (function(){
      var that = this;
      this.setup = function (element, editor, format) {
        this.element = element;
        this.editor = editor;
        this.format = format;
      };

      this.buttons = function() {
        return [];
      };

      function submit(event) {
      }

      this.render = function () {
        var buttons = this.buttons();
        var $buttonbar = $('<div class="ace-button-bar"></div>');
        for (var i in buttons) {
          $buttonbar.append(renderElement(buttons[i]));
        }
        this.element.append($buttonbar);
        this.$dialog = $([
          '<form class="ace-dialog">',
            '<div class="ace-dialog-content"></div>',
            '<button class="submit"><span>' + Drupal.t('Okay') + '</span></button>',
            '<button class="cancel"><span>' + Drupal.t('Cancel') + '</span></button>',
          '</form>'
        ].join(''));

        var that = this;

        this.$dialog.bind('submit', function (event) {
          $(document).trigger('acedialoghide', that.$dialog);
          event.preventDefault();
          return false;
        });

        this.$dialog.find('.cancel').bind('click', function(event) {
          $(document).trigger('acedialoghide', that.$dialog);
          event.preventDefault();
          return false;
        });

        this.$dialog.hide();
        this.element.append(this.$dialog);
      };

      this.dialog = function($form, callback) {
        this.$dialog.unbind('submit');
        $content = $('.ace-dialog-content');
        $content.children().remove();
        $content.append($form);
        var that = this;
        this.$dialog.bind('submit', function(){
          var data = $(this).serializeArray();
          var values = {};
          for (i in data) {
            values[data[i].name] = data[i].value;
          }
          callback(values);
          that.$dialog.unbind('submit');
          that.$dialog.bind('submit', function(event) {
            $(document).trigger('acedialoghide', that.$dialog);
            event.preventDefault();
            return false;
          });
          event.preventDefault();
          $(document).trigger('acedialoghide', that.$dialog);
          return false;
        });
        $(document).trigger('acedialogshow', that.$dialog);
      };

      function renderElement(elem) {
        if ($.isArray(elem.children)) {
          $el = $('<div class="ace-toolbar-buttonset"></div>');
          for (i in elem.children) {
            $el.append(renderElement(elem.children[i]));
          }
          return $el;
        }
        else {
          var $button = $('<a href="#" class="ace-toolbar-button"><span class="title">' + elem.title + '</span></a>');
          $button.addClass(elem.class);
          $button.attr('title', elem.description);
          $button.click(function(event){
            if (elem.callback) {
              elem.callback.apply(that, elem.arguments);
            }
            event.preventDefault();
            return false;
          });
          return $button;
        }
      }
    }).call(Toolbar.prototype);
    exports.Toolbar = Toolbar;
  });

  $(document).bind('acedialogshow', function(event, form){
    $(form).fadeIn();
  });
  $(document).bind('acedialoghide', function(event, form){
    $(form).fadeOut();
  });
}(jQuery));
