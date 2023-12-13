import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCart = async (userId) => {
  const cart = await Cart.findOne({ owner: userId });

  // Use Promise.all to wait for all the promises to resolve
  const cartTotal = await Promise.all(
    cart.items.map(async (item) => {
      // Assuming each item in the cart has a productId and price property
      const product = await Product.findOne({ _id: item.productId }); // Replace 'Product' with your actual model
      const itemTotal = product.price * item.quantity; // Assuming each item has a quantity property
      return itemTotal;
    })
  ).then((itemTotals) =>
    itemTotals.reduce((total, itemTotal) => total + itemTotal, 0)
  );

  return {
    _id: cart._id,
    items: cart.items,
    cartTotal: cartTotal,
  };
};

const getUserCart = asyncHandler(async (req, res) => {
  let cart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const addItemOrUpdateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // fetch user cart
  let cart = await Cart.findOne({
    owner: req.user._id,
  });

  // If the user doesn't have a cart, create a new one
  if (!cart) {
    cart = new Cart({
      owner: req.user._id,
      items: [],
    });
  }

  // See if product that user is adding exist in the db
  const product = await Product.findById(productId);
  console.log(product);

  if (!product) {
    throw new ApiError(404, "Product does not exist");
  }

  // See if the product that user is adding already exists in the cart
  const addedProduct = cart.items?.find(
    (item) => item.productId.toString() === productId
  );

  if (addedProduct) {
    //   // If product already exist assign a new quantity to it
    //   // ! We are not adding or subtracting quantity to keep it dynamic. Frontend will send us updated quantity here
    addedProduct.quantity = quantity;
  } else {
    // if its a new product being added in the cart push it to the cart items
    cart.items.push({
      productId,
      quantity,
    });
  }

  // Finally save the cart
  await cart.save({ validateBeforeSave: true });

  const newCart = await getCart(req.user._id); // structure the user cart

  return res
    .status(200)
    .json(new ApiResponse(200, newCart, "Item added successfully"));
});

const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  // check for product existence
  if (!product) {
    throw new ApiError(404, "Product does not exist");
  }

  const updatedCart = await Cart.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      // Pull the product inside the cart items
      // ! We are not handling decrement logic here that's we are doing in addItemOrUpdateItemQuantity method
      // ! this controller is responsible to remove the cart item entirely
      $pull: {
        items: {
          productId: productId,
        },
      },
    },
    { new: true }
  );

  let cart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item removed successfully"));
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      $set: {
        items: [],
        coupon: null,
      },
    },
    { new: true }
  );
  const cart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart has been cleared"));
});

export {
  getUserCart,
  addItemOrUpdateItemQuantity,
  removeItemFromCart,
  clearCart,
};
