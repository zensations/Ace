(function($) {
  Drupal.behaviors.ace = {
    attach: function (context, settings) {
      require(['ace/ace', 'ace/lib/dom'], function (ace, dom) {

        if (Drupal.settings.ace_themes) {
          $(Drupal.settings.ace_themes).each(function(path, theme) {
            define(theme['path'], function(require, exports, module){
              exports.isDark = theme['is-dark'];
              exports.cssClass = theme['class'];
              exports.cssText = '';
              dom.importCssString(exports.cssText, exports.cssClass);
            });
          });
        }

        $('.form-textarea-wrapper', context).once().each(function() {
          var textarea = $(this).find('textarea');
          // build and append editor element
          var editor_element = $('<div class="ace-editor"></div>')
            .insertAfter(textarea);
          var toolbar_element = $(
            '<div class="ace-toolbar"></div>'
          );
          toolbar_element.insertBefore(editor_element);
          var editor = ace.edit(editor_element[0]);
          editor_element.css({
            'height': editor.renderer.lineHeight * $(textarea).attr('rows') + 5,
            'width': 'auto',
            'position': 'relative'
          });

          // hide print margin - we use full textarea width
          editor.setShowPrintMargin(false);

          // don't display a gutter. non-programmers won't know what it means
          //editor.renderer.setShowGutter(false);

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
            var theme = settings.ace.themes[mode];
            var keybinding = settings.ace.keybindings[mode];
            var toolbar = settings.ace.toolbars[mode];
            var syntax = settings.ace.modes[mode];
            editor.setTheme(settings.ace.themes[mode]);
            require([keybinding], function(keybinding) {
              editor.setKeyboardHandler(keybinding.handler);
            });

            toolbar_element.children().remove();
            toolbar_element.show();
            require([toolbar], function(toolbars) {
              $.each(toolbars, function(name, Toolbar) {
                (new Toolbar(toolbar_element, editor, mode)).render();
              });
            });
            require([syntax], function(modes) {
              $.each(modes, function(name, Mode){
                editor.getSession().setMode(new Mode());
              });
            });
          }

          var input_mode = 'default';
          if ($(textarea).attr('data-ace-format')) {
            input_mode = $(textarea).attr('data-ace-format');
          }
          $('select.filter-list', $(this).parents('.text-format-wrapper'))
            .each(function() {
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
            var grippie = $('<div class="grippie"></div>');
            grippie.mousedown(startDrag);
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
            $(document)
              .unbind('mousemove', performDrag)
              .unbind('mouseup', endDrag);
            editor_element.css('opacity', 1);
          }

          // hide original textarea
          $(textarea).hide();
        });

        // process codeblocks
        $('code.drupdown-code', context).once().each(function() {
          return;
          var code = $.trim($(this).text());
          var lines = (code.split('\n'));
          var line_count = 0;
          for (var i = 0; i < lines.length; i++) {
            line_count += Math.ceil(lines[i].length/80);
          }
          var display_element = $('<div class="ace-display"></div>')
            .insertAfter($(this).parent());
          var display = ace.edit(display_element[0]);
          display_element.css({
            'height': display.renderer.lineHeight * line_count,
            'width': 'auto',
            'position': 'relative'
          });
          display.getSession().setValue(code);
          display.setShowPrintMargin(false);
          display.setReadOnly(true);
          display.setHighlightActiveLine(false);
          display.getSession().setUseWrapMode(true);
          if ($(this).attr('data-ace-mode')) {
            var Mode = require($(this).attr('data-ace-mode')).Mode;
            if (Mode) {
              display.getSession().setMode(new Mode());
            }
          }
          $(this).parent().remove();
        });
      });
      // process all textareas
    }
  };
}(jQuery));
