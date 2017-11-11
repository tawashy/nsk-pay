/**
 * Created by tawashy on 9/23/17.
 */
/* inStore Model */

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var schema = new Schema({
    retail_store:   { type: Schema.Types.ObjectId, ref:'User', required: true },
    customer:       { type: Schema.Types.ObjectId, ref:'User', required: true },
    checkIn:        { type: Date, default: Date.now(), required: true },
    checkOut:       { type: Date }
});


// calling User Model
var User = mongoose.model('User')

// checks the validity of the users before
// inserting the document to the database
schema.pre('save', function (done) {
    var in_store = this;

    // looks for a retail_store in the database with objectId.
    // if valid, it will move to the next process, finding the customer.
    // otherwise, it will return an error message - Retail_store id is not valid.
    User.findById(in_store.retail_store, function (err, retail) {
        if (err){ done(err) }
        if (retail){

            // looks for a customer in the database with objectId.
            // if valid, it will complete the process and save the document
            // otherwise, it will return an error message - Customer id is not valid
            User.findById(in_store.customer, function (err, customer) {
                if (err){ done(err) }
                if (customer){
                    done;
                } else {
                    var error = new Error('Customer id is not valid');
                    done(error);
                }
            })
        } else {
            var error = new Error('Retail_store id is not valid.');
            done(error);
        }
    })


});

// makes sure that the date have not been set.
// if true, it will set the check-out date to now().
// otherwise, it returns an error message - user have already been checked-out.
schema.pre('update', function (done) {
    var in_store = this;

    // checks if the checkOut field is empty or have not been assigned
    // if true it will assign now() function as a value.
    // otherwise, the function will throw an error.
    if(in_store.checkOut.isEmpty() || !in_store.checkOut.isAssign){
        in_store = Date.now();
        done;
    } else {
        var err = new Error('user have already been checked-out.');
        done(err);
    }
});

// creating and exporting the model
module.exports = inStore = mongoose.model('inStore', schema);