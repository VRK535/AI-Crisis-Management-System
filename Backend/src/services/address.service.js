import Address from "../models/Address.js";
import ApiError from "../utils/ApiError.js";

class AddressService {
  // Add a new address
  async addAddress(userId, addressData) {
    const address = await Address.create({
      ...addressData,
      userId: userId,
    });

    return address;
  }

  // Alias
  async createAddress(userId, addressData) {
    return this.addAddress(userId, addressData);
  }

  // Get all addresses of the logged-in user
  async getAddresses(userId) {
    return Address.find({
      userId: userId,
    }).sort({ createdAt: -1 });
  }

  // Get a specific address
  async getAddress(userId, addressId) {
    const address = await Address.findOne({
      _id: addressId,
      userId: userId,
    });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    return address;
  }

  // Alias
  async getAddressById(userId, addressId) {
    return this.getAddress(userId, addressId);
  }

  // Update an address
  async updateAddress(userId, addressId, updateData) {
    const address = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId: userId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    return address;
  }

  // Delete an address
  async deleteAddress(userId, addressId) {
    const address = await Address.findOneAndDelete({
      _id: addressId,
      userId: userId,
    });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    return {
      message: "Address deleted successfully",
    };
  }
}

export default new AddressService();