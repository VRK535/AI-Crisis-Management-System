import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";

class AuthService {
  async register({
    name,
    email,
    phone,
    password,
    age,
    bloodGroup,
    medicalConditions,
    specialNeeds
  }) {
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(409, "Email is already registered");
      }

      if (existingUser.phone === phone) {
        throw new ApiError(409, "Phone number is already registered");
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      age: age || null,
      bloodGroup: bloodGroup || null,
      medicalConditions: medicalConditions || [],
      specialNeeds: specialNeeds || ""
    });

    const token = generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        bloodGroup: user.bloodGroup,
        medicalConditions: user.medicalConditions,
        specialNeeds: user.specialNeeds
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account is inactive");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        bloodGroup: user.bloodGroup,
        medicalConditions: user.medicalConditions,
        specialNeeds: user.specialNeeds
      },
      token
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return {
      message: "Password changed successfully"
    };
  }
}

const authService = new AuthService();

export const registerUser = authService.register.bind(authService);
export const loginUser = authService.login.bind(authService);
export const changePassword = authService.changePassword.bind(authService);

export default authService;