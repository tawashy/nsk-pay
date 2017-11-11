/**
 * Created by tawashy on 9/23/17.
 */
/* Transaction Model */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    sender:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount:     { type: Number, required: true },
    createdAt:  { type: Date, default: Date.now() }
});


// calling the User Model
var User = mongoose.model('User');

//  create a sender and a receiver variables
// to save users objects.
var sender      = null;
var receiver    = null;


// this function will retrieve users' information and check the sender's balance
// before saving the transaction data into the database.
schema.pre('save', function (done) {
    var transaction = this;

    // find sender by id
    User.findById(transaction.sender, function (err, data) {
        if (err){ done(err) }

        // check if the user's balance is equal to the transaction amount.
        // if it is, process the payment, if not, throw an error.
        if (data.balance >= transaction.amount){

            // assign data retrieved to sender
            sender = data;

            // find receiver by id
            User.findById(transaction.receiver, function (err, data) {
                if (err){ done(err) }

                // assign data retrieved to receiver
                receiver = data;
            });
        } else {

            // send an error massage - the amount is less than the required to process the payment.
            done(err);
        }
    });
});


// this function will be triggered after the transaction record have been added to the server.
// And it will make sure that the actual amount have been moved to the receiver balance
schema.post('save', function (done) {

    // saving the transaction amount locally
    var transaction_amount = this.amount;

    // setting the
    var condition   = { user: sender, balance: sender.balance >= transaction_amount };
    var options     = { $set: { balance: sender.balance - transaction_amount }}
    User.update(condition, options, function (err, cb) {
        if (err){
            done(err)
        } else {
            done;
        }
    });

});


module.exports = Transaction = mongoose.model('Transaction', schema);