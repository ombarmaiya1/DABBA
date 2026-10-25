import Cart from "./cart.model.js";
import Menu from "../menu/menu.model.js";
import Restaurant from "../resturants/restaurant.model.js";

// 1. Get the customer's cart
// GET /cart
export const GetCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("restaurant", "name address")
      .populate("items.menuItem");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        restaurant: null,
      });
    }

    return res.status(200).json({
      cart,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching cart";
    next(error);
  }
};

// 2. Add an item to cart
// POST /cart/items
export const AddToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    if (!menuItemId) {
      return res.status(400).json({ message: "menuItemId is required" });
    }

    // Check if the menu item exists
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Verify restaurant is active
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || restaurant.isActive === false) {
      return res.status(400).json({ message: "This kitchen is currently deactivated and not accepting orders" });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        restaurant: null,
      });
    }

    // Check if cart has items from another restaurant
    if (
      cart.restaurant &&
      cart.items.length > 0 &&
      cart.restaurant.toString() !== menuItem.restaurant.toString()
    ) {
      return res.status(400).json({
        message: "Cart contains items from another restaurant. Please clear your cart first.",
      });
    }

    // Set restaurant
    cart.restaurant = menuItem.restaurant;

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        menuItem: menuItemId,
        quantity: Number(quantity),
      });
    }

    await cart.save();
    await cart.populate([
      { path: "restaurant", select: "name address" },
      { path: "items.menuItem" },
    ]);

    return res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while adding to cart";
    next(error);
  }
};

// 3. Update item quantity in cart
// PATCH /cart/items/:menuItemId
export const UpdateCartItemQuantity = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // If quantity is 0 or less, remove the item
    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    // If cart becomes empty, reset restaurant
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();
    await cart.populate([
      { path: "restaurant", select: "name address" },
      { path: "items.menuItem" },
    ]);

    return res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating cart item";
    next(error);
  }
};

// 4. Remove an item from cart
// DELETE /cart/items/:menuItemId
export const RemoveCartItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );

    // If cart becomes empty, reset restaurant
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();
    await cart.populate([
      { path: "restaurant", select: "name address" },
      { path: "items.menuItem" },
    ]);

    return res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while removing cart item";
    next(error);
  }
};

// 5. Clear the entire cart
// DELETE /cart
export const ClearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.restaurant = null;

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while clearing cart";
    next(error);
  }
};
