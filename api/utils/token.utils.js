const jwt = require('jsonwebtoken');

var createToken = (auth) => {
    return jwt.sign({
            id: auth.id
        }, 'my-secret',
        {
            expiresIn: 60 * 120
        });
};

module.exports = {
  generateToken: (req, res, next) => {
      req.token = createToken(req.auth);
      return next();
  },
  sendToken: (req, res) => {
      res.setHeader('x-auth-token', req.token);
      return res.status(200).send(JSON.stringify(req.user));
  },
  verifyToken: (req, res, next) => {
      const tokens = req.headers.authorization.split(', ');
      const bearerTokenHeader = tokens.find(token => token.toLowerCase().startsWith('bearer'));
      const bearerToken = bearerTokenHeader.substr(7);
      jwt.verify(bearerToken, 'my-secret', (err, decoded) => {
          if (err) {
              // failed to get validation response
              return res.status(500).send();
          }
          if (decoded) {
              req.user = decoded.id;
              return next();
          }
          return res.status(401).send();
      });
  }
};
