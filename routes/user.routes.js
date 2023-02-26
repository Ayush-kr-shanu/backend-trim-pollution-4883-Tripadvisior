const express = require("express");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel } = require("../model/user.model");

const userRoute = express.Router();

//for register new user
userRoute.post("/register", async (req, res) => {
  const { name, email, pass } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.send({ msg: "User already registered, please login" });
    }
    bcrypt.hash(pass, 5, async (err, hash) => {
      if (err) {
        return res.send({ msg: "Something went wrong", error: err.message });
      } else {
        const user = new UserModel({ name, email, pass: hash });
        await user.save();
        return res.send({ msg: "User registered successfully" });
      }
    });
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err.message });
  }
});


//for login user
userRoute.post("/login", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const user = await UserModel.find({ email });
    if (user.length > 0) {
      bcrypt.compare(pass, user[0].pass, (err, result) => {
        if (result) {
          let token = jwt.sign({ userID: user[0]._id }, "masai");
          res.send({ msg: "user has been logged in", token: token });
        } else {
          res.send({ msg: "wrong credential" });
        }
      });
    } else {
      res.send({ msg: "wrong credential" });
    }
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err.message });
  }
});


//for update password
userRoute.put('/update-pass', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (user) {
        bcrypt.compare(oldPassword, user.pass, async (err, result) => {
          if (result) {
            const hashedNewPassword = await bcrypt.hash(newPassword, 5);
            user.pass = hashedNewPassword;
            await user.save();
            res.send({ msg: "Password updated successfully" });
          } else {
            res.send({ msg: "Old password is incorrect" });
          }
        });
      } else {
        res.send({ msg: "User not found" });
      }
    } catch (err) {
      res.send({ msg: "Something went wrong", error: err.message });
    }
  });


//for delte the user
userRoute.delete('/delete', async (req, res) => {
    const email = req.body.email;
    try {
      const result = await UserModel.findOneAndDelete({ email });
      if (result) {
        res.send(`User with email ${email} has been deleted.`);
      } else {
        res.status(404).send(`User with email ${email} not found.`);
      }
    } catch (err) {
      res.send({ msg: "Something went wrong", error: err.message });
    }
  });

module.exports = {
  userRoute,
};
