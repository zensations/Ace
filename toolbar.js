define('ace/toolbar/default', ['require', 'exports', 'module'], function(require, exports, module) {
  var EmptyToolbar = function(element, editor, format) {
    this.element = element;
    this.editor = editor;
    this.format = format;
    this.render = function() {
      element.hide();
    };
  };
  exports.Toolbar = EmptyToolbar;
});
