Poolboy example project: Banished Server
===

Check out the game this server is based on: [Banished](http://banished.nickmcclay.com)

## Background
This is a unity/nodejs project I did in 48 hours for the 2012 global game jam.  
This shows a simple example of a fully functional lobby that starts games when enough players join.
	
### lobby.js
This is a fully functional game lobby with queuing for players and support for chat while waiting in the lobby.

### player.js
This is an example of a player within the server, he contains the logic for sending data, as well as some specific game logic

### game.js
This contains the vast majority of game specific logic about the server interaction with the game.