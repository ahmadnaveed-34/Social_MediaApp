const express = require("express");
const router = express.Router();
const Middleware = require("../Middleware/index");
const {
  commentOnPost,
  deleteComment,
  fetchPostComments,
} = require("../Controllers/CommentOnPostController");

router.put("/commentOnPost/:postId", Middleware, commentOnPost);
router.delete("/deleteComment/:commentId", Middleware, deleteComment);
router.get("/fetchPostComments/:postId", Middleware, fetchPostComments);

module.exports = router;
