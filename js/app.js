var App = App || {};

(function (App, $, iScroll, window) {
  "use strict";

  $("#splashPage").one("pageinit", function (event) {
    App.Bob(App, $, iScroll, window);
  });
}(App, $, iScroll, window));

App.Bob = (function (App, $, iScroll, window) {
  "use strict";

  var detailsSource = $("#details-template").html();

  App.Templates = {
    details: Handlebars.compile(detailsSource)
  };

  App.Pages = App.Pages || {};
  App.CurrentListing = 0;
  App.Config = {
    zipCode: "90023",
    useZipCode: false,
    searchRadius: 10
  };

  App.Pages.Kernel = function (event) {
    var that = this,
      eventType = event.type,
      pageName = $(this).attr("data-app-jspage");
    if (App && App.Pages && pageName && App.Pages[pageName] && App.Pages[pageName][eventType]) {
      App.Pages[pageName][eventType].call(that);
    }
  };

  App.Pages.Events = (function () {
    $("div[data-app-jspage]").on(
      'pagebeforecreate pagecreate pagebeforeload pagebeforeshow pageshow pagebeforechange pagechange pagebeforehide pagehide pageinit',
      App.Pages.Kernel
    );
  }());

  App.Dimensions = (function () {
    var width, height, headerHeight, footerHeight, contentHeight,
      isIPhone = (/iphone/gi).test(navigator.appVersion);
    console.log("AppVersion " + navigator.appVersion);
//    alert("AppVersion " + navigator.appVersion);
    return {
      get: function () {
        width = $(window).width();
        height = $(window).height() + (isIPhone ?  60 : 0);
        headerHeight = $("header", $.mobile.activePage).height() || 0;
        footerHeight = $("footer", $.mobile.activePage).height() || 0;
        contentHeight = height - headerHeight - footerHeight;

        return {
          width: width,
          height: contentHeight
        };
      }
    };
  }());

  App.Pages.splashPage = (function () {
    var timeHandle = null,
      $splash = $("#splashContent"),
      changePg = function () {
        $.mobile.changePage("#page1");
      };
    return {
      pageshow: function () {
        // set the CSS height dynamically
        // height will give us a taller hit target region
        var dim = App.Dimensions.get();
        $splash.css('height', dim.height);
        // if the user taps, clicks, or swipes go to the next page
        $splash.on("tap click swiperight swipeleft swipe", changePg);
        // wait 3 seconds
        timeHandle = setTimeout(function () {
          changePg();
          timeHandle = null;
        }, 3000);
      },
      pagehide: function () {
        // if the timer hasn't been cleared already, clear it
        if (timeHandle) {
          clearTimeout(timeHandle);
          timeHandle = null;
        }
      }
    };
  }());

  App.Pages.homePage = (function () {
    var isShowingListings = false,
      showListings = function () {
        $.mobile.loading("show");
        $(window).one("rnc_position", function (evt, latitude, longitude, accuracy) {
          App.Coffee.get({location: latitude + ":" + longitude}, function (listings) {
            $.mobile.loading("hide");
            App.Coffee.showCurrentListing();
            isShowingListings = true;
            $(".listing").off().on("click", function (evt) {
              App.CurrentListing = this.attributes.getNamedItem("data-rnc-listingid").value;
            });
          });
        });
      };
    return {
      pageshow: function () {
        var dim = App.Dimensions.get();

        App.Fetch.get();
        var fahr = App.Converter.kelvinToFarenheit(373);
        console.log("373k = "+fahr+" degrees f");

        $("#horizontalWrapper").css('height', dim.height);
        $("#verticalWrapper").css('height', dim.height);
        $('#homePanelReset').on('tap', showListings);
        if (!isShowingListings) {
          showListings();
        }
      },
      pagehide: function () {
      }
    };
  }());

  App.Pages.mapPage = (function () {
    var map, marker, markers = [],
      loc,
      mapElement = $("#map").get(0),
      options = {
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      },
      drawMarkers = function (map, listings) {
        var biz, ndx, len = listings.length;
        for (ndx = 0; ndx < len; ndx += 1) {
          biz = listings[ndx];
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(biz.latitude, biz.longitude),
            map: map,
            bizId: biz.listingId,
            title: biz.businessName
          });
          markers.push(marker);
          google.maps.event.addListener(marker, 'click', function (evt) {
            App.CurrentListing = this.bizId;
            $.mobile.changePage("#detailsPage");
          });
        }
      },
      eraseMarkers = function (map) {
        while (markers && markers.length) {
          marker = markers.pop();
          marker.setMap(null);
          console.log("marker = " + marker.title + ", " + marker.bizId);
        }
      },
      updateMap = function (map) {
        var listings = App.Coffee.getBusinesses();
        if (listings) {
          drawMarkers(map, listings);
        }
      };
    return {
      pageshow: function () {
        // set the CSS height dynamically
        var dim = App.Dimensions.get();
        $("#map").css('height', dim.height);

        loc = App.Location.get();
        options.center = new google.maps.LatLng(loc.latitude, loc.longitude);
        map = new google.maps.Map(mapElement, options);

        $("#mapPageHome").on("tap click", function (evt) {
          var loc = App.Location.get();
          map.setCenter(new google.maps.LatLng(loc.latitude, loc.longitude));
        });
        // draw markers on the map
        eraseMarkers(map);
        updateMap(map);
      }
    };
  }());

  App.Pages.settingsPage = (function () {
    return {
      pageshow: function () {
        var $zipCode = $("#zipCode"),
          $useZipCode = $('#useZipCode'),
          $searchRadius = $('#searchRadius'),
          dim = App.Dimensions.get();

        $("#mySettings").css('height', dim.height);

        // set initial values based on preserved ones
        $searchRadius.val(App.Config.searchRadius);
        $zipCode.val(App.Config.zipCode);
        $useZipCode.val(App.Config.useZipCode);

        // listen for changes
        $useZipCode.on("change", function (evt) {
          $zipCode.textinput(this.value === "on" ? "enable" : "disable");
          App.Config.useZipCode = this.value;
        });
        $zipCode.on('change', function (evt) {
          App.Config.zipCode = this.value;
        });
        $searchRadius.on('change', function (evt) {
          App.Config.searchRadius = this.value;
        });
      }
    };
  }());

  App.Pages.creditsPage = (function () {
    return {
      pageshow: function () {
        // set the CSS height dynamically
        var dim = App.Dimensions.get();
        $("#myCredits").css('height', dim.height);
//
//        var $zipCode = $("#zipCode"),
//          $useZipCode = $('#useZipCode'),
//          $searchRadius = $('#searchRadius');
//
//        // set initial values based on preserved ones
//        $searchRadius.val(App.Config.searchRadius);
//        $zipCode.val(App.Config.zipCode);
//        $useZipCode.val(App.Config.useZipCode);
//
//        // listen for changes
//        $useZipCode.on("change", function (evt) {
//          $zipCode.textinput(this.value === "on" ? "enable" : "disable");
//          App.Config.useZipCode = this.value;
//        });
//        $zipCode.on('change', function (evt) {
//          App.Config.zipCode = this.value;
//        });
//        $searchRadius.on('change', function (evt) {
//          App.Config.searchRadius = this.value;
//        });
      }
    };
  }());

  App.Pages.detailsPage = (function () {
    var myScroll, map, loc,
      latLong = new google.maps.LatLng(34.0522, -118.2428),
      mapElement = $("#miniMap").get(0),
      options = {
        mapTypeControl: false,
        streetViewControl: false,
        center: latLong,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      },
      $details = $("#detailsContent");
    return {
      pageshow: function () {
        // set the CSS height dynamically
        var info = App.Coffee.getBusiness(App.CurrentListing),
          divHeight, totalHeight,
          bob,
          marker,
          infoWindow = new google.maps.InfoWindow({}),
          dim = App.Dimensions.get();

        $details.html(App.Templates.details(info)).trigger("create");
        divHeight = $details.height();
        totalHeight = dim.height - divHeight - 32;
        $("#miniMap").css('height', totalHeight);
        bob = new google.maps.LatLng(info.latitude, info.longitude);
        options.center = bob;
        map = new google.maps.Map(mapElement, options);
        marker = new google.maps.Marker({
          position: bob,
          map: map
        });
        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open(map, marker);
        });
      },
      pagehide: function () {
      }
    };
  }());

  App.Pages.verticalPage = (function () {
    var myScroll;
    return {
      pageshow: function () {
        myScroll = new iScroll('verticalWrapper');
      },
      pagehide: function () {
        myScroll.destroy();
        myScroll = null;
      }
    };
  }());

  App.Pages.horizontalPage = (function () {
    var myScroll;
    return {
      pageshow: function () {
        myScroll = new iScroll('horizontalWrapper');
      },
      pagehide: function () {
        myScroll.destroy();
        myScroll = null;
      }
    };
  }());


  App.Pages.twoWayPage = (function () {
    var dim, verticalScroller, horizontalScroller, pullDownEl, pullDownHeight, $pullDown, $pullDownLabel,
      callRefresh = function() {
        setTimeout(function(){
          verticalScroller.refresh();
        },2000);
      };
    return {
      pageshow:function () {
        // determine the height dynamically
        dim = App.Dimensions.get();
        $("#vWrapper").css('height', dim.height);

        $pullDown = $('#pullDown');
        $pullDownLabel = $pullDown.find('.pullDownLabel');
        pullDownEl = document.getElementById('pullDown');
        pullDownHeight = $pullDown.outerHeight();

        verticalScroller = new iScroll('vWrapper', {
            topOffset:pullDownHeight,
            useTransition:true,
            hScrollbar: false,
            vScrollbar: false,
            onRefresh:function () {
              if($pullDown.hasClass('loading')){
                $pullDown.removeClass();
                $pullDownLabel.html('Pull down to refresh...');
              }
            },
            onScrollMove:function () {
              if (this.y > 5 && !$pullDown.hasClass('flip')) {
                $pullDown.addClass('flip');
                $pullDownLabel.html('Release to refresh...');
                this.minScrollY = 0;
              } else if (this.y < 5 && $pullDown.hasClass('flip')) {
                $pullDown.removeClass();
                $pullDownLabel.html('Pull down to refresh...');
                this.minScrollY = -pullDownHeight;
              }
            },
            onScrollEnd:function () {
              if ($pullDown.hasClass('flip')) {
                $pullDown.removeClass();
                $pullDown.addClass('loading');
                $pullDownLabel.html('Loading...')
                callRefresh();
              }
            }
          }
        );
        horizontalScroller = new iScroll('hWrapper');
      },
      pagehide:function () {
        verticalScroller.destroy();
        verticalScroller = null;
        horizontalScroller.destroy();
        horizontalScroller = null;
      }
    };
  }());
});
