var poolboy = require('poolboy');
var Game = require('./game.js');
var Player = require('./player.js');

var poolServer = module.exports.poolServer = poolboy.setupConnectionPool(5000);

var nextGame = null;
var currentGame = null;
var queuedPlayers = {};
var readyPlayers = {};

var getReadyPlayerCount = function() {
	var players = readyPlayers;
	var count = 0;
	for (var key in players) {
		count++;
	}
	return count;
}

var sendWaitingGameNotice = function() {
	var players = readyPlayers;
	var playersData = [];
	for (var key in players) {
		var player = players[key];
		playersData.push(player.getSimpleData());
		
	}
	
	for (var key in players) {
		var player = players[key];
		player.sendData({gamestate : "waiting",players:playersData})
	}
}

var sendPreGameNotice = function() {
	var players = readyPlayers;
	var playersData = [];
	for (var key in players) {
		var player = players[key];
		playersData.push(player.getSimpleData());
	}
	
	for (var key in players) {
		var player = players[key];
		player.sendData({gamestate : "pregame",players:playersData})
	}
}

var waitOnPlayers = function() {
	console.log("waiting on players...");

	setTimeout(function() {
		sendWaitingGameNotice();
		if (getReadyPlayerCount() >= 2) {
			console.log("getting ready to start game...");
			sendPreGameNotice();
			setTimeout(function() {
				console.log("starting game...");
				currentGame = nextGame;
				for (var key in readyPlayers) {
					var playerServer = readyPlayers[key];
					currentGame.addPlayer(playerServer);
					delete readyPlayers[key];
				}
				currentGame.startGame();
				nextGame = createNewGame();
			},5000);
		}
		waitOnPlayers();
	},10000)
}

var createNewGame = function() {
	var game = new Game();
	
	queuedPlayers = {};
	readyPlayers = {};
	
	poolServer.on('newport',function(port) {
		addServer(port);
	})
	
	return game;
}

var playerChat = function(name,msg) {
	var players = readyPlayers;
	
	var msg = name + " : " + msg;
	
	var chatMessage = {chat : msg};

	for (var key in players) {
		var aPlayer = players[key];
		aPlayer.sendData(chatMessage)
	}
};

var addServer = function(server) {
	var port = server.address().port;
	
	var playerConnected = function(socket) {
		var player = new Player();
		
		socket.on('json',function(data){
			if (data.playername) {
				console.log('set player name: ' + data.playername);
				var queuedPlayer = queuedPlayers[port];
				if (queuedPlayer) {
					queuedPlayer.name = data.playername;
					delete queuedPlayers[port];
					readyPlayers[port] = queuedPlayer;
				}
			}
			
			if(data.chat) {
				if (readyPlayers[port] && readyPlayers[port].name) playerChat(readyPlayers[port].name,data.chat)
			}
		});
		
		player.socket = socket;
		player.port = port;
		player.id = String(port);
		
		socket.on('end',function() {
			console.log("connection ended in lobby...")
			if (queuedPlayers[port]) delete queuedPlayers[port];
			if (readyPlayers[port]) delete readyPlayers[port];
		});

		queuedPlayers[port] = player;
	}

	server.on('connection',playerConnected);
	
	setTimeout(function() {
		if(!queuedPlayers[port] && !readyPlayers[port]) {
			console.log("player did not connect in a timely manner, closing connection " + port)
			try {
				server.close();
			} catch(err) {
				console.log(err);
			}
			
		}
	},5000);
};

nextGame = createNewGame();
waitOnPlayers();
