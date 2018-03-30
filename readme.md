# A crash course on Serverless Authentication/Authorization
A short and easy boilerplate showcasing JWT auth with Nodejs, the Serverless framework, MongoDB and AWS Lambda.

- The `auth` folder has a `VerifyToken.js` file which is the base of the **authorizer** function.
- The `VerifyToken.auth` method is added to the **authorizer** field in the `serverless.yml` for API Gateway routes you wish to keep private. See the `me` function. `AuthHandler.me` uses `event.requestContext.authorizer.principalId` to access the `userId` of the user accessing the resource if the JWT is valid. Otherwise returns `'Unauthorized'`.

*Note: The concept of middlewares can be applied to this for understanding it easily.*