require("babel-register");

var express = require('express');
var app = express();
var http = require('http');
var sockjs = require('sockjs');
var CarController = require("./libs/controller.js");
var carCtrl = new CarController();

app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/node_modules'));

app.listen(3000, '0.0.0.0', function () {
    console.log('Example app listening on port 3000!');
});

var echo = sockjs.createServer({sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'});
echo.on('connection', function (conn) {
    conn.on('data', function (message) {
        conn.write(message);
        carCtrl.processCommand(message);
    });
    conn.on('close', function () {
    });

    carCtrl.registerDistanceNotify(function(dist){
        conn.write(JSON.stringify({type:"distance", value:dist}));
    });

    carCtrl.registerSpeedNotify(function(speed){
        conn.write(JSON.stringify({type:"speed", value:speed}));
    });

    carCtrl.registerMagNotify( function(mag){
        conn.write(JSON.stringify({type:"mag", value:mag}));
    })

    carCtrl.registerAccNotify( function(acc){
        conn.write(JSON.stringify({type:"acc", value:acc}));
    })
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/echo'});
server.listen(9999, '0.0.0.0');