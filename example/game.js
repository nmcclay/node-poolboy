

module.exports = function() {
	
	var game = {
		players : {},
		ports : [],
		ended : false,
		
		startGame : function() {
			var players = this.getAllPlayers();
			
			var startMessage = {gamestate : "startgame"};
			
			for (var key in players) {
				var player = players[key];
				player.sendData(startMessage);
			}
		},
		
		addPlayer : function(player) {
			player.game = this;
			
			player.socket.on('json',function(data){
				game.parsePlayerEvents(data,player);
			});
			
			player.socket.on('end',function(){
				game.removePlayer(player);
			});
			
			player.slot = this.ports.push(player.port) - 1;
			this.players[player.id] = player;
			console.log("player connected : " + player.id);
		},
		
		removePlayer: function(player) {
			var idx = this.ports.indexOf(player.port); // Find the index
			if(idx!=-1) this.ports.splice(idx, 1);
			delete this.players[player.id];
		},
		
		getRandomPlayer : function() {
			var otherPlayerSlot = Math.floor(Math.random(this.ports.length - 1));
			var portPick = this.ports[otherPlayerSlot];
			var playerPick = this.players[portPick];
			return playerPick;
		},
		
		getLastPlayer : function() {
			//console.log(this.ports);
			var portPick = this.ports[this.ports.length - 1];
			var playerPick = this.players[portPick];
			return playerPick;
		},
		
		getPlayerCount : function() {
			var players = this.getAllPlayers();
			var count = 0;
			for (var key in players) {
				count++;
			}
			return count;
		},
		
		getAllPlayers : function() {
			return this.players;
		},
		
		getAllOtherPlayersThanYou : function(player) {
			var allPlayers = this.players;
			delete allPlayers[player.id];
			return allPlayers;
		},
		
		getPlayerOtherThanYou : function(player) {
			console.log("my id: " + player.id + " of " + this.ports.length + " players");
			if (this.ports.length <= 1) {
				console.log('there are no other players!');
				this.checkWinState();
			} else {
				var newPlayer = this.getRandomPlayer();
				//console.log(newPlayer.id,player.id);
				if (newPlayer.id == player.id) {
					newPlayer = this.getLastPlayer();
				}
				//console.log(newPlayer.id);
				return newPlayer;
			}
		},
		
		parsePlayerEvents : function(json,player) {
			if (json instanceof Array) {
				for (var i=0; i < json.length; i++) {
					var pEvent = json[i];
					game.readPlayerEvent(pEvent,player);
				}
			} else {
				game.readPlayerEvent(json,player);
			}
		},
		
		readPlayerEvent : function(json,player) {
			console.log("read event from " + player.name,json);
			if (json.death) {
				if (json.death.type == "Player") {
					this.playerDied(player,json);
				} else {
					var spawnEvent = {
						spawn:{
							x: json.death.x,
							y: String(Number(json.death.y)),
							type: json.death.type,
							from : player.name,
						}
					};
					this.writeEnemySpawnAtPlayer(spawnEvent,this.getPlayerOtherThanYou(player));
				}
			}
			
			if (json.playername) {
				console.log('set player name: ' + json.playername);
				player.name = json.playername;
			}
			
			if(json.chat) {
				this.playerChat(player,json.chat)
			}
		},
		
		playerChat : function(player,msg) {
			var players = this.getAllPlayers();
			
			var msg = player.name + " : " + msg;
			
			var chatMessage = {chat : msg};

			for (var key in players) {
				var aPlayer = players[key];
				aPlayer.sendData(chatMessage)
			}
		},
		
		playerDied : function(player,data) {
			this.removePlayer(player);
			var otherPlayers = this.getAllOtherPlayersThanYou(player);
			
			var killedMessage = {playerkilled : player.name, killedby : data.death.killedby, owner : data.death.owner};

			for (var key in otherPlayers) {
				var otherPlayer = otherPlayers[key];
				otherPlayer.sendData(killedMessage)
			}
			this.checkWinState();
		},
		
		writeEnemySpawnAtPlayer : function(enemySpawn,player) {
			if (player) {
				player.sendData(enemySpawn);
			}
		},
		
		checkWinState : function() {
			if (!this.ended) {
				if (this.getPlayerCount() <= 1) {
					this.ended = true;
					var winner = this.getLastPlayer();
					var victoryMessage = {gamestate : "victory"};
					winner.sendData(victoryMessage)
				}
			}
		}
	}
	
	return game;
}

