/**
 * User: Troy
 * Date: 5/25/13
 * Time: 7:57 PM
 */

var App = App || {};

App.Fetch = (function () {
  var source = $("#listing-template").html(),
    template = Handlebars.compile(source),
    apiKey = "896eaa9f49a1c77a595b7d3279a1c464",
    term = "coffee",
    numListing = 20,
    currentPage = 1,
    listings = null,
    totalPage = 0,
    location = "90023";

  return {
    get: function (options, callback) {
      var loc = App.Location.get(),
        url = "http://api.openweathermap.org/data/2.5/weather?units=imperial&cnt=7&lat=" + loc.latitude + "&lon=" + loc.longitude;
      console.log("URL = " + url);

      $.ajax({
        url: url,
        dataType: "JSONP"
      }).done(function (data) {
          if (data) {
            App.Converter.epochToTime(data.sys.sunset);
            if (callback) {
              callback(data);
            }
          }
        });
    }
  };
}());
