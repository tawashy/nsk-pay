module.exports = function (server) {

    var socket = require('socket.io');
    var io = socket(server);
    var _ = require('underscore');

    var User = require('../models/users');
    var Room = require('./room');

    // it contains connected and valid users
    var users = {};
    var POS = {};

    var rooms = {};

    // cleans up the user information and returns it.
    function cleanUser(socketID, user) {
        var ownerRoomID = null,
            inRoomID    = null;

        return {
            "id"    : user._id,
            "name"  : user.name,
            "role"  : user.ACL,
            "owns"  : ownerRoomID,
            "inRoom": inRoomID,
            "socket": socketID
        };

    }

    function checkUser(socketId) {

        console.log(_.contains(users, socketId, 0));
        // if (_.contains((socketId)), users) {
        //
        // };
        users.push({user: null, socket: socketId})
    }

    // socket IO
    io.on('connection', function (client) {

        console.log("user has been CONNECTED");
        // check the user in database

        client.on('joinRoom', function (data) {

            if (!_.contains(users, users[client.id])){
                users[client.id] = data[0];
            }

            var user = null;

            _.map(rooms, function (room) {
                console.log("Room: ", room);
                if (room.customer === data[0]){

                    console.log('customer is in a room');
                    user = room.customer
                }
            });


            if (!user){
                console.log('customer is not in a room');

                User.findOne({major: data[1], minor: data[2]}).exec(function (err, user) {
                    if (err) return console.log("ERROR:", err);
                    if (!user) return console.log("No store found.");

                    console.log("POS found.");
                    console.log();
                    if (_.contains(rooms, rooms[user._id])){
                        console.log('POS has a room');
                        rooms[user._id].joinRoom(data[0]);
                        if (rooms[user._id].customer === data[0]){
                            client.emit('getTotal', rooms[user._id].getOrder(data[0]));
                        }

                    }

                });

            }
        });


        // create Room
        // i check the socket if its a POS then create a room and add it to the user
        client.on('createRoom', function (id) {
            console.log("User Id: ", id);
            if (_.contains(rooms, rooms[id])){
                rooms[id].id = client.id;
                client.emit("roomCreated", "using your old room");
            } else {
                var room = new Room(client.id, id);
                rooms[id] = room;

                console.log("Rooms: ", rooms);
                console.log("Room: ", rooms[id]);

                client.emit("roomCreated", "Room has been created");
            }
        });

        client.on('unlockRoom', function (id) {
            console.log('unlocking a room');

            if (_.contains(rooms, rooms[id])){
                rooms[id].unlockRoom(id);
                console.log('room unlocked')
            }

        });

        client.on('lockRoom', function (id) {
            console.log('locking a room');
            if (_.contains(rooms, rooms[id])){
                rooms[id].lockRoom(id);
                console.log('room locked')
            }
        });


        //update total amount
        client.on('updateTotal', function (id, amount) {
            console.log("Update total", amount);
            if (_.contains(rooms, rooms[id])){
                if (rooms[id].POS === id){
                    rooms[id].updateOrder(id, amount);
                }
            }
        });

        client.on('unlockRoom', function (id) {
            if (_.contains(rooms, rooms[id])){
                if (rooms[id].POS === id){
                    rooms[id].unlockRoom(id);
                }
            }
        });



        // on payment
        // i process the payment then send the status of the process back to both POS and customer.




        // remove Room
        //

        client.on("disconnect", function () {

            console.log(users[client.id]);
            if (_.contains(users, users[client.id])){
                _.map(rooms, function (room) {
                    console.log("Room: ", room);
                    if (room.customer === users[client.id]){
                        room.leaveRoom(users[client.id]);
                    }

                });
                console.log(rooms)
            }

        });

    });
};