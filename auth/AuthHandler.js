require('dotenv').config({ path: '../variables.env' });
const connectToDatabase = require('../db');
const User = require('../user/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs-then');

/* 
 * Functions
 */

module.exports.login = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => {

      login(JSON.parse(event.body))
        .then(session => callback(null, {
          statusCode: 200,
          body: JSON.stringify(session)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: { stack: err.stack, message: err.message }
        }));

    });
};

module.exports.register = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => {

      register(JSON.parse(event.body))
        .then(session => callback(null, {
          statusCode: 200,
          body: JSON.stringify(session)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: { stack: err.stack, message: err.message }
        }));

    });
};

module.exports.me = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => {

      const userId = JSON.parse(event.requestContext.authorizer.id);
      me(userId)
        .then(session => callback(null, {
          statusCode: 200,
          body: JSON.stringify(session)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: { stack: err.stack, message: err.message }
        }));

    });
};

/* 
 * Helpers
 */

function signToken(id) {
  return jwt.sign({ id: id }, app.config.secret, {
    expiresIn: 86400 // expires in 24 hours
  });
}

function login(eventBody) {

  const _user = {};
  return User.findOne({ email: eventBody.email })
    .then(user => {
      if (!user) return Promise.reject(new Error('User with that email does not exits.'));
      _user._id = user._id;
      return user.password;
    })
    .then(userPassword => bcrypt.compare(eventBody.password, userPassword))
    .then(passwordIsValid => passwordIsValid
      ? signToken(_user._id)
      : Promise.reject(new Error('The credentials do not match.')))
    .then(token => ({ auth: true, token: token }));

}

function register(eventBody) {

  if (
    !(eventBody.password &&
      eventBody.password.length >= 7)
  ) { 
    return Promise.reject(new Error('Password error. Password needs to be longer than 8 characters.'));
  }

  if (
    !(eventBody.name &&
      eventBody.name.length > 5 &&
      typeof eventBody.name === 'string')
  ) return Promise.reject(new Error('Username error. Username needs to longer than 5 characters'));

  if (
    !(eventBody.email &&
      typeof eventBody.name === 'string')
  ) return Promise.reject(new Error('Email error. Email must have valid characters.'));

  return User.findOne({ email: eventBody.email })
    .then(user => user ?
      Promise.reject(new Error('User with that email exists.')) :
      Promise.resolve())
    .then(bcrypt.hash.bind(this, eventBody.password, 8))
    .then(hash => User.create({ name: eventBody.name, email: eventBody.email, password: hash }))
    .then(user => ({ auth: true, token: signToken(user._id) }));
}

function me(userId) {
  return User.findById(userId, { password: 0 })
    .then(user => !user ?
      Promise.reject('No user found.') :
      user
    )
    .catch(err => Promise.reject(new Error(err)));
}

