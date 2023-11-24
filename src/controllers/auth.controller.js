import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Joi from "joi";
import JwtService from "../utils/JwtService.js";
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const registerUser = asyncHandler(async (req, res) => {
  // Validation
  const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });

  const { error } = registerSchema.validate(req.body);
  if (error) {
    return next(new ApiError(400, error));
  }

  // check if user is in the database already
  try {
    const existedUser = await User.exists({ email: req.body.email });
    if (existedUser) {
      return next(new ApiError(409, "User with email already exists"));
    }
  } catch (err) {
    return next(new ApiError);
  }

  const { name, email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create a user
  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Token
  const access_token = JwtService.sign({
    _id: createdUser._id,
    role: createdUser.role,
  });
  const refresh_token = JwtService.sign(
    { _id: createdUser._id, role: createdUser.role },
    "1y",
    REFRESH_SECRET
  );

  //database whitelist
  await User.findByIdAndUpdate(createdUser._id, {
    refreshToken: refresh_token,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        {"user" : createdUser, access_token, refresh_token },
        "User registered Successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Validation
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return next(new ApiError(400, error));
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError(401, "Username or password is wrong!"));
    }
    // compare the password
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return next(new ApiError(401, "Username or password is wrong!"));
    }

    // Token
    const access_token = JwtService.sign({ _id: user._id, role: user.role });
    const refresh_token = JwtService.sign(
      { _id: user._id, role: user.role },
      "1y",
      REFRESH_SECRET
    );

    //database whitelist
    await User.findByIdAndUpdate(user._id, {
      refreshToken: refresh_token,
    });

    res
      .status(201)
      .json(new ApiResponse(200, { access_token, refresh_token, user }));
  } catch (err) {
    return next(new ApiError(err));
  }
});

const getCurrentLoginUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select(
      "-password -updatedAt -__v"
    );
    if (!user) {
      return next(new ApiError(404, "User not found !!"));
    }
    res.json(user);
  } catch (err) {
    return next(new ApiError(err));
  }
});

const logoutUser = asyncHandler(async (req, res, next) => {
  // Assuming you have a user authenticated in your middleware and stored in req.user
  const userId = req.user._id;

  try {
    // Invalidate the refresh token by removing it from the database
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    // Respond with a success message
    res
      .status(200)
      .json(new ApiResponse(200, { message: "Logout successful" }));
  } catch (err) {
    // Handle errors, and pass them to the error-handling middleware
    return next(new ApiError(err));
  }
});

export { registerUser, loginUser, logoutUser, getCurrentLoginUser };
