/*
* @Author: Joesonw
* @Date:   2016-08-09 17:05:11
* @Last Modified by:   Qiaosen Huang
* @Last Modified time: 2016-08-09 17:47:58
*/

'use strict';
const net = require('net');
const winston = require('winston');
const Server = require('socket.io');

module.exports = function(options) {
    if (!options.listen) {
        console.error('Please specify listen port');
        process.exit(1);
    }
    if (!options.host) {
        console.error('Please specify host port');
        process.exit(1);
    }

    const io = Server();
    let client = null;

    io.on('connection', conn => {
        console.log('client connected')
        client = conn;
    });

    const tcp = net.createServer(socket => {
        winston.log(`${socket.remoteAddress} requested`);
        const id = Date.now();
        if (client) {
            client.emit('request', id);
            client.once(`close-${id}`, () => {
                socket.end();
            });
        }
        socket.on('data', data => {
            if (client) {
                client.emit(`data-${id}`, data);
                client.on(`response-${id}`, data => {
                    socket.write(data)
                });
            }
        });
        socket.on('close', () => {
            client.emit(`close-${id}`);
            winston.log(`${socket.remoteAddress} closed`);
        });
    })

    tcp.listen(options.listen, '127.0.0.1');
    io.listen(options.host);

    winston.log('server started');


    /*

    net.createServer(clientSocket => {

    }).listen(options.host, '127.0.0.1');
    */
}