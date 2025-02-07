const express = require("express");
const router = express.Router();
const Middleware = require("../Middleware/index");
const {
  userSignup,
  verifyOtp,
  chkUNameAlreadyTaken,
  userLogin,
  addAdditionalInfo,
  skipAdditionalInfo,
  UserFollowingList,
  UserFollowersList,
  followUser,
  updateUserSetting,
  deleteUserAccount,
  blockUser,
  searchUser,
  getUserSetting,
  getBlockUsers,
  userProfile,
  showSuggestion,
  userInsights,
  searchedUserProfile,
  chkisFollowTheUser,
  fetchUserFriends,
  updateProfileCover,
  verifyOTPForChangeSettings,
  updateUserSettings,
  handleForgotPassword,
  verifyOTPForFogotPass,
  searchedUserCred,
  removeFollower,
  changeTheme,
  fetchAllUsers,
} = require("../Controllers/UserController");

router.post("/signup", userSignup);
router.post("/verfiyOtp", verifyOtp);
router.post("/sendMailForUpdfSettings", Middleware, updateUserSettings);
router.put("/verfiyOtpAndUpdSettings", Middleware, verifyOTPForChangeSettings);

router.post("/sendMailForForgorPass", handleForgotPassword);
router.put("/verfiyOtpAndUpdPass", verifyOTPForFogotPass);

router.post("/chkUNameExists", chkUNameAlreadyTaken);
router.post("/login", userLogin);
router.put("/addAdditionalInfo", addAdditionalInfo);
router.put("/skipAdditionalInfo", skipAdditionalInfo);
router.get("/userFollowingList/:userId", Middleware, UserFollowingList);
router.get("/userFollowersList/:userId", Middleware, UserFollowersList);
router.post("/chkIsFollow/:userId", Middleware, chkisFollowTheUser);
router.put("/followUser/:userId", Middleware, followUser);
router.get("/userSetting/:id", Middleware, getUserSetting);
router.put("/updateUserSetting/:id", Middleware, updateUserSetting);
router.delete("/deleteUserAccount/:userId", Middleware, deleteUserAccount);
router.put("/blockUser", Middleware, blockUser);
router.get("/getBlockUsers/:userId", Middleware, getBlockUsers);
router.get("/getUserProfile/:userId", Middleware, userProfile);
router.get("/", Middleware, searchUser);
router.get("/showSuggestion", Middleware, showSuggestion);
router.get("/getUserInsights/:userId", Middleware, userInsights);
router.get(
  "/fetchSearchedUserData/:searchUserId",
  Middleware,
  searchedUserProfile
);
router.get(
  "/fetchSearchedUserCred/:searchUserId",
  Middleware,
  searchedUserCred
);
router.get("/userFriends", Middleware, fetchUserFriends);
router.put("/updateProfileCover", Middleware, updateProfileCover);
router.put("/removeFollower", Middleware, removeFollower);
router.put("/changeTheme", Middleware, changeTheme);
router.get("/fetchAllUsers", Middleware, fetchAllUsers);

module.exports = router;
