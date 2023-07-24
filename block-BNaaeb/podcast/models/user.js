var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /@/,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    membership: {
      type: String,
      default: "free",
      enum: ["free", "vip", "premium"],
    },
    hostedPodcasts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Podcast",
      },
    ],
    subscribedPodcasts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Podcast",
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
      required: true
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function(next) {
    if(this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 9, (err, hashed) => {
            if(err) return next(err);
            this.password = hashed;
            return next();
        });
    } else {
       return next();
    }
});

userSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    });
}

module.exports = mongoose.model("User", userSchema);
