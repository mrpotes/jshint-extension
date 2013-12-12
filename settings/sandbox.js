var ko = ko || {};

function ViewModel() {
  var self = this;
  
  this.settings = ko.observableArray([]);
  
  this._store = function(newValue) {
    var setting = ko.utils.extend({}, newValue);
    setting.value = setting._value();
    window.parent.postMessage({ key: newValue.key, value: ko.utils.stringifyJson(setting) }, "*");
  };
  
  this._subscribeStore = function(setting) {
    return function() {
      self._store(setting);
    };
  };
 
  this._addSetting = function(setting, needsStoring) {
    setting._value = ko.observable(setting.value);
    if (setting.type === 'boolean') {
      setting.value = setting._value;
    } else {
      setting.value = ko.computed({
        read: function() {
          return setting._value() === false ? '' : setting._value();
        },
        write: function(value) {
          setting._value(value.trim() === '' ? false : value);
        }
      });
    }
    setting._value.subscribe(this._subscribeStore(setting));
    this.settings.push(setting);
    if (needsStoring) {
      this._store(setting);
    }
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
        if (settingkey) {
          options[settingkey] = setting;
        }
        setting = {};
        components = this.optionDefinition.exec(line);
        setting.value = components[2] === "true";
        setting.comment = components[3] ? components[4] : "No description available - please click for documentation";
        settingkey = components[1];
      } else if (this.commentContinuation.test(line)) {
        components = this.commentContinuation.exec(line);
        if (components[1] !== "Obsolete options") {
          setting.comment += " " + components[1];
        }
      }
    }
    options[settingkey] = setting;
    return options;
  };
  
  this.setSettings = function(settings) {
    var i, setting;
    for (i = 0; i < settings.length; i++) {
      setting = ko.utils.extend({}, settings[i]);
      this._addSetting(setting);
    }
  }
  
  this.createSettings = function(text) {
    var startDeclaration, boolOptions, valOptions, opt;
    startDeclaration = text.indexOf("boolOptions = {");
    boolOptions = self.parseOptions(text.substring(startDeclaration, text.indexOf("},", startDeclaration) + 1));
    startDeclaration = text.indexOf("valOptions = {", startDeclaration);
    valOptions = self.parseOptions(text.substring(startDeclaration, text.indexOf("},", startDeclaration) + 1));
    for (opt in boolOptions) {
      if (boolOptions.hasOwnProperty(opt)) {
        self._addSetting({ key: opt, value: boolOptions[opt].value, type: 'boolean', comment: boolOptions[opt].comment }, true);
      }
    }
    for (opt in valOptions) {
      if (valOptions.hasOwnProperty(opt)) {
        self._addSetting({ key: opt, value: valOptions[opt].value, type: 'value', comment: valOptions[opt].comment }, true);
      }
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
    } else if (event.data.settingsText) {
      viewModel = new ViewModel();
      viewModel.createSettings(event.data.settingsText);
      ko.applyBindings(viewModel, document.getElementById("settings"));
    }
  },
  false
);

window.parent.postMessage({ ready: true }, "*");
