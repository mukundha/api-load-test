//Runs apib
var Connection = require('ssh2');
var q = require('q');
var c = new Connection();
var fs = require('fs');
var client = require('scp2');
var AdmZip = require('adm-zip');

var baseFolder = '/Users/Mukunda/Documents/mukundha/work/apimodel';
var user = 'root' ;
var host = '54.213.61.244';

var connectionString = user +'@' + host + ':/root' ;

var apib = require(baseFolder + '/apib.js');

var privateKey = fs.readFileSync('darshan.key');
var p = apib.resolveTests(baseFolder); //Later qualify with basefolder
p.then(function(){
    var dp = q.defer();
    client.defaults({
      port: 22,
      host: host,
      username: user,
      privateKey: privateKey
    });
    var zip = new AdmZip();
    fs.readdir( baseFolder + '/apib/' , function(err,files){
      for (var i in files){
        if ( files[i].indexOf('.apib')){
          zip.addLocalFile(baseFolder + '/apib/' + files[i]);
        }
      }
      zip.writeZip( baseFolder + '/apib/apibtests.zip');
      console.log('writing to server');
      client.scp( baseFolder + '/apib/apibtests.zip', connectionString + '/apib' , function(err) {
        console.log(err);
        dp.resolve({});
      });
    });
    
    return dp.promise;
}).then(function(){
   var dp = q.defer(); 
  var commands = [ 'unzip -o apib/apibtests.zip -d apib'] ;
  fs.readdir( baseFolder + '/apib', function(err,files){
    for (var i in files){
      if ( files[i].indexOf('.apib')>0){
        var command = 'apib -c 10 -d 10 -S @apib/' + files[i] ;
        commands.push(command);
      }
    }
    commands.push( 'rm -rf apib/*.json');
    commands.push( 'rm -rf apib/*.apib');
    commands.push( 'rm -rf apib/*.zip');
    dp.resolve({commands:commands});
  });
  return dp.promise;
}).then (function(ctx){
    start(ctx.commands);
});

function start(cmds){
  c.on('ready', function() {
    console.log('Connection :: ready');
    runOneCommand(cmds,0);
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
    host: host,
    port: 22,
    username: user,
    privateKey: privateKey
  });
}

function runOneCommand(commands,index){
  var command = commands[index];
  var p = execute(command);
  p.then(function(){
     if ( index + 1 < commands.length)
      runOneCommand (commands, index+1);
    else{
      c.end();
    }
  });
}
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
      var fileName = command.split('@')[1];
      fs.writeFile(fileName + '.result' , streamdata, function(err){ if ( err) console.log(err);});
      console.log('Stream :: close');
      dp.resolve({});
    });
    stream.on('exit', function(code, signal) {
      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
    });
  });
    return dp.promise;
}