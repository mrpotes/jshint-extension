function ViewModel() {
  var self = this, key;
  
  this.settings = ko.observableArray([]);
  
  this._store = function(newValue) {
    var setting = ko.utils.extend({}, newValue);
    setting.value = setting.value();
    window.parent.postMessage({ key: newValue.key, value: ko.utils.stringifyJson(setting) }, "*")
  };
  
  this._subscribeStore = function(setting) {
    return function(newValue) {
      setting.value(setting.type === "value" && newValue === "" ? false : newValue);
      self._store(setting);
    };
  };
 
  this._addSetting = function(setting) {
    setting.value = ko.observable(setting.value);
    setting.value.subscribe(this._subscribeStore(setting));
    this.settings.push(setting);
    this._store(setting);
  };
 
  this.optionDefinition = /^\s+([a-z]+)\s*:\s+(true|false),?\s*(\/\/(.+))?$/;
  this.commentContinuation = /^\s+\/\/(.+)$/;

  this.parseOptions = function(text) {
    var i, setting, settingkey, line, components,
      lines = text.split("\n"), 
      options = {};
    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      if (this.optionDefinition.test(line)) {
        if (settingkey) options[settingkey] = setting;
        setting = {};
        components = this.optionDefinition.exec(line);
        setting.value = components[2] === "true";
        setting.comment = components[3] ? components[4] : "No description available - please click for documentation";
        settingkey = components[1];
      } else if (this.commentContinuation.test(line)) {
        components = this.commentContinuation.exec(line);
        if (components[1] !== "Obsolete options") setting.comment += " " + components[1];
      }
    }
    options[settingkey] = setting;
    return options;
  };
  
  this.setSettings = function(settings) {
    var i, setting;
    for (i = 0; i < settings.length; i++) {
      setting = ko.utils.extend({}, settings[i]);
      setting.value = ko.observable(setting.value);
      this.settings.push(setting);
    }
    if (this.settings().length === 0) {
      $.get("../jshint.js").done(function(data, status, jqxhr) {
        var text = jqxhr.responseText,
            startDeclaration, boolOptions, valOptions, opt, lastoption, setting;
        startDeclaration = text.indexOf("boolOptions = {");
        boolOptions = self.parseOptions(text.substring(startDeclaration, text.indexOf("},", startDeclaration) + 1));
        startDeclaration = text.indexOf("valOptions = {", startDeclaration);
        valOptions = self.parseOptions(text.substring(startDeclaration, text.indexOf("},", startDeclaration) + 1));
        for (opt in boolOptions) {
          self._addSetting({ key: opt, value: boolOptions[opt].value, type: 'boolean', comment: boolOptions[opt].comment });
        }
        for (opt in valOptions) {
          self._addSetting({ key: opt, value:  valOptions[opt].value, type: 'value', comment: valOptions[opt].comment });
        }
      });
    }
  };
  
}

window.addEventListener(
  "message",
  function(event) {
    var viewModel;
    if (event.data.settings) {
      viewModel = new ViewModel();
      viewModel.setSettings(event.data.settings);
      ko.applyBindings(viewModel, document.getElementById("settings"));
    }
  },
  false
);

window.parent.postMessage({ ready: true }, "*");
