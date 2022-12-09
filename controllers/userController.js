const Validator = require("validatorjs");
const User = require("../database/models/User");
const Group = require("../database/models/Group");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

let tokenLasts = "1h";

let loginRules = {
  email: "required|email",
  password: "required",
};

let registerRules = {
  username: "required|min:3|max:16",
  email: "required|email",
  password: "required|min:7",
  phone_number: "required|min:10|max:10",
};

//middleware for authenticating user token
async function authenticateUserToken(req, res, next) {
  try {
    req.user = jwt.verify(req.body.token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not Authorized, Go away" });
  }
}

async function getUserHome(req, res) {
  console.log(req.user._id);
  res.send("Home");
}

async function login(req, res) {
  let userObj = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    let validation = new Validator(userObj, loginRules);

    if (validation.passes()) {
      //*imp
      const response = await User.find({ email: userObj.email });

      //user exists
      if (
        response.length &&
        bcrypt.compareSync(userObj.password, response[0].password)
      ) {
        const data = response[0];

        return res.status(200).json({
          token: jwt.sign(
            { _id: data._id, username: data.username },
            process.env.JWT_SECRET,
            { expiresIn: tokenLasts }
          ),
          username: data.username,
          userId: data._id,
        });
      } else {
        return res.status(401).json({
          message: "user does not exist or invalid credentials",
        });
      }
    } else {
      return res.json({ errors: validation.errors });
    }
  } catch (error) {
    console.log(error);
  }

  return res.status(409).json({ status: "user cannot login" });
}

async function register(req, res) {
  let userObj = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    phone_number: req.body.phoneNumber,
  };

  try {
    let validation = new Validator(userObj, registerRules);

    if (validation.passes()) {
      //bcrypt
      let salt = bcrypt.genSaltSync(10);
      userObj.password = bcrypt.hashSync(userObj.password, salt);

      //*imp
      const response = await User.create(userObj);
      console.log(response);
      return res.status(201).json({ status: "user created" });
    } else {
      return res.json({ errors: validation.errors.errors });
    }
  } catch (error) {
    return res.status(409).json({ error });
  }
}

async function getNonGroupUsers(req, res) {
  try {
    const nonGroupUsers = await User.find({
      "groups": { "$ne": mongoose.Types.ObjectId(req.body.groupId) },
    });

    console.log(nonGroupUsers);
    res.json({ nonGroupUsers });
  } catch (error) {
    console.trace(error);
  }
}

async function assignGroupToUser(req, res) {
  try {
    const groupId = req.body.groupId;
    const userId = req.body.userId;

    const group = await User.updateOne(
      {
        _id: userId,
      },
      { $addToSet: { groups: mongoose.Types.ObjectId(groupId) } }
    );

    await Group.updateOne(
      { _id: req.body.groupId },
      { $addToSet: { members: mongoose.Types.ObjectId(userId) } }
    );

    res.json(group);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  login,
  register,
  authenticateUserToken,
  getUserHome,
  assignGroupToUser,
  getNonGroupUsers,
};
