const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  // console.log(req.body);

  try {
    const checkEmail = await User.findOne({ email });
    if (checkEmail)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const checkUsername = await User.findOne({ username });
    if (checkUsername)
      return res.json({
        success: false,
        message: "Username is already taken! Please try another one",
      });

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });
    await newUser.save();
    res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.email,
        username: checkUser.username,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token,
      user: {
        id: checkUser._id,
        email: checkUser.email,
        username: checkUser.username,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

const completeProfile = async (req, res) => {
  try {
  // Check if the user is authenticated
  const userId = req.user.id;
  const updateFields = {
    profilePicture: req.body.profilePicture,
    location: req.body.location,
    bio: req.body.bio,
    experienceLevel: req.body.experienceLevel,
    experienceYear: req.body.experienceYear,
    preferredLanguages: req.body.preferredLanguages,
    availability: req.body.availability,
    additionalSkills: req.body.additionalSkills,
  };

  // Remove undefined/null fields
  Object.keys(updateFields).forEach(
    (key) => updateFields[key] == null && delete updateFields[key]
  );

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
  });
  res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err });
  }
}

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, completeProfile };
