const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
}

module.exports.auth = (event, context, callback) => {

  // check header or url parameters or post parameters for token
  const token = event.authorizationToken;

  if(event.authorizationToken.split(' ')[0] == 'bearer')
    const token = event.authorizationToken.split(' ')[1] // for bearer token 
  else
    const token = event.authorizationToken

  // verifies secret and checks exp
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return callback(null, 'Unauthorized');

    // if everything is good, save to request for use in other routes
    return callback(null, generatePolicy(decoded.id, 'Allow', event.methodArn))
  });

};