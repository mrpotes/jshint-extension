var viewModel = (function() {
  var self = this, key;
  this._
  this.settings = ko.observableArray([]);
  for (key in localStorage) {
    settings.push(localStorage[key]);
  }
  if (settings().length === 0) {
    $.get("../jshint.js").done(function(data, status, jqxhr) {
      var text = jqxhr.responseText,
          startDeclaration, boolOptions, valOptions, opt, lastoption;
      startDeclaration = text.indexOf("boolOptions = {")
      eval(text.substring(startDeclaration, text.indexOf("},", startDeclaration) + 1));
      startDeclaration = text.indexOf("valOptions = {", startDeclaration)
      eval(text.substring(startDeclaration, text.indexOf("},", startDeclaration) + 1));
      for (opt in boolOptions) {
        settings.push({
          key: opt, value: boolOptions[opt], type: 'boolean'
        });
      }
      for (opt in valOptions) {
        settings.push({
          key: opt, value: valOptions[opt], type: 'value'
        });
      }
    });
  }
  settings.subscribe(function(newValue) {
    localStorage[newValue.key] = newValue;
  });
})();
ko.applyBindings(viewModel, document.getElementById("settings"));
