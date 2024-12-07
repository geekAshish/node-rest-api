const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const {validationResult} = require('express-validator/check');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = error.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12) // hashing password with salt 12
    .then((hashPassword) => {
      const user = new User({
        name,
        email,
        password: hashPassword,
      })
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'User Created successfully!', userId: result._id });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
          const error = new Error('A user with this email could not be found');
          error.statusCode = 500;
          throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password) // comparing if user entered password and stored password
    })
    .then((isEqual) => { // returned value from bcrypt
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 500;
        throw error;
      }
      const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      }, 'someSuperSecretSecreteKey', {expiresIn: '1h'});

      res.status(200).json({ token });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    })
}