const { default: mongoose } = require("mongoose");
const Group = require("../database/models/Group");
const User = require("../database/models/User");
const Validator = require("validatorjs");

let groupRules = {
  name: "required|min:3|max:200",
  members: "required",
};

async function addNewGroup(req, res) {
  let groupObj = {
    name: req.body.name,
    members: req.body.firstMember,
  };

  let validator = new Validator(groupObj, groupRules);

  if (validator.passes()) {
    try {
      const group = await Group.create({
        name: req.body.name,
        members: [mongoose.Types.ObjectId(req.body.firstMember)],
      });

      await User.updateOne(
        { _id: req.body.firstMember },
        { $addToSet: { groups: mongoose.Types.ObjectId(group._id) } }
      );

      return res.status(201).json({ group });
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("group validation failed");
  }
}

async function getAllUserGroups(req, res) {
  try {
    const user = await User.find({
      _id: req.user._id,
    });

    const userGroups = user[0].groups;

    if (!userGroups.length) {
      return res.json({ groups: [] });
    }

    const groups = await Group.find({ _id: { $in: userGroups } });
    res.json({ groups });
  } catch (error) {
    console.log(error);
  }
}

async function addUsersToGroup(req, res) {
  try {
    const groupUsers = await User.find({
      "groups": { "$eq": mongoose.Types.ObjectId(req.body.groupId) },
    });

    //iterate through all the users who are in this group
    groupUsers.forEach(async (el) => {
      await Group.updateOne(
        { _id: req.body.groupId },
        { $addToSet: { members: el._id } }
      );
    });

    console.log(groupUsers);
    res.json({ groupUsers });
  } catch (error) {
    console.trace(error);
  }
}

async function getSingleGroup(req, res) {
  try {
    const group = await Group.find({ _id: req.body.groupId });

    res.json({ group });
  } catch (error) {
    console.trace(error);
  }
}

module.exports = {
  getAllUserGroups,
  addNewGroup,
  addUsersToGroup,
  getSingleGroup,
};
