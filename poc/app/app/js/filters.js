
var Filters = angular.module('Filters', []);

Filters.filter('fromNow', function() {
	return function(dateString) {
		return moment(new Date(dateString)).fromNow()
	};
});

Filters.filter('simpleDate', function() {
	return function(dateString) {
		return moment(new Date(dateString))
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
