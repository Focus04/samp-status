Node-GbxRemote
===

JavaScript ([node.js](http://nodejs.org)) port of [GbxRemote](http://code.google.com/p/manialive/source/browse/trunk/libraries/DedicatedApi/Xmlrpc/Client.php) by [Nadeo](http://www.nadeo.com),
which is built on [Incutio XML-RPC Library](http://scripts.incutio.com/xmlrpc/).

Used to communicate with [ManiaPlanet](http://www.maniaplanet.com) servers.

*Note: The API may, or may not change!*

Install
---

```bash
npm install gbxremote
```

To Use
---

Look in [/examples/](https://github.com/MiniGod/node-gbxremote/tree/master/example) for all examples.

---

The following examples expects that `var gbxremote = require('gbxremote')`.

### Connecting:

To connect to a server, use `var client = gbxremote.createClient(port, [host]);`

*Examples of ways to connect to the server:*

```javascript
// Connect with port only
var client = gbxremote.createClient(5000);
client.on('connect', onConnect);

// Connect with port and hostname
var client = gbxremote.createClient(5000, 'localhost');
client.on('connect', onConnect);

// Connect with port and ip
var client = gbxremote.createClient(5000, '127.0.0.1');
client.on('connect', onConnect);

// Create client and connect explicitly
var client = new gbxremote.Client(5000, 'localhost');
client.connect().then(onConnect);
```

### Querying:

Queries are sent to the server by calling `client.query(method, [params]);`  
`client.query` returns a promise.

*Queries before the connect event has been emitted will be queued and sent on connect!*

[See the full list of methods.](http://methods.xaseco.org/methodstmc.php)

```javascript
var client = gbxremote.createClient(5000);

client.on('connect', function() {

	// GetVersion does not take any params.
	client.query('GetVersion').then(function (res) {
		console.log('Server version:', res.join(', '));
	}).catch(function(err) {
		console.error('Error when querying server:', err);
	});
	
	// GetPlayerInfo takes 2 parameters, 1 optional.
	// GetPlayerInfo(string login, [int compatibility])
	client.query('GetPlayerInfo', ['minigod']).then(function (res) {
		console.log('Player info:');
		console.log(res);
	}).catch(function (err) {
		console.error('Error getting player info:', err);
	});
});
```

### Disconnecting:

`client.terminate();`

### Events:

#### Event: connect()

Emitted when connection to the server is successfull.  
Ready to receive queries!

```javascript
var client = gbxremote.createClient(5000);

client.on('connect', function() {
	console.log('Connection successfull! Lets do some queries!');
	client.query('EnableCallbacks', true);
});
```
If there is a problem connecting, the 'connect' event will not be emitted, the 'error' event will be emitted with the exception.

#### Event: error(err)

Emitted when:
* Socket errors *(host is not listening on that port, loose connection, etc.)*
* Handshake fails *(host* ***is*** *listening on that port, but its not a ManiaPlanet (GbxRemote 2) server)*

```javascript
var client = gbxremote.createClient(5000);

client.on('error', function(err) {
	console.error('Connection failed: ' + err);
});
```

#### Event: callback(method, params)

After sending `EnableCallbacks(true)` to the server, it will send you callbacks when stuff happend on the server.  
Eg:
* `ManiaPlanet.ServerStart`
* `ManiaPlanet.ServerStop`
* `ManiaPlanet.PlayerConnect`
* `ManiaPlanet.PlayerChat`

[See the full list of callbacks](http://server.xaseco.org/callbacks2.php)

```javascript
var client = gbxremote.createClient(5000);

client.on('connect', function() {
	client.query('SetApiVersion', ['2012-06-19']);
	client.query('EnableCallbacks', [true]);
});

client.on('callback', function(method, params) {
	console.log("Callback from server: %s - %d params", method, params.length);
	
	// This would be the typical place to have a switch statement. Please dont do that. Use the events, as shown below.
});
```

#### Event: \<method\>(params)

Callbacks will also emit separate events for each method. It's hard to explain. Learn from example:

```javascript
var client = gbxremote.createClient(5000);

client.on('connect', function() {
	// Before enabling callbacks, make sure you set the latest API.
	client.query('SetApiVersion', ['2012-06-19']);
	client.query('EnableCallbacks', [true]);
});

// ManiaPlanet.PlayerConnect(string Login, bool IsSpectator);
client.on('ManiaPlanet.PlayerConnect', function(params) {
	console.log('%s just joined as a %s', params[0], params[1] ? 'spectator' : 'player');
});

// ManiaPlanet.PlayerDisconnect(string Login); 
client.on('ManiaPlanet.PlayerDisconnect', function(params) {
	console.log('%s left the server', params[0]);
});
```

These events can basically take over the big switch statements that is normal in todays server controllers.

#### Event: close(had_error)

Emitted once the socket is fully closed.
The argument had_error is a boolean which says if the socket was closed due to a transmission error.

```javascript
var client = gbxremote.createClient(5000);

client.on('connect', function() {
	// Connected...
	
	// Do stuff?
	
	// Disconnect
	client.terminate();
});

client.on('close', function(had_error) {
	console.log('Connection to the server has been closed');
});
``` 

The License (MIT)
---

Released under the MIT license. See the LICENSE file for the complete wording.

