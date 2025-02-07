require("http").globalAgent.maxSockets = Infinity;

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT;

const connectToDb = require("./DB/db");
connectToDb();

const userRoutes = require("./Routes/UserRoutes");
const postRoutes = require("./Routes/PostRoutes");
const likePostRoutes = require("./Routes/LikePostRoutes");
const commentOnPostRoutes = require("./Routes/CommentOnPostRoute");
const messageRoutes = require("./Routes/MessageRoute");
const storyRoutes = require("./Routes/StoryRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENDPOINTS
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/post", likePostRoutes);
app.use("/api/post", commentOnPostRoutes);
app.use("/api/story", storyRoutes);
app.use("/api", messageRoutes);

// Configure Multer for User Images
const Userstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/userImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadUImage = multer({ storage: Userstorage });

const Poststorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/postMedia");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadPostMedia = multer({ storage: Poststorage });

// Upload User Images
app.post("/api/user/signupPic", uploadUImage.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Failed to upload image to the server!",
    });
  }
  const imageURL = `http://localhost:5000/uploads/userImages/${req.file.filename}`;
  return res.status(200).json({ success: true, url: imageURL });
});

// Upload Post Media
app.post("/api/post/media", uploadPostMedia.single("media"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Failed to upload image to the server!",
    });
  }
  const imageURL = `http://localhost:5000/uploads/postMedia/${req.file.filename}`;
  return res.status(200).json({ success: true, url: imageURL });
});

// Serve Uploaded Files
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Welcome");
});
const server = app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  pingInterval: 50000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSockets = {};

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);
  socket.on("register_user", (userId) => {
    userSockets[userId] = socket.id;
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    // console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    if (data.isGroupMessage) {
      io.to(data.roomId).emit("receive_message", data);
    } else {
      const receiverSocketId = userSockets[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", data);
        socket.broadcast.emit("receiveMsgNoti", data);
      } else {
        console.log(`Receiver with ID ${data.receiverId} is not connected`);
      }
    }
  });

  socket.on("send_notification", (data) => {
    socket.broadcast.emit("receive_notification", data);
  });

  socket.on("disconnect", () => {
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});
