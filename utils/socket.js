module.exports = function (server) {

    var socket = require('socket.io');
    var io = socket(server);
    var Room = require('./room');
    
    var User = require('../models/user');

    var people = {};
    var rooms = {};
    var sockets = [];
    var chatHistory = {};

    // function purge(s, action) {
    //
    //     if (people[s.id].inroom) { //user is in a room
    //
    //         var userInRoom = people[s.id].inroom;
    //         var room = rooms[userInRoom];
    //
    //         if (s.id === room.owner){ // user in room and a POS (owner of the room)
    //
    //             if (action === 'disconnect'){ // owner disconnected
    //
    //                 // send a message to users in the room
    //                 io.sockets.in(s.room).emit("update", "The owner ( " + people[s.id].name + " ) " +
    //                     "has left the server. The room is removed and you have been disconnected from it as well.");
    //
    //
    //                 // remove people from room and disconnect sockets
    //                 remove(room);
    //
    //                 // return a copy of the people array with just the owner
    //                 room.people = _.without(room.people, s.id);
    //
    //                 // delete the room
    //                 delete rooms[people[s.id].owns];
    //
    //                 // delete the owner from the people collection
    //                 delete people[s.id];
    //
    //                 // delete the history
    //                 delete chatHistory[room.name];
    //
    //                 // emit people list and room list
    //                 io.sockets.emit("update-people", { people: people, count: _.size(people)});
    //                 io.sockets.emit("roomList", {rooms: rooms, count: _.size(rooms)});
    //
    //             } else if ( action === 'removeRoom'){ // owner removes the room
    //
    //                 io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") " +
    //                     "has removed the room. The room is removed and you have been disconnected from it as well.");
    //
    //                 // remove people from room and disconnect sockets
    //                 remove(room);
    //
    //                 // return a copy of the people array with just the owner
    //                 room.people = _.without(room.people, s.id);
    //
    //                 // delete room
    //                 delete rooms[room.people[s.id].owns];
    //
    //                 // set the room set to the owner to null
    //                 people[s.id].owns = null;
    //
    //                 //delete the chat history
    //                 delete chatHistory[room.name];
    //
    //
    //                 // send the updated room list
    //                 io.sockets.emit("roomList", {rooms: rooms, count: _.size(rooms)});
    //
    //             } else if (action === "leaveRoom") { // owner leaves room
    //
    //                 // send a message to users in the room
    //                 io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") " +
    //                     "has left the room. The room is removed and you have been disconnected from it as well.");
    //
    //                 // remove people from room and disconnect sockets
    //                 remove(room);
    //
    //                 // delete room
    //                 delete rooms[people[s.id].owns];
    //
    //                 // set the room set to the owner to null
    //                 people[s.id].owns = null;
    //
    //                 // return a copy of the people array with just the owner
    //                 room.people = _.without(room.people, s.id);
    //
    //
    //                 // delete chat history
    //                 delete chatHistory[room.name];
    //
    //                 // update the room list
    //                 io.sockets.emit("roomList", {rooms: rooms, count: _.size(rooms)});
    //
    //             } else { // user in room but doesn't own the room
    //                 if (action === 'disconnect') {
    //
    //                     // send a message to users in the room
    //                     io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
    //
    //                     if (_.contains((room.people)), s.id){
    //                         var index = room.people.indexOf(s.id);
    //                         room.people.splice(index, 1);
    //                         s.leave(room.name);
    //                     }
    //
    //                     // delete user from people
    //                     delete people[s.id];
    //
    //                     // send people updated list
    //                     io.sockets.emit("update-people", {people: people, count: _.size(people)});
    //
    //                     // find in sockets where s.id == socket id
    //                     var o = _.findWhere(sockets, { 'id': s.id });
    //
    //                     // return a copy of socket with just the the user
    //                     sockets = _.without(sockets, o);
    //
    //                 } else if (action === "removeRoom") {
    //
    //                     // send a message saying only POS can remove a room.
    //                     s.emit("update", "Only the owner can remove a room.");
    //
    //                 } else if (action === "leaveRoom") {
    //
    //                     //
    //                     if (_.contains((room.people)), s.id){
    //                         var index = room.people.indexOf(s.id);
    //                         people[s.id].inroom = null;
    //                         io.sockets.emit("update", people[s.id].name + " has left the room.");
    //                         s.leave(room.name);
    //                     }
    //                 }
    //
    //             }
    //         } else {
    //             // The user isn't in a room, but maybe he just disconnected.
    //             if (action === "disconnect") {
    //                 io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
    //                 delete people[s.id];
    //                 io.sockets.emit("update-people", {people: people, count: _.size(people)});
    //                 var o = _.findWhere(sockets, {'id': s.id});
    //                 sockets = _.without(sockets, o);
    //             }
    //         }
    //
    //     }
    // };
    //
    // /*
    //  * It removes people form room and set sockets of those users to leave
    //  */
    // function remove(room) {
    //     // make a socket leave the room.
    //     for (var i = 0; i < sockets.length; i++)
    //         if (_.contains((sockets[i].id)), room.people)
    //             sockets[i].leave(room.name);
    //
    //
    //     // make people in room null
    //     if(_.contains((room.people)), s.id)
    //         for (var i = 0; i < room.people.length; i++)
    //             people[room.people[i]].inroom = null;
    // }



    // it contains connected and valid users
    var users = {};

    // adds user
    function addUser(socket, user) {
        // clean up user function
        users[socket.id] = cleanUser(socket.id, user);
        socket.emit('update','You have connected to the server.')
    }

    function removeUser(socket) {

        // remove user ...
        // var user = users[socket.id];
        // if(user.inRoom){
        //     if (user.owns)
        // }
    }

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


    // socket IO
    io.on('connection', function (client) {

        console.log("user has been connected");
        // check the user in database
        client.on('check user', function (id) {

            // look for user in db
            User.findOne({ _id: id}).exec(function (err, user) {

                // Send an error message if error
                if (err)
                    return socket.emit('error', 'Error status 500, Internal server error');

                // send a message to client then close connection
                if (!user){
                    socket.emit('error', 'You are not a user.');
                    return client.disconnect();
                }

                // if user, call addUser function
                if (user)
                    addUser(client, user);

            }); // END QUERY
        });

        client.on('Leave', function (id) {
            // if vendor
                // Do stuff
            // if customer
                // Do other stuff
        });

        client.on('Payment', function (id) {
            // deduct amount from customer and add it to vendor
                // IF success
                    // clear order
                    // remove customer from room
                    // send a message of success to both.
                // Else
                    // send a message of failure to both
        });

        client.onack("disconnect", function () {
            // IF vendor
            //     remove customers from room, clear order, and remove room and remove vendor from list.

            // IF customer
            //     remove customer from room, and remove customer from list.

            console.log("user has been disconnected");

        })

    });



};