import Menu from "./menu.model.js";
import Restaurant from "../resturants/restaurant.model.js";
import cloudinary from "../config/cloudinary.js";

// 1. Add a menu item
// POST /restaurants/:restaurantId/menu
export const AddMenuItem = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, price, category, isVeg, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if the logged-in user is the restaurant owner
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.userType !== "Admin") {
      return res.status(403).json({ message: "You can only add items to your own restaurant" });
    }

    // Handle image upload if a file was selected
    let imageUrl = "";
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "menu",
      });

      imageUrl = uploadResult.secure_url;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const menuItem = new Menu({
      restaurant: restaurantId,
      name,
      description,
      price,
      category,
      image: imageUrl,
      isVeg: isVeg !== undefined ? isVeg : true,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    await menuItem.save();

    return res.status(201).json({
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while adding menu item";
    next(error);
  }
};

// 2. Get a restaurant's menu
// GET /restaurants/:restaurantId/menu
export const GetRestaurantMenu = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const menu = await Menu.find({ restaurant: restaurantId });

    return res.status(200).json({
      count: menu.length,
      menu,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching menu";
    next(error);
  }
};

// 3. Update a menu item
// PATCH /menu/:menuId
export const UpdateMenuItem = async (req, res, next) => {
  try {
    const { menuId } = req.params;

    const menuItem = await Menu.findById(menuId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check restaurant ownership
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || (restaurant.owner.toString() !== req.user._id.toString() && req.user.userType !== "Admin")) {
      return res.status(403).json({ message: "You can only update your own restaurant's menu items" });
    }

    // If a new image was uploaded
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "menu",
      });

      req.body.image = uploadResult.secure_url;
    }

    const updatedItem = await Menu.findByIdAndUpdate(menuId, req.body, { new: true });

    return res.status(200).json({
      message: "Menu item updated successfully",
      menuItem: updatedItem,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating menu item";
    next(error);
  }
};

// 4. Delete a menu item
// DELETE /menu/:menuId
export const DeleteMenuItem = async (req, res, next) => {
  try {
    const { menuId } = req.params;

    const menuItem = await Menu.findById(menuId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check restaurant ownership
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || (restaurant.owner.toString() !== req.user._id.toString() && req.user.userType !== "Admin")) {
      return res.status(403).json({ message: "You can only delete your own restaurant's menu items" });
    }

    await Menu.findByIdAndDelete(menuId);

    return res.status(200).json({
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while deleting menu item";
    next(error);
  }
};
