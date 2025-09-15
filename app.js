'use strict';
class CQr {
    constructor() {
        this.question = '?';
        this.bonneReponse = 0;

    }
    GetRandomInt(min, max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    NouvelleQuestion() {

        var nombreDecimal = Math.floor(Math.random() * 256);
        var nombreBinaire = nombreDecimal.toString(2).padStart(8, '0');
        this.question = nombreBinaire;
        this.bonneReponse = nombreDecimal; 


        aWss.broadcast(this.question);

        
    }
    TraiterReponse(wsClient, message, req) {
        console.log('Connection WebSocket %s sur le port %s', req.connection.remoteAddress,
            req.connection.remotePort);

  

        if (message == this.bonneReponse) {
            this.NouvelleQuestion();
        }
        else {
            wsClient.send('Mauvaise reponse.');
            setTimeout(() => {

                this.NouvelleQuestion();

            }, 3000);

        }

    }
} 

const portServ = 80;

var jeuxQr = new CQr;

var express = require('express');

var exp = express(); 

exp.use(express.static(__dirname + '/www'));

exp.get('/', function (req, res) {
    console.log('Reponse a un client'); 
    res.sendFile(__dirname + '/www/textchat.html');
}); 

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Erreur serveur express');
}); 



/*  *************** serveur WebSocket express *********************   */
// 
var expressWs = require('express-ws')(exp);

// Connexion des clients à la WebSocket /echo et evenements associés 
exp.ws('/echo', function (ws, req) {

    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);

    ws.on('message', function (message) {
        message = ws._socket._peername.address + ws._socket._peername.port + ' : ' + message; 
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        aWss.broadcast(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });

});

exp.listen(portServ, function () {
    console.log('Serveur 2 en ecoute');
});

/*  ****************** Broadcast clients WebSocket  **************   */
var aWss = expressWs.getWss('/echo');
var WebSocket = require('ws');
aWss.broadcast = function broadcast(data) {
    console.log("Broadcast aux clients navigateur : %s", data);
    aWss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log("    -  %s-%s", client._socket.remoteAddress,
                    client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast : %s', error.toString());
                }
            });
        }
    });
}; 


console.log('TP CIEL');






/*  *************** serveur WebSocket express /qr *********************   */
// 
exp.ws('/qr', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s', req.connection.remoteAddress,
        req.connection.remotePort);
    jeuxQr.NouvelleQuestion();

    ws.on('message', TMessage);
    function TMessage(message) {
        jeuxQr.TraiterReponse(ws, message, req);
    }

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });
    

}); 