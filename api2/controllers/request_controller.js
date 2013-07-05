exports.index = function(req, res){
  res.send('request index');
};

exports.new = function(req, res){
  res.send('new request');
};

exports.create = function(req, res){
  res.send('create request');
};

exports.show = function(req, res){
  res.send('show request ' + req.params.request);
};

exports.edit = function(req, res){
  res.send('edit request ' + req.params.request);
};

exports.update = function(req, res){
  res.send('update request ' + req.params.request);
};

exports.destroy = function(req, res){
  res.send('destroy request ' + req.params.request);
};
