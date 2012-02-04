TCP Connection Pool for Node.js
===

### To setup:
	// import poolboy
	var poolboy = require('poolboy');
	// create connection pool with request port
	var poolServer = poolboy.setupConnectionPool(5000);
	
TCP requests on port 5000 will now setup a new socket and return the socket port for creating a new tcp connection

### Adding new connections:
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
	