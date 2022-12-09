const init = require("./database/init");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();

//my modules
const {
  login,
  register,
  authenticateUserToken,
  getUserHome,
  assignGroupToUser,
  getNonGroupUsers,
} = require("./controllers/userController");

const { saveUserChat, getGroupChats } = require("./controllers/chatController");

const {
  getAllUserGroups,
  addNewGroup,
  addUsersToGroup,
  getSingleGroup,
} = require("./controllers/groupController");

//express middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

init();
dotenv.config();

//Register User
//Login User
//Allow User to Chat/Discuss in Group
//Allow User to Chat/Discuss with a Person
//Save/Load Chats

app.get("/", (req, res) => {
  res.json({ message: "connection ok" });
});

app.route("/login").post(login);
app.route("/register").post(register);
app.route("/send-chat").post(authenticateUserToken).post(saveUserChat);
app.route("/get-chats").post(authenticateUserToken).post(getGroupChats);
app.route("/get-groups").post(authenticateUserToken).post(getAllUserGroups);
app.route("/add-newgroup").post(authenticateUserToken).post(addNewGroup);
app.route("/home").post(authenticateUserToken).post(getUserHome);
app
  .route("/get-allnongroupusers")
  .post(authenticateUserToken)
  .post(getNonGroupUsers);

app.route("/get-singlegroup").post(authenticateUserToken).post(getSingleGroup);

app
  .route("/assign-usertogroup")
  .post(authenticateUserToken)
  .post(assignGroupToUser);

app.route("/add-usertogroup").post(authenticateUserToken).post(addUsersToGroup);

//socket io code
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: true, origin: "http://localhost:3000" });
let set = new Set();
let map = new Map();

try {
  io.on("connection", (socket) => {
    socket.on("join chat", ({ room, userId }) => {
      socket.join(room);
      console.log(`Joiner ID: ${userId}, Room: ${room}`);

      console.log(typeof room, room);

      var b = io.sockets.adapter.rooms.get(room).size;
      console.log("online users " + b + " in " + room);

      map.set(room, set.add(userId));

      //tells how many users are in room
      //console.log(map);
    });

    socket.on("join", ({ userId }) => {
      console.log("socket joined " + userId);
      socket.join(userId);

      //tells how many user are on app
      // console.log("app on user " + set.size);
    });

    // socket.on("addUser", () => {
    //   set.add(socket.id);
    //   console.log(set);
    // });

    // socket.on("chat from browser", (anotherSocketId, msg) => {
    //   socket.to(anotherSocketId).emit("private message", socket.id, msg);
    // });

    socket.on("user_addedtogroup", ({ userId }) => {
      try {
        socket.join(userId);
        console.log(userId + " added");
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("notify_user", ({ userId, groupId }) => {
      socket.broadcast.in(userId).emit("user_add_server", { groupId });
    });

    socket.on("chat from browser", (message, room, senderName) => {
      console.log("here");
      socket.broadcast
        .in(room)
        .emit("chat from server", { message, senderName });
    });
  });
} catch (error) {
  console.log(error);
}

server.listen(process.env.PORT || 4000);

/* */
