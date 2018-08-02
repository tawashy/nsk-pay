var Item = require('./item')

function Order(id, POS, date) {
    this.id = id;
    this.POS = POS;
    this.items = [];
    this.status = 'available';
    this.createdAt = data;
}

Order.prototype.addItem = function (id, name, price, qty) {
    if (this.status === 'available')
        this.items.push(id,name,price,qty);
};

Order.prototype.removeItem = function (id) {
    
}