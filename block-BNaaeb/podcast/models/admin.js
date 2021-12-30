var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var adminSchema = new Schema ({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true}
}, { timestamps: true })

adminSchema.pre('save', function(next) {
    if(this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if(err) return next(err);
            this.password = hashed;
            return next();
        })
    } else {
        next();
    }
})

adminSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    })
}

module.exports = mongoose.model('Admin', adminSchema);