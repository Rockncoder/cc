/**
 * User: Troy
 * Date: 4/30/13
 * Time: 9:15 PM
 */

var App = App || {};

App.Coffee = (function () {
  var source = $("#listing-template").html(),
    template = Handlebars.compile(source),
    apiKey = "896eaa9f49a1c77a595b7d3279a1c464",
    term = "coffee",
    numListing = 20,
    currentPage = 1,
    listings = null,
    totalPage = 0,
    location = "90023"; //"92705";

  return {
    getBusiness: function(id){
      var item, ndx,
        results = null,
        list = listings.searchListings.searchListing,
        len = list.length;
      id = +id;
      for(ndx=0; ndx < len; ndx += 1){
        item = list[ndx];
        if(item.listingId === id){
          results = item;
          break;
        }
      }
      return results;
    },
    previousListings:function () {

    },
    nextListings:function () {

    },
    showCurrentListing:function () {
      var stripPageNum = function (that) {
        var pageNum = +$(that).attr("href").replace("#", "");
        return pageNum;
      };
      totalPage = listings.metaProperties.totalAvailable;
      $("#prevListing").off();
      $("#nextListing").off();
      $("#locations").html(template(listings)).trigger("create");

      if (currentPage < 2) {
        $("#prevListing").hide();
      }

      if (currentPage * numListing > totalPage) {
        $("#nextListing").hide();
      }
    },
    getBusinesses: function() {
      var list, results = null;

      if(listings && listings.searchListings && listings.searchListings.searchListing){
        results = listings.searchListings.searchListing;
      }
      return results;
    },
    get:function (options, callback) {
      var radius = App.Config.searchRadius;

      if (options) {
        currentPage = options.currentPage || currentPage;
        location = options.location || location;
      }

      if(App.Config.useZipCode === "on"){
        location = App.Config.zipCode;
      }

      $.ajax({
        url:"http://api2.yp.com/listings/v1/search?searchloc=" + location + "&pagenum=" + currentPage + "&term=" + term + "&format=json&sort=distance&radius="+radius+"&listingcount=" + numListing + "&key=" + apiKey,
        dataType:"JSONP"
      }).done(function (data) {
          listings = data.searchResult;
          //debugger;
          if (callback) {
            callback(listings);
          }
        });
    }
  };
})();