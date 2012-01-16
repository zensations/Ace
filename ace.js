(function($) {
  define('ace/toolbar/default', ['require', 'exports', 'module'], function(require, exports, module) {
    var EmptyToolbar = function(element, editor, field_name, format) {
      this.element = element;
      this.editor = editor;
      this.field_name = field_name;
      this.format = format;
      this.render = function() {
        element.hide();
      };
    };
    exports.Toolbar = EmptyToolbar;
  });

  Drupal.behaviors.ace = {
    attach: function (context, settings) {
      // process codeblocks
      $('code.drupdown-code', context).once().each(function() {
        var code = $.trim($(this).text());
        var lines = (code.split('\n'));
        var display_element = $('<div class="ace-display"></div>').insertAfter($(this).parent());
        var display = ace.edit(display_element[0]);
        display_element.css({
          'height': display.renderer.lineHeight * code.split('\n').length,
          'width': 'auto',
          'position': 'relative'
        });
        display.getSession().setValue(code);
        display.setShowPrintMargin(false);
        display.setReadOnly(true);
        display.setHighlightActiveLine(false);
        if ($(this).attr('data-language')) {
          var Mode = require('ace/mode/' + $(this).attr('data-language')).Mode;
          if (Mode) {
            display.getSession().setMode(new Mode());
          }
        }
        $(this).parent().remove();
      });
      
      // process all textareas
      $('.form-textarea-wrapper', context).once().each(function() {
        var textarea = $(this).find('textarea');
        var field_name = textarea.attr('name')
          .replace(/^(.*?)\[.*$/, function(str, field_name){
            return field_name;
          });
        // build and append editor element
        var editor_element = $('<div class="ace-editor"></div>').insertAfter(textarea);
        var toolbar_element = $('<div class="ace-toolbar ui-widget-header ui-corner-all"></div>').insertBefore(editor_element);
        var editor = ace.edit(editor_element[0]);
        editor_element.css({
          'height': editor.renderer.lineHeight * $(textarea).attr('rows'),
          'width': 'auto',
          'position': 'relative'
        });

        // hide print margin - we use full textarea width
        editor.setShowPrintMargin(false);

        // don't display a gutter. non-programmers won't know what it means
        editor.renderer.setShowGutter(false);

        // enable word wrap
        editor.getSession().setUseWrapMode(true);

        // use soft tabs
        editor.getSession().setUseSoftTabs(true);

        // don't highlight line. see "showGutter"
        editor.setHighlightActiveLine(false);

        // sync with actual textarea
        editor.getSession().setValue($(textarea).val());
        editor.getSession().on('change', function() {
          $(textarea).val(editor.getSession().getValue());
        });

        // resize on click - hack to work with previously invisible editors
        // for example teasers, vertical tabs ...
        editor_element.click(function() {
          editor.resize();
        });

        function setupEditor(mode) {
          editor.setTheme('ace/theme/' + settings.ace.themes.default);
          $.each((require('ace/keyboard/keybinding/' + settings.ace.keybindings.default) || {}), function(name, keybinding) {
            editor.setKeyboardHandler(keybinding);
          });
          toolbar_element.children().remove();
          toolbar_element.show();
          $.each((require('ace/toolbar/' + settings.ace.toolbars[mode]) || {}), function(name, Toolbar) {
            (new Toolbar(toolbar_element, editor, field_name, mode)).render();
          });
          $.each((require('ace/mode/' + settings.ace.modes[mode]) || {}), function(name, mode) {
            editor.getSession().setMode(new mode());
          });
        }
        // themes and modes
        var input_mode = 'default';
        if ($(textarea).attr('data-ace-format')) {
          input_mode = $(textarea).attr('data-ace-format');
        }
        $('select.filter-list', $(this).parents('.text-format-wrapper')).each(function() {
          input_mode = $(this).val();
          $(this).change(function(){
            input_mode = $(this).val();
            setupEditor(input_mode);
          });
        });
        setupEditor(input_mode);

        // append our own grippie
        // copied form textarea.js
        // TODO: find cleaner solution?
        if ($(this).hasClass('resizable')) {
          $(this).find('.grippie').remove();
          var staticOffset = null;
          var grippie = $('<div class="grippie"></div>').mousedown(startDrag);
          grippie.insertAfter(editor_element);
          $(this).removeClass('resizable');
          $(this).addClass('resizable-textarea')
        }

        function startDrag(e) {
          staticOffset = editor_element.height() - e.pageY;
          editor_element.css('opacity', 0.25);
          $(document).mousemove(performDrag).mouseup(endDrag);
          return false;
        }

        function performDrag(e) {
          editor_element.height(Math.max(32, staticOffset + e.pageY) + 'px');
          editor.resize();
          return false;
        }

        function endDrag(e) {
          $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
          editor_element.css('opacity', 1);
        }

        // hide original textarea
        $(textarea).hide();
      });
    }
  };
}(jQuery));
