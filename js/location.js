/**
 * User: Troy
 * Date: 8/11/12
 * Time: 12:21 PM
 */

var App = App || {};

App.Location = (function () {
  var latitude = 34.0522,
    longitude = -118.2428,
    accuracy = 0,
    timeStamp = 0,
    watchId = 0,
    update = function (position) {
      longitude = position.coords.longitude;
      latitude = position.coords.latitude;
      accuracy = position.coords.accuracy;
      timeStamp = position.timestamp;
      //console.log("lat: " + latitude + ", long: " + longitude);
      $(window).trigger("rnc_position", [latitude, longitude, accuracy]);
    },
    error = function (err) {
      console.log("Location error: " + err.message);
    },
    init = function () {
      watchId = navigator.geolocation.watchPosition(update, error);
    };
  init();
  return {
    init:function () {
      if (!watchId) {
        watchId = navigator.geolocation.watchPosition(update, error);
      }
    },
    terminate:function () {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = 0;
      }
    },
    get:function () {
      return {
        latitude:latitude,
        longitude:longitude
      };
    }
  };
}());