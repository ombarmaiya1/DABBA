import Restaurant from "./restaurant.model.js";
import cloudinary from "../config/cloudinary.js";

// Step 2: Create restaurant
// Allows a restaurant owner to register their restaurant
export const CreateRestaurant = async (req, res, next) => {
  try {
    const { name, description, address, cuisine } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: "Name and address are required" });
    }

    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
    if (existingRestaurant) {
      return res.status(400).json({ message: "You already have a restaurant registered" });
    }

    // Upload image to Cloudinary if a file was selected
    let imageArray = [];
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "restaurants",
      });

      imageArray.push({ url: uploadResult.secure_url });
    }

    // Format cuisine if sent as comma-separated text in form-data
    let formattedCuisine = [];
    if (Array.isArray(cuisine)) {
      formattedCuisine = cuisine;
    } else if (typeof cuisine === "string" && cuisine.trim()) {
      formattedCuisine = cuisine.split(",").map((c) => c.trim());
    }

    const restaurant = new Restaurant({
      name,
      description,
      address,
      cuisine: formattedCuisine,
      image: imageArray,
      owner: req.user._id,
    });

    await restaurant.save();

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while creating restaurant";
    next(error);
  }
};

// Step 3: Get all restaurants
// Let customers browse restaurants
export const GetRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().populate("owner", "fullName email phone");

    return res.status(200).json({
      restaurants,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while getting restaurants";
    next(error);
  }
};

// Step 4: Get single restaurant
// Show a restaurant's details
export const GetSingleRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id).populate("owner", "fullName email phone");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      restaurant,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while getting restaurant";
    next(error);
  }
};

// Step 5: Update restaurant
// Let owners edit their own restaurant
export const UpdateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if the logged-in user is the owner
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own restaurant" });
    }

    // If a new image file is uploaded during update
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "restaurants",
      });

      req.body.image = [{ url: uploadResult.secure_url }];
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating restaurant";
    next(error);
  }
};

// Step 6: Open/close restaurant
// Control whether it accepts orders
export const ToggleOpenStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if the logged-in user is the owner
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only change status of your own restaurant" });
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    return res.status(200).json({
      message: `Restaurant is now ${restaurant.isOpen ? "open" : "closed"}`,
      isOpen: restaurant.isOpen,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while updating status";
    next(error);
  }
};
