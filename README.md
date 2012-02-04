A Nodejs tcp connection pool with support for serving cross domain policy documents
===

### To use:

	// import poolboy
	var poolboy = require('poolboy');
	// create connection pool with request port
	var poolServer = poolboy.setupConnectionPool(5000);
	

