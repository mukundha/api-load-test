var AWS = require('aws-sdk');
var fs = require('fs');
AWS.config = require('./config.js');
var ec2 = new AWS.EC2();
var client = require('scp2');
var q = require('q');
var Connection = require('ssh2');
var c = new Connection();



var params = {
  ImageId: 'ami-ff8e1acf', // Amazon RHEL 
  MinCount: 1, MaxCount: 1,
  KeyName:"darshan",
  SecurityGroupIds: ["sg-59e4053c"]
};


terminateInstance('i-0468e80c');
start();

//executeTests('54.201.149.165');
// fs.readFile('server.crt',function(err,data){
// 	if (err) { console.log(err); return;}

// 	ec2.importKeyPair({KeyName:'mukundha',PublicKeyMaterial:data}, function(err1,data){
// 		if (err1) { console.log(err1); return;}
// 		console.log(JSON.stringify(data));
// 	});
// });

//Create the instance
function start() {
	ec2.runInstances(params, function(err, data) {
	  if (err) { console.log("Could not create instance", err); return; }

	  console.log( data.Instances) ;
	  var instanceId = data.Instances[0].InstanceId;
	  console.log("Created instance", instanceId);

	  // Add tags to the instance
	  params = {Resources: [instanceId], Tags: [
	    {Key: 'Name', Value: instanceId}
	  ]};
	  ec2.createTags(params, function(err) {
	    console.log("Tagging instance", err ? "failure" : "success");
	  });
	  	ec2.startInstances ( {InstanceIds:[instanceId]},function(e1,d1){
			if ( e1) {console.log(e1); return ; }
			console.log(d1);
			setTimeout(function(){describeInstance(instanceId);},5000);
		});
	});
}

function describeInstance(instanceId){
	ec2.describeInstances ( {InstanceIds:[instanceId]},function(e2,d2){
			if ( e2) {console.log(e2); return ; }
			console.log(d2);
			console.log(d2.Reservations[0].Instances[0].State.Name);
			if( d2.Reservations[0].Instances[0].State.Name == "running")
			{
				console.log(JSON.stringify(d2));			
				var publicIp = d2.Reservations[0].Instances[0].NetworkInterfaces[0].Association.PublicIp;				
				console.log(publicIp);
				console.log(instanceId);
				//setTimeout( function(){copyFiles(publicIp);} , 10000 );
				//executeTests(publicIp);
			}
			else
				setTimeout(function(){describeInstance(instanceId);},5000);

		 });
}

// ec2.startInstances ( {InstanceIds:["i-f426a7fc"]},function(err,data){
// 	if ( err) {console.log(err); return ; }
// 	console.log(data);

// });


function terminateInstance(instanceId){
	ec2.terminateInstances ( {InstanceIds:[instanceId]},function(err,data){
		if ( err) {console.log(err); return ; }
		console.log(JSON.stringify(data));
	});
}

// ec2.describeInstances ( {InstanceIds:["i-84fa7a8c"]},function(err,data){
// 	if ( err) {console.log(err); return ; }
// 	console.log(JSON.stringify(data));
//  });

// ec2.describeSecurityGroups( {},function(err,data){
// 	if ( err) {console.log(err); return ; }
// 	console.log(JSON.stringify(data));
// });

// ec2.describeImages({},function(err,data){
// 	if ( err) {console.log(err); return ; }
// 	console.log(data);
// });
//  ec2.describeKeyPairs({KeyNames:[]},function(err,data){
// 	if ( err) {console.log(err); return ; }
// 	console.log(data);
// });
// ec2.createKeyPair({KeyName:"darshan"},function(err,data){
// 	if ( err) {console.log(err); return ; }
// 	fs.writeFile('darshan.key' , data.KeyMaterial,function(e,d){console.log(d);});
// 	fs.writeFile('darshan.print' , data.KeyFingerprint,function(e,d){console.log(d);});
	
// });