var key,
    settings = [];

for (key in localStorage) {
  if (key.indexOf("settings-") === 0) {
    settings.push(JSON.parse(localStorage[key]));
  }
}
window.addEventListener(
  "message",
  function(event) {
    var appWindow = document.getElementById("app").contentWindow;
    if (event.data.key && event.data.value) {
      localStorage["settings-"+event.data.key] = event.data.value;
    } else if (event.data.ready) {
      if (settings.length > 0) {
        appWindow.postMessage({ settings: settings }, "*");
      } else {
        $.get("../jshint.js").done(function(data, status, jqxhr) {
          appWindow.postMessage({ settingsText: jqxhr.responseText }, "*");
        });
      }
    }
  },
  false
);
