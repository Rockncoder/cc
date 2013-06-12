/**
 * User: Troy
 * Date: 8/11/12
 * Time: 12:21 PM
 */

var App = App || {};

App.Location = (function () {
  var latitude = 34.0522,
    longitude = -118.2428,
    hasSetOnce = false,
    accuracy = 0,
    timeStamp = 0,
    watchId = 0,
    zipCodeCache = {},
    isLocationEnabled = true,
    geocoder = new google.maps.Geocoder(),
    update = function (position) {
      hasSetOnce = true;
      isLocationEnabled = true;
      longitude = position.coords.longitude;
      latitude = position.coords.latitude;
      accuracy = position.coords.accuracy;
      timeStamp = position.timestamp;
      $(window).trigger("rnc_position", [latitude, longitude, accuracy]);
    },
    error = function (err) {
      isLocationEnabled = false;
      console.log("Location error: " + err.message);
      $(window).trigger("rnc_position", [latitude, longitude, accuracy]);
    },
    init = function () {
      watchId = navigator.geolocation.watchPosition(update, error);
    };
  init();
  return {
    codeAddress: function (zipCode, callback) {
      if (zipCodeCache[zipCode]) {
        if (callback) {
          callback(zipCodeCache[zipCode])
        }
        return zipCodeCache[zipCode];
      } else {
        geocoder.geocode({ 'address': zipCode}, function (results, status) {
          var loc = {latitude: results[0].geometry.location["jb"], longitude: results[0].geometry.location["kb"]};
          latitude = loc.latitude;
          longitude = loc.longitude;
          zipCodeCache[zipCode] = loc;
          if (status === google.maps.GeocoderStatus.OK) {
            if (callback) {
              callback(loc);
            }
            return loc;
          } else {
            console.log("Geocode was not successful for the following reason: " + status);
          }
          return null;
        });
      }
    },
    isEnabled: function () {
      return isLocationEnabled;
    },
    hasSet: function() {
      return hasSetOnce;
    },
    init: function () {
      if (!watchId) {
        watchId = navigator.geolocation.watchPosition(update, error);
      }
    },
    terminate: function () {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = 0;
      }
    },
    get: function () {
      return {
        latitude: latitude,
        longitude: longitude
      };
    }
  };
}());