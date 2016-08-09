/*
* @Author: Qiaosen Huang
* @Date:   2016-08-09 17:26:39
* @Last Modified by:   Qiaosen Huang
* @Last Modified time: 2016-08-09 17:48:25
*/

'use strict';
const net = require('net');
const SocketIO = require('socket.io-client');

module.exports = function(options) {
     if (!options.port) {
        console.error('Please specify forward port');
        process.exit(1);
    }
    if (!options.host) {
        console.error('Please specify host ip');
        process.exit(1);
    }

    const client = SocketIO(`ws://${options.host}`);

    client.on('connect', () => {
        console.log('connected');
    });
    client.on('request', id => {
        console.log(`request ${id}`);
        const tcp = net.createConnection({
            port: options.port,
        }, () => {
            console.log(`conencted to server`);
            client.on(`data-${id}`, data => {
                tcp.write(data);
            });
            client.once(`close-${id}`, () => {
                tcp.end();
            }); 
        })       
        tcp.on('close', () => {
            client.emit(`close-${id}`);
        });
        tcp.on('data', data => {
            client.emit(`response-${id}`, data) ;
        });
    });

}