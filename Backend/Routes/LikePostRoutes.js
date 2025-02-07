const express = require("express");
const router = express.Router();
const Middleware = require("../Middleware/index");
const {
  likePost,
  fetchPostLikes,
} = require("../Controllers/LikePostController");

router.put("/likePost/:postId", Middleware, likePost);
router.get("/fetchPostLikes/:postId", Middleware, fetchPostLikes);

module.exports = router;
