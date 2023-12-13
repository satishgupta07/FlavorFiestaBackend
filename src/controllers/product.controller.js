import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";

const productController = {
  async store(req, res, next) {
    // Validation
    const productSchema = Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required(),
      size: Joi.string().required(),
      image: Joi.string(),
    });

    const { error } = productSchema.validate(req.body);

    if (error) {
      return next(new ApiError(error));
    }

    const { name, price, size, image } = req.body;

    const product = new Product({
      name,
      price,
      size,
      image,
    });

    try {
      const createdProduct = await product.save();

      return res.status(200).json({ createdProduct });
    } catch (err) {
      return next(new ApiError(error));
    }
  },

  update(req, res, next) {},

  async destroy(req, res, next) {},

  async index(req, res, next) {
    let documents;
    // pagination mongoose-pagination
    try {
      documents = await Product.find().select("-updatedAt -__v").sort({ _id: -1 });
    } catch (error) {
      return next(new ApiError(500, error));
    }

    return res.json(documents);
  },

  async show(req, res, next) {
    let document;
    try {
      document = await Product.findOne({ _id: req.params.id }).select(
        "-updatedAt -__v"
      );
    } catch (error) {
      return next(new ApiError(500, error));
    }
    return res.json(document);
  },
};

export default productController;
