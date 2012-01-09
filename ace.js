(function($){
  Drupal.behaviors.ace = {
    attach: function (context, settings) {
      // process codeblocks
      $('code', context).once().each(function(){
        var code = $.trim($(this).text());
        var lines = (code.split('\n'));
        console.log(code.split('\n'));
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
        var Mode = require('ace/mode/' + $(this).attr('data-language')).Mode;
        if (Mode) {
          display.getSession().setMode(new Mode());
        }
        $(this).parent().remove();
      });
      
      // process all textareas
      $('.form-textarea-wrapper', context).once().each(function() {
        var textarea = $(this).find('textarea');

        // build and append editor element
        var editor_element = $('<div class="ace-editor"></div>').insertAfter(textarea);
        var editor = ace.edit(editor_element[0]);
        editor_element.css({
          'height': editor.renderer.lineHeight * $(textarea).attr('rows'),
          'width': 'auto',
          'position': 'relative'
        });

        // hide print margin - we use full textarea width
        editor.setShowPrintMargin(false);

        // enable word wrap
        editor.getSession().setUseWrapMode(true);

        // use soft tabs
        editor.getSession().setUseSoftTabs(true);

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

        // themes and modes
        var input_mode = 'default';
        $('select.filter-list', $(this).parents('.text-format-wrapper')).each(function() {
          input_mode = $(this).val();
          $(this).change(function(){
            input_mode = $(this).val();
            applyThemeAndMode(settings.ace.themes[input_mode], settings.ace.modes[input_mode]);
          });
        });
        applyThemeAndMode(settings.ace.themes[input_mode], settings.ace.modes[input_mode]);

        function applyThemeAndMode(theme, mode) {
          editor.setTheme(theme);
          var Mode = require(mode).Mode;
          editor.getSession().setMode(new Mode());
        }

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
