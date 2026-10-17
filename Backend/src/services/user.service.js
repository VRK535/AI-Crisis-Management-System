import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const {
      name,
      email,
      phone,
      age,
      bloodGroup,
      medicalConditions,
      specialNeeds,
      devicePublicKey,
      p2pPeerId,
      lastLocation
    } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: userId }
      });

      if (emailExists) {
        throw new ApiError(409, "Email is already registered");
      }

      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({
        phone,
        _id: { $ne: userId }
      });

      if (phoneExists) {
        throw new ApiError(409, "Phone number is already registered");
      }

      user.phone = phone;
    }

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;
    if (specialNeeds !== undefined) user.specialNeeds = specialNeeds;
    if (devicePublicKey !== undefined) user.devicePublicKey = devicePublicKey;
    if (p2pPeerId !== undefined) user.p2pPeerId = p2pPeerId;
    if (lastLocation !== undefined) user.lastLocation = lastLocation;

    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      age: user.age,
      bloodGroup: user.bloodGroup,
      medicalConditions: user.medicalConditions,
      specialNeeds: user.specialNeeds,
      devicePublicKey: user.devicePublicKey,
      p2pPeerId: user.p2pPeerId,
      lastLocation: user.lastLocation,
      isActive: user.isActive
    };
  }
}

const userService = new UserService();

export const getUserProfile = userService.getProfile.bind(userService);
export const updateUserProfile = userService.updateProfile.bind(userService);
export const getProfile = getUserProfile;
export const updateProfile = updateUserProfile;

export default userService;