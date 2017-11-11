/**
 * Created by tawashy on 10/28/17.
 */

const _ = require('underscore');

var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};

module.exports = function purge(s, action) {

    if (people[s.id].inroom) { //user is in a room

        var userInRoom = people[s.id].inroom;
        var room = rooms[userInRoom];

        if (s.id === room.owner){ // user in room and a POS (owner of the room)

            if (action === 'disconnect'){ // owner disconnected

                // send a message to users in the room
                io.sockets.in(s.room).emit("update", "The owner ( " + people[s.id].name + " ) " +
                    "has left the server. The room is removed and you have been disconnected from it as well.");


                // remove people from room and disconnect sockets
                remove(room);

                // return a copy of the people array with just the owner
                room.people = _.without(room.people, s.id);

                // delete the room
                delete rooms[people[s.id].owns];

                // delete the owner from the people collection
                delete people[s.id];

                // delete the history
                delete chatHistory[room.name];

                // emit people list and room list
                io.sockets.emit("update-people", { people: people, count: _.size(people)});
                io.sockets.emit("roomList", {rooms: rooms, count: _.size(rooms)});

            } else if ( action === 'removeRoom'){ // owner removes the room

                io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") " +
                    "has removed the room. The room is removed and you have been disconnected from it as well.");

                // remove people from room and disconnect sockets
                remove(room);

                // return a copy of the people array with just the owner
                room.people = _.without(room.people, s.id);

                // delete room
                delete rooms[room.people[s.id].owns];

                // set the room set to the owner to null
                people[s.id].owns = null;

                //delete the chat history
                delete chatHistory[room.name];


                // send the updated room list
                io.sockets.emit("roomList", {rooms: rooms, count: _.size(rooms)});

            } else if (action === "leaveRoom") { // owner leaves room

                // send a message to users in the room
                io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") " +
                    "has left the room. The room is removed and you have been disconnected from it as well.");

                // remove people from room and disconnect sockets
                remove(room);

                // delete room
                delete rooms[people[s.id].owns];

                // set the room set to the owner to null
                people[s.id].owns = null;

                // return a copy of the people array with just the owner
                room.people = _.without(room.people, s.id);


                // delete chat history
                delete chatHistory[room.name];

                // update the room list
                io.sockets.emit("roomList", {rooms: rooms, count: _.size(rooms)});

            } else { // user in room but doesn't own the room
                if (action === 'disconnect') {

                    // send a message to users in the room
                    io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");

                    if (_.contains((room.people)), s.id){
                        var index = room.people.indexOf(s.id);
                        room.people.splice(index, 1);
                        s.leave(room.name);
                    }

                    // delete user from people
                    delete people[s.id];

                    // send people updated list
                    io.sockets.emit("update-people", {people: people, count: _.size(people)});

                    // find in sockets where s.id == socket id
                    var o = _.findWhere(sockets, { 'id': s.id });

                    // return a copy of socket with just the the user
                    sockets = _.without(sockets, o);

                } else if (action === "removeRoom") {

                    // send a message saying only POS can remove a room.
                    s.emit("update", "Only the owner can remove a room.");

                } else if (action === "leaveRoom") {

                    //
                    if (_.contains((room.people)), s.id){
                        var index = room.people.indexOf(s.id);
                        people[s.id].inroom = null;
                        io.sockets.emit("update", people[s.id].name + " has left the room.");
                        s.leave(room.name);
                    }
                }

            }
        } else {
            // The user isn't in a room, but maybe he just disconnected.
            if (action === "disconnect") {
                io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
                delete people[s.id];
                io.sockets.emit("update-people", {people: people, count: _.size(people)});
                var o = _.findWhere(sockets, {'id': s.id});
                sockets = _.without(sockets, o);
            }
        }

    }
};

/*
 * It removes people form room and set sockets of those users to leave
 */
function remove(room) {
    // make a socket leave the room.
    for (var i = 0; i < sockets.length; i++)
        if (_.contains((sockets[i].id)), room.people)
            sockets[i].leave(room.name);


    // make people in room null
    if(_.contains((room.people)), s.id)
        for (var i = 0; i < room.people.length; i++)
            people[room.people[i]].inroom = null;
}
