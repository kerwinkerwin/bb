var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BarberSchema = new Schema({
  name:{type:String, required: true},
  address: {type:String},
  city: {type:String},
  phone: {type:Number}
});

BarberSchema.add({password:String,admin: Boolean})

module.exports = mongoose.model('Barber', BarberSchema);
