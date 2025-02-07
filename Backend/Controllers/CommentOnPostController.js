const postModel = require("../Models/postModel");
const commentModel = require("../Models/commentOnPostModel");
const User = require("../Models/userModel");
const NotificationModel = require("../Models/notificationModel");

// Comment on Post
const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(404).json({
        success: false,
        message: "Post Id not found!",
      });
    }
    const userId = req.userToken;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied user Id not provided!!",
      });
    }
    const isPostExists = await postModel.findById(postId);

    if (!isPostExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found which you want to add comment!",
      });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text field is required!",
      });
    }

    const getUserData = await User.findById(userId).select(
      "fullName userName picture"
    );
    if (!getUserData) {
      return res.status(400).json({
        success: false,
        message: "Failed to get user data!",
      });
    }

    const commentOnPost = await commentModel.findOneAndUpdate(
      { postId: postId },
      {
        $push: {
          comments: {
            user: userId,
            userPic: getUserData.picture,
            name: getUserData.fullName,
            userName: getUserData.userName,
            text: text,
          },
        },
      },
      { new: true }
    );
    let notificationData;

    notificationData = await NotificationModel.create({
      user: isPostExists.userId,
      sender: userId,
      type: "comment",
      content: `"${getUserData.fullName}" commented: "${text}" on your post.`,
      isRead: false,
      postId: postId,
    });

    if (commentOnPost) {
      return res.status(200).json({
        success: true,
        message: "Comment on post successfully!",
        updatedComment: commentOnPost,
        notificationData,
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied user Id not provided!!",
      });
    }

    const { commentId } = req.params;
    if (!commentId) {
      return res.status(404).json({
        success: false,
        message: "Comment Id not found!",
      });
    }

    const isCommentExist = await commentModel.findOne({
      "comments._id": commentId,
    });
    if (!isCommentExist) {
      return res.status(400).json({
        success: false,
        message: "Comment not exists!",
      });
    }

    const findCommentAndDelete = await commentModel.findOneAndUpdate(
      { "comments._id": commentId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (findCommentAndDelete) {
      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully!",
        updatedComments: findCommentAndDelete,
      });
    }

    const commentOnPost = await commentModel.findOneAndUpdate(
      { postId: postId },
      {
        $push: {
          comments: {
            user: userId,
            userPic: getUserData.picture,
            name: getUserData.fullName,
            userName: getUserData.userName,
            text: text,
          },
        },
      },
      { new: true }
    );
    if (commentOnPost) {
      return res.status(200).json({
        success: true,
        message: "Comment on post successfully!",
        updatedComment: commentOnPost,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};

const fetchPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(404).json({
        success: false,
        message: "Post Id not found!",
      });
    }
    const userId = req.userToken;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied user Id not provided!",
      });
    }
    const isPostExists = await commentModel
      .findOne({ postId: postId })
      .select("comments");

    if (!isPostExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found which you want to fetch comments!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched post comments successfully!",
      postComments: isPostExists,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports = { commentOnPost, deleteComment, fetchPostComments };
