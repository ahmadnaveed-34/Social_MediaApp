const postModel = require("../Models/postModel");
const likePostModel = require("../Models/likePostModel");
const NotificationModel = require("../Models/notificationModel");
const User = require("../Models/userModel");

// Like/Unlike Post
const likePost = async (req, res) => {
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

    const userData = await User.findById(userId);
    const isPostExists = await postModel.findById(postId);

    if (!isPostExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found which you want to like!",
      });
    }

    const isAlreadyLike = await likePostModel.findOne({
      postId: postId,
      "likes.user": userId,
    });

    if (isAlreadyLike) {
      const unLikeThePost = await likePostModel.findOneAndUpdate(
        { postId: postId },
        { $pull: { likes: { user: userId } } },
        { new: true }
      );

      if (unLikeThePost) {
        return res.status(200).json({
          success: true,
          message: "UnLike the post successfully!",
          updatedLikes: unLikeThePost,
        });
      }
    }

    const likeThePost = await likePostModel.findOneAndUpdate(
      { postId: postId },
      { $push: { likes: { user: userId } } },
      { new: true }
    );
    let notificationData;

    notificationData = await NotificationModel.create({
      user: isPostExists.userId,
      sender: userId,
      type: "like",
      content: `"${userData.fullName}" liked your post.`,
      isRead: false,
      postId: postId,
    });

    if (likeThePost) {
      return res.status(200).json({
        success: true,
        message: "Like the post successfully!",
        updatedLikes: likeThePost,
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

const fetchPostLikes = async (req, res) => {
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
    const isPostExists = await likePostModel
      .findOne({ postId: postId })
      .select("likes");

    if (!isPostExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found which you want to fetch likes!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched post like successfully!",
      postLikes: isPostExists,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
module.exports = { likePost, fetchPostLikes };
