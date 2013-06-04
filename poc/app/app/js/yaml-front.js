/* global jsyaml */

var jsYaml = {};

jsYaml.convert = function (text, name) {
  name = name || '__content';
  
  var re = /^-{3}([\w\W]+?)(-{3})([\w\W]*)*/,
      results = re.exec(text),
      conf;

  if(results) {
    conf = jsyaml.load(results[1]);
    if (typeof results[3] !== 'undefined') conf[name] = results[3];
  }
  return conf;
};


