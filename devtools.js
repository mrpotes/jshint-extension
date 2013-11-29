
function validateScript(content, url) {
  var isValid = JSHINT(content, {});
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

