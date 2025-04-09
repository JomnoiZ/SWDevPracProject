const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    // TODO: reservation schema
});

module.exports = mongoose.model('Reservation', ReservationSchema);