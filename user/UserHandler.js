const connectToDatabase = require('../db');
const User = require('./User');

function getUsers() {
  return User.find({})
    .then(users => users)
    .catch(err => Promise.reject(new Error(err)));
}

module.exports.getUsers = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => {

      getUsers()
        .then(users => callback(null, {
          statusCode: 200,
          body: JSON.stringify(users)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: { stack: err.stack, message: err.message }
        }));

    });
};