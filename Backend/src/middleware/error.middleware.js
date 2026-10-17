import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((item) => ({
            field: item.path,
            message: item.message
        }));

        error = new ApiError(
            400,
            "Validation failed",
            errors
        );
    }

    // MongoDB duplicate key error
    if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];

        error = new ApiError(
            409,
            `${field || "Field"} already exists`
        );
    }

    // Invalid MongoDB ObjectId
    if (err instanceof mongoose.Error.CastError) {
        error = new ApiError(
            400,
            `Invalid ${err.path}`
        );
    }

    const statusCode = error.statusCode || 500;

    const response = {
        success: false,
        statusCode,
        message:
            error.message || "Internal server error"
    };

    if (error.errors?.length) {
        response.errors = error.errors;
    }

    if (env.nodeEnv === "development") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export default errorMiddleware;