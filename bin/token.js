var exec = require('child_process').exec;
var child = exec('node ./scripts/token.js', function(err, stdout, stderr) {
  console.log(stdout);
});
