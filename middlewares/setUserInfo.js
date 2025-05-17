const jwt = require('jsonwebtoken');

const setUserInfo = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, 'pninfosyshdgghsgey26hgdsb');
      req.user = decoded;  // so you can still use req.user
      res.locals.name = decoded.name;
      res.locals.role = decoded.role;
    } catch (err) {
      res.locals.name = null;your_jwt_secret_key
      res.locals.role = null;
    }
  } else {
    res.locals.name = null;
    res.locals.role = null;
  }
  next();
};

module.exports = setUserInfo;
