const jwt = require("jsonwebtoken");
const auth = require("../services/auth");
require("dotenv").config();

module.exports = {
  checkAuth: async (req, res, next) => {
    const token = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];

    if (!token && !refreshToken) {
      return res.status(401).send("Access denied. No token provided");
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("decoded", decoded);
      next();
    } catch (error) {
      if (!refreshToken) {
        return res.status(401).send("Access denied. Access token expired");
      }
      try {
        console.log("refreshing token");
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const userJWT = decoded.userJWT;
        const accessToken = jwt.sign({ userJWT }, process.env.JWT_SECRET, {
          expiresIn: "60s",
          notBefore: '0',
          audience: process.env.JWT_AUDIENCE,
          issuer: process.env.JWT_ISSUER
        });

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 360000,
        });
        //res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' }).header('Authorization', accessToken).send(decoded)
        next();
      } catch (error) {
        return res.status(400).send("Invalid token");
      }
    }
  },
  checkAuthReal: async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized")
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Unauthorized");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send("Forbidden");
      }
      req.user = decoded;
      console.log("decoded", decoded);
      next();
    });
  },
  verifyRoles: (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user.role) {
        return res.status(401).send("Unauthorized");
      }

      const rolesArray = [...allowedRoles];
      console.log(rolesArray);
      console.log(req.user.role);

      const result = rolesArray.some((role) =>
        req.user.role.includes(role)
      );

      if (!result) {
        return res.status(403).send("Forbidden");
      }

      next();
    };
  },
  reqUser: async (req, res, next) => {
    const token = req.cookies["accessToken"];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userJWT.role == "user" || decoded.userJWT.role == "admin") {
        next();
      } else {
        return res.status(401).send("Unauthorized access");
      }
    } catch (error) {
      console.log(error);
    }
  },
  reqAdmin: async (req, res, next) => {
    const token = req.cookies["accessToken"];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userJWT.role == "admin") {
        next();
      } else {
        return res.status(401).send("Unauthorized access");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
