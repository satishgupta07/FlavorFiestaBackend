import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


const admin = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        if (user.role === 'admin') {
            next();
        } else {
            return next(new ApiError(401, 'UnAuthorized'));
        }
    } catch (err) {
        return next(new ApiError(500, err.message));
    }
};

export default admin;
