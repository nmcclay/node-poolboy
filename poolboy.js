var net = require('net');
var fs = require('fs');

var ports = module.exports.ports = {};

var poolExists = false;
var minPortRange = module.exports.minPortRange = 5000;
var maxPort = module.exports.maxPortRange = 5100;
var curAvailablePort = module.exports.curAvailablePort = minPortRange;
var jsonEmitEnabled = module.exports.jsonEmitEnabled = true;
var crossPolicyEnabled = module.exports.crossPolicyEnabled = true;
var crossPolicyPort = module.exports.crossPolicyPort = 3001;

var requests = 0;

var getOpenPort = function() {
	curAvailablePort++;
	var newPort = curAvailablePort;

	if (ports[newPort]) {
		newPort = getOpenPort();
	}
	
	if (newPort >= maxPort) { // if over max port allocation
		curAvailablePort = minPort;
		newPort = getOpenPort();
	}
	
	return newPort;
}

var addJSONEmitToSocket = function(socket) {
	var getJSON = function(data) {
		var json = false;
		try {
			json = JSON.parse(data);
			console.log("parse: ",json);
		} catch(err) {
			console.log("can't parse~!",data);
		}
		return json;
	}
	
	socket.on('data', function(data) {
		var json = getJSON(data);
		
		if (json) {
			socket.emit('json',json);
		}
	});
	
	return socket;
}

var createServer = function(port,persist) {
	if (!port) throw new Error("server needs a port!");
	if (ports[port]) throw new Error("server port already taken!");
	
	var server = net.createServer(function(c) {//'connection' listener
		console.log('tcp server ' + port + ' connected');
		c.on('data', function(data) {
			requests++
			console.log("request number: " + requests);
			
		});
		c.on('end', function() {
			if (!persist) {
				console.log('tcp server ' + port + ' disconnected');
				remove(port);
			}
		});
		if (jsonEmitEnabled) addJSONEmitToSocket(c);
	});
	
	server.listen(port, function() {//'listening' listener
		console.log('tcp server ' + port + ' bound');
	});
	
	ports[port] = server;
	
	return server;
}

var setupCrossDomainPort = function() {
	var policyServer = createServer(crossPolicyPort,true);
	policyServer.on('connection',function(socket) {
		var policyXML = '<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" to-ports="' + minPortRange + '-' + maxPortRange + '"/></cross-domain-policy>'
		socket.write(policyXML);
	});
}


var add = module.exports.add = function(port) {
	if (!port) port = getOpenPort();
	return createServer(port);
}

var remove = module.exports.remove = function(port) {
	if (!port || !ports[port]) throw new Error("port doesn't exist damnit!");
	var server = ports[port];
	try {
		server.close();
	} catch(err) {
		console.log(err);
	}
	ports[port] = null;
}

var setupConnectionPool = module.exports.setupConnectionPool = function(reqPort) {
	if (poolExists) throw new Error("server connection pool already setup!");
	if (!reqPort) throw new Error("server needs connection pool port!");
	if (ports[reqPort]) throw new Error("server connection pool port already taken!");
	
	var server = createServer(reqPort,true);
	
	server.on('connection',function(poolSocket) {
		var newServer = add();
		var newPort = newServer.address().port;
		poolSocket.write(String(newPort) + '\n');
		server.emit('newport',newServer);
	})
	
	if (crossPolicyEnabled) setupCrossDomainPort();
	
	poolExists = true;
	
	return server;
};
