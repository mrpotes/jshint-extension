
function getOptions() {
  var options = {}, option, key;
  for (key in localStorage) {
    if (key.indexOf("settings-") === 0) {
      option = JSON.parse(localStorage[key]);
      options[option.key] = option.value;
    }
  }
  return options;
}

function validateScript(content, url) {
  var isValid = JSHINT(content, getOptions());
  if (!isValid) {
    JSHINT.errors.forEach(function(error) {
      if (error === null) {
        // Why does JSHINT return a null terminated array?
        return;
      }
      chrome.experimental.devtools.console.addMessage(chrome.experimental.devtools.console.Severity.Error, error.reason, url, error.line);
    });
  } else {
    chrome.experimental.devtools.console.addMessage(chrome.experimental.devtools.console.Severity.Log, "JSHint: No errors", url);
  }
}

chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(resource, content) {
  var url = resource.url;
  if (url.lastIndexOf(".js") === url.length - 3) {
    validateScript(content, resource.url);
  }
});

chrome.devtools.panels.create(
    'JS Hint',
    null, // No icon path
    'settings/panel.html',
    null // no callback needed
);

