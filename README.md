TCP Connection Pool for Node.js
===

### To install:
	npm install poolboy

### To setup:
	// import poolboy
	var poolboy = require('poolboy');
	// create connection pool with request port
	var poolServer = poolboy.setupConnectionPool(5000);
	
TCP requests to port 5000 will now setup a new socket and return the socket port for a new tcp connection

### Listening for new connections
	// event for when a client connects to the request port and creates a new port
	poolServer.on('newport',function(port) {
		console.log("new socket created on port " + port.address().port)
	})

### Manually adding new connections:
	// assigns new port
	var newServer = poolboy.add()
	// assigns a new specific port number
	var newSpecificServer = poolboy.add(1234)
	
### Serving cross domain policy documents:
currently supports unity/flash cross domain policy format

	poolboy.crossPolicyEnabled = true;
	poolboy.crossPolicyPort = 8080; // defaults to 3001

### Parse JSON responses:
	poolboy.jsonEmitEnabled = true;
	
	poolServer.on('newport',function(port) {
		port.on('json',function(json) {
			console.log("got a json object!",json);
		})
	})
	