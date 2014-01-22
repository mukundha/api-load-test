var client = require('scp2');
var fs = require('fs') ;
var q = require('q');

var dp = q.defer();
fs.readFile('darshan.key' , function(err,data){
	dp.resolve({"key":data});
});

dp.promise.then(function(ctx){
	client.defaults({
	    port: 22,
	    host: 'example.com',
	    username: 'admin',
	    privateKey: ctx.key
	});
	client.scp('app.js', 'bitnami@ec2-54-213-34-21.us-west-2.compute.amazonaws.com:/home/bitnami/', function(err) {
		console.log(err);
	});

});