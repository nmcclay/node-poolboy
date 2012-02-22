module.exports = function() {
	var player = {
		id : null,
		name : null,
		port : null,
		slot : null,
		socket : null,
		sendData : function(json) {
			if (this.socket)  {
				console.log("sending to player " + this.id,json);
				try {
					this.socket.write(JSON.stringify(json) + "\n");
				} catch(err) {
					console.log("sending request to player " + this.id + " failed!",err);
					this.killPlayer();
				}
				
			}
		},
		killPlayer : function() {
			if (this.game) this.game.playerDied(this);
		},
		getSimpleData : function() {
			var data = {id : this.id,name : this.name};
			return data;
		}
	};

	return player;
}