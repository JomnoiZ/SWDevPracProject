const User = require("../models/user");
const ShopOwner = require("../models/shopowner");

// @desc     Register user
// @route    POST /api/v1/auth/user/register
// @access   Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, tel, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      tel,
      role,
    });

    // Create token
    sendTokenResponseUser(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc     Register shop owner
// @route    POST /api/v1/auth/shop-owner/register
// @access   Public
exports.registerShopOwner = async (req, res, next) => {
  try {
    const { name, email, password, tel, role } = req.body;

    // Create shop owner
    const shopOwner = await ShopOwner.create({
      name,
      email,
      password,
      tel,
      role,
    });

    // Create token
    sendTokenResponseShopOwner(shopOwner, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc     Login user
// @route    POST /api/v1/auth/user/login
// @access   Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Create token
    sendTokenResponseUser(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc     Login shop owner
// @route    POST /api/v1/auth/shop-owner/login
// @access   Public
exports.loginShopOwner = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide email and password" });
    }

    // Check for user
    const shopOwner = await ShopOwner.findOne({ email }).select("+password");

    if (!shopOwner) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await shopOwner.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Create token
    sendTokenResponseShopOwner(shopOwner, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponseUser = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// Get token from model, create cookie and send response
const sendTokenResponseShopOwner = (shopOwner, statusCode, res) => {
  // Create token
  const token = shopOwner.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc    Get current Logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  if (req.user.role !== "user") {
    const shopOwner = await ShopOwner.findById(req.user.id).populate("shops");
    return res.status(200).json({
      success: true,
      data: shopOwner,
    });
  } else {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/user/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
    console.log(err.stack);
  }
};
