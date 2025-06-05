// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const checkAuth = (req, res,next) => {
  const token = req.cookies.token;
  // console.log(token)
  if (!token) {
    req.flash("error", "token is not match");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, "pninfosyshdgghsgey26hgdsb");
    //console.log(decoded)
    req.user = decoded; // { id, name, role }
    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

module.exports = checkAuth;
