import { ApiError } from "../utils/ApiError.js";
import JwtService from "../utils/JwtService.js";

const auth = async (req, res, next) => {
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new ApiError(401, 'UnAuthorized'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const { _id, role } = JwtService.verify(token);
        const user = {
            _id,
            role
        };
        req.user = user;
        next();
    } catch (err) {
        return next(new ApiError(401, err));
    }
};

export default auth;
