/**
 * User: Troy
 * Date: 5/26/13
 * Time: 7:07 AM
 */

var App = App || {};

App.Converter = (function () {

  return {
    kelvinToFarenheit: function (kelvin) {
      var fahrenheit = ((kelvin - 273) * 1.8) + 32;
      return fahrenheit;
    },
    epochToTime: function(epoch){
      var time = moment.unix(epoch);
      return time;
    }
  };
}());
