// Import all the channels to be used by Action Cable
if (window.location.pathname.match(/lists\/(\d+)/)) {
  import("channels/list_channel");
}
