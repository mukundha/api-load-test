var Connection = require('ssh2');
var q = require('q');
var c = new Connection();
var fs = require('fs');
c.on('ready', function() {
  console.log('Connection :: ready');
  var command = 'apib -c 10 -d 10 -S @urls';
  var p = execute(command);
  p.then(function(){
      console.log("success");
      c.end();
  });

});
c.on('error', function(err) {
  console.log('Connection :: error :: ' + err);
});
c.on('end', function() {
  console.log('Connection :: end');
});
c.on('close', function(had_error) {
  console.log('Connection :: close');
});
c.connect({
  host: '54.213.75.249',
  port: 22,
  username: 'ec2-user',
  privateKey: require('fs').readFileSync('darshan.key')
});

function execute(command){
    var dp = q.defer();
    console.log(command);
    var streamdata = '';
    c.exec(command, function(err, stream) {
    if (err) throw err;
    stream.on('data', function(data, extended) {
      streamdata+=data;
      console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                  + data);
    });
    stream.on('end', function() {
      console.log('Stream :: EOF');
    });
    stream.on('close', function() {
      fs.writeFile('result.csv' , streamdata, function(err){});
      console.log('Stream :: close');
      dp.resolve({});
    });
    stream.on('exit', function(code, signal) {
      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
      
    });
  });
    return dp.promise;
}