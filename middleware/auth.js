const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  //Get token from header
  const token = req.header('x-auth-token');
  
  //Check if not token
  if(!token) {
    return res.status(401).json({msg: 'No token, authorization denied'});
  }

  //Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    //Assign the decoded user to the request user to get more user details in the future
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({msg: 'Token is not valid'});
  }
}