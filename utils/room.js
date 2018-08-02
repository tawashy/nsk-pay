function Room(id, owner) {
    this.id = id;
    this.POS = owner;
    this.customer = null;
    this.order = 0.00;
    this.locked = true;
}

/*
 * Checks if room is not locked  and customer is empty
 * and adds customer to the room
 */
Room.prototype.joinRoom = function (customerId) {
    if (!this.locked && !this.customer) {
        console.log('customer has joined the room');
        this.customer = customerId;
        this.locked = true
    } else {
        console.log("room is private....")
    }
};

/*
 * Checks if customerId is the same as the one in the room
 * and remove the customer.
 *
 * checks if POS id is the same as id and then re sets the room
 */
Room.prototype.leaveRoom = function (id) {
    if (this.customer === id) {
        this.customer = null;
        this.locked = false;
    }

    if (this.POS === id){
        this.locked = true;
        this.customer = null;
        this.order = 0.00;
        this.POS = null;

    }
};

/*
 * Check if customer is not empty and returns it id
 */
Room.prototype.getCustomerId = function () {
    if (this.customer && !this.locked)
        return this.customer
};

/*
 * Check if the id is the same as the POS
 * it locks the room
 */
Room.prototype.lockRoom = function (id) {
    if (this.POS === id)
        this.locked = true
};

/*
 * Check if the id is the same as the POS
 * it unlocks the room
 */
Room.prototype.unlockRoom = function (id) {
    if (this.POS === id)
        this.locked = false
};

/*
 * it checks if the customer id the same as id
 * it return the order
 */
Room.prototype.getOrder = function (id) {
    console.log("User ID Requesting: ", id);
    console.log("User ID in Room: ", this.customer);
    if (this.customer === id)
        return this.order
};

Room.prototype.updateOrder = function (id, amount) {
    if (this.POS === id){
        this.order = amount;
    }
};


module.exports = Room;