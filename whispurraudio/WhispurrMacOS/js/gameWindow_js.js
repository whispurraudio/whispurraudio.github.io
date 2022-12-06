var url = "https://decapi.me/twitch/game/{{chanName}}";

function loadXMLDoc() {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  xmlHttp.send(null);
  var res = xmlHttp.responseText;
  document.getElementById("gameTitle").textContent = "{{titleDropdown}} "+ res;

}
// first page load
loadXMLDoc();
setInterval(loadXMLDoc, 15000);