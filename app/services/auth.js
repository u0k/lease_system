const { getDB } = require("../utils/db_connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  registerUser: async (userData) => {
    try {
      const db = getDB();

      console.log("userdata,", userData);
      const users = db.collection("user");
      const [username, password] = userData;
      const userExists = await users.findOne({ username });

      if (userExists) {
        return { code: 409, success: false, message: "User already exists" };
      }

      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.SALT_ROUNDS)
      );
      const role = "user";
      const refreshToken = [];
      const newUser = { username, hashedPassword, role, refreshToken };

      await users.insertOne(newUser);

      return {
        code: 200,
        success: true,
        message: "User registered successfully",
      };
    } catch (error) {
      console.error(error);
    }
  },
  loginUser: async (userData, cookies) => {
    try {
      const db = getDB();

      const users = db.collection("user");
      const [username, password] = userData;
      const userExists = await users.findOne({ username });

      const passwordCorrect =
        userExists === null
          ? false
          : await bcrypt.compare(password, userExists.hashedPassword);

      if (!(userExists && passwordCorrect)) {
        return {
          code: 401,
          success: false,
          message: "Invalid username or password",
        };
      }
      const userJWT = {
        username: userExists.username,
        sub: userExists._id,
        role: userExists.role,
      };
      const accessToken = jwt.sign(
        {
          sub: userExists._id,
          username: userExists.username,
          role: userExists.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "60s",
          notBefore: "0",
          audience: process.env.JWT_AUDIENCE,
          issuer: process.env.JWT_ISSUER,
        }
      );
      const newRefreshToken = jwt.sign(
        {
          sub: userExists._id,
          username: userExists.username,
          role: userExists.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "12h",
          notBefore: "0",
          audience: process.env.JWT_AUDIENCE,
          issuer: process.env.JWT_ISSUER,
        }
      );

      console.log("usr exists", userExists);
      let newRefreshTokenArray = !cookies.refreshToken
        ? userExists.refreshToken
        : userExists.refreshToken.filter((rt) => rt !== cookies.refreshToken);

      if (cookies.refreshToken) {
        const refreshToken = cookies.refreshToken;
        const foundToken = await users.findOne({ refreshToken });
        if (!foundToken) {
          console.log("attempted refresh token reuse at login");
          newRefreshTokenArray = [];
        }
      }

      const updatedRefreshTokenArray = [
        ...newRefreshTokenArray,
        newRefreshToken,
      ];
      const result = await users.updateOne(
        { _id: new ObjectId(userExists._id) },
        { $set: { refreshToken: updatedRefreshTokenArray } }
      );

      return {
        code: 200,
        accessToken: accessToken,
        refreshToken: newRefreshToken,
        success: true,
        message: "User logged in successfully",
      };
    } catch (error) {
      console.error(error);
    }
  },
  logoutUser: async (refreshToken) => {
    try {
      const db = getDB();

      const users = db.collection("user");
      const foundUser = await users.findOne({ refreshToken });
      if (!foundUser) {
        return { code: 204, success: false };
      }
      console.log("all otkens", foundUser.refreshToken);
      console.log(foundUser.refreshToken[0] == refreshToken);
      refreshTokensToDelete = foundUser.refreshToken.filter(
        (rt) => rt !== refreshToken
      );
      console.log("tokens to delete", refreshTokensToDelete);
      const result = await users.updateOne(
        { _id: new ObjectId(foundUser._id) },
        { $set: { refreshToken: refreshTokensToDelete } }
      );
      console.log(result);

      return { code: 204, success: true };
    } catch (error) {
      console.error(error);
    }
  },
  refreshToken: async (refreshToken) => {
    try {
      const db = getDB();

      const users = db.collection("user");
      console.log("rftok", refreshToken);
      const foundUser = await users.findOne({ refreshToken });
      console.log("founduser", foundUser);

      if (!foundUser) {
        jwt.verify(
          refreshToken,
          process.env.JWT_SECRET,
          async (err, decoded) => {
            if (err) {
              return { code: 403, success: false };
            }
            //detected refresh token reuse
            const reusedTokenUser = await users.findOne({
              username: decoded.username,
            });
            console.log("reused", reusedTokenUser);
            refreshTokens = [];
            console.log("here deleting");
            const result = await users.updateOne(
              { _id: new ObjectId(reusedTokenUser._id) },
              { $set: { refreshToken: [] } }
            );
            console.log(result);
          }
        );
        return {
          code: 403,
          success: false,
          message: "Refresh token reuse detected",
        };
      }

      const newRefreshTokenArray = foundUser.refreshToken.filter(
        (rt) => rt !== refreshToken
      );
      const decoded = await new Promise(async (resolve) => {
        jwt.verify(
          refreshToken,
          process.env.JWT_SECRET,
          async (error, decoded) => {
            if (error) {
              console.log("expired refresh token:");
              const result = await users.updateOne(
                { _id: new ObjectId(foundUser._id) },
                { $set: { refreshToken: newRefreshTokenArray } }
              );
              console.log(result);
              resolve({
                code: 403,
                success: false,
                message: "Refresh token expired. Log in again.",
              });
            } else if (foundUser.username !== decoded.username) {
              console.log("inHERE");
              resolve({
                code: 403,
                success: false,
                message: "Invalid refresh token.",
              });
            } else {
              // Refresh token still valid
              const userJWT = decoded.userJWT;
              console.log(decoded);
              const accessToken = jwt.sign(
                {
                  sub: decoded.sub,
                  username: decoded.username,
                  role: decoded.role,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: "60s",
                  notBefore: "0",
                  audience: process.env.JWT_AUDIENCE,
                  issuer: process.env.JWT_ISSUER,
                }
              );
              const newRefreshToken = jwt.sign(
                {
                  sub: decoded.sub,
                  username: decoded.username,
                  role: decoded.role,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: "12h",
                  notBefore: "0",
                  audience: process.env.JWT_AUDIENCE,
                  issuer: process.env.JWT_ISSUER,
                }
              );
              const result = await users.updateOne(
                { _id: new ObjectId(foundUser._id) },
                {
                  $set: {
                    refreshToken: [...newRefreshTokenArray, newRefreshToken],
                  },
                }
              );
              console.log(result);
              resolve({
                code: 200,
                success: true,
                accessToken: accessToken,
                refreshToken: refreshToken,
              });
            }
          }
        );
      });
      console.log("decoded", decoded);
      return decoded;
    } catch (error) {
      console.error(error);
      return { code: 400, success: false, message: "Invalid refresh token" };
    }
  },
};
