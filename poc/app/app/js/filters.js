
var Filters = angular.module('Filters', []);

Filters.filter('fromNow', function() {
  return function(dateString) {
    return moment(new Date(dateString)).fromNow();
  };
});

Filters.filter('simpleDate', function() {
  return function(dateString) {
    return moment(new Date(dateString));
  };
});

// HEAVY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Filters.filter('objectLength', function() {
  return function(object) {
    if (object)
      return Object.keys(object).length;
    else
      return 0;
  };
});

Filters.filter('beautifyJson', function() {
  return function(json) {
    var str = angular.copy(json);
    // at edit server page shouldn't show tmp information
    if (str && str.tmp) {
      delete str.tmp;
    }
    
    return JSON.stringify(str, null, 4);
  };
});

Filters.filter('bytesToMb', function() {
  var bytesToSize = function(bytes, precision) {
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;

    if ((bytes >= 0) && (bytes < kilobyte)) {
      return bytes + ' B';
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
      return (bytes / kilobyte).toFixed(precision) + ' KB';
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
      return (bytes / megabyte).toFixed(precision) + ' MB';
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
      return (bytes / gigabyte).toFixed(precision) + ' GB';
    } else if (bytes >= terabyte) {
      return (bytes / terabyte).toFixed(precision) + ' TB';
    } else {
      return bytes + ' B';
    }
  };

  return function(bytes) {
    return bytesToSize(bytes, 1);
  };
});
