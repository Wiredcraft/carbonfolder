
// var fs = require('fs');
// var gm = require('gm');

// module.exports = function(file, dst, size, cb) {
//   console.log('Renaming file', file, dst)
//   fs.rename(file.path, dst, function(err) {
//     if (err) {
//       console.error(err);
//       if (cb) cb(err);
//       return ;
//     }

//     gm(dst)
//       .resize(size, size)
//       .stream(function(err, stdout, stderr) {
// 	if (err) {
// 	  console.error(err);
// 	  if (cb) cb(err);
// 	  return;
// 	}

// 	gm(stdout)
// 	  .crop(size - 2, size - 2, 1, 1)
// 	  .write(dst + '-' + size, function(err) {
// 	    console.info('Resize done')
// 	    if (cb) return cb(null);				
// 	  });	
//       });
//   });
// }
