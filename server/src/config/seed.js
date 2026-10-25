import bcrypt from "bcrypt";
import User from "../user/user.model.js";
import Restaurant from "../resturants/restaurant.model.js";
import Menu from "../menu/menu.model.js";

/**
 * Seeding data definitions for DABBA
 */
const DEFAULT_PASSWORD = "password123";

const ADMIN_USER = {
  fullName: "Admin DABBA",
  email: "admin@dabba.com",
  phone: "+91 98765 00000",
  userType: "Admin",
  photo: { url: "https://placehold.co/400?text=AD" },
};

const CUSTOMER_USERS = [
  {
    fullName: "Rahul Sharma",
    email: "rahul@dabba.com",
    phone: "+91 98765 10001",
    userType: "Customer",
    photo: { url: "https://placehold.co/400?text=RS" },
  },
  {
    fullName: "Priya Patel",
    email: "priya@dabba.com",
    phone: "+91 98765 10002",
    userType: "Customer",
    photo: { url: "https://placehold.co/400?text=PP" },
  },
  {
    fullName: "Rohan Verma",
    email: "rohan@dabba.com",
    phone: "+91 98765 10003",
    userType: "Customer",
    photo: { url: "https://placehold.co/400?text=RV" },
  },
  {
    fullName: "Ananya Iyer",
    email: "ananya@dabba.com",
    phone: "+91 98765 10004",
    userType: "Customer",
    photo: { url: "https://placehold.co/400?text=AI" },
  },
];

const RIDER_USERS = [
  {
    fullName: "Amit Dabbawala",
    email: "rider@dabba.com",
    phone: "+91 98765 20001",
    userType: "Rider",
    photo: { url: "https://placehold.co/400?text=AD" },
  },
  {
    fullName: "Suresh Kumar",
    email: "suresh.rider@dabba.com",
    phone: "+91 98765 20002",
    userType: "Rider",
    photo: { url: "https://placehold.co/400?text=SK" },
  },
  {
    fullName: "Deepak Yadav",
    email: "deepak.rider@dabba.com",
    phone: "+91 98765 20003",
    userType: "Rider",
    photo: { url: "https://placehold.co/400?text=DY" },
  },
  {
    fullName: "Rajesh Gaikwad",
    email: "rajesh.rider@dabba.com",
    phone: "+91 98765 20004",
    userType: "Rider",
    photo: { url: "https://placehold.co/400?text=RG" },
  },
];

const RESTAURANTS_DATA = [
  {
    chef: {
      fullName: "Chef Vikram Malhotra",
      email: "chef@dabba.com",
      phone: "+91 98765 30001",
      userType: "Restaurant",
      photo: { url: "https://placehold.co/400?text=VM" },
    },
    restaurant: {
      name: "Dabba Kitchen Central",
      description: "Authentic homestyle North Indian and Mughlai tiffins prepared fresh daily with cold-pressed oils.",
      address: "Cyber City, Sector 24, Gurugram",
      cuisine: ["North Indian", "Homestyle Thali", "Biryani"],
      isOpen: true,
      image: [{ url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop" }],
    },
    menus: [
      {
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes simmered in a rich tomato-cashew gravy.",
        price: 280,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
      },
      {
        name: "Dal Makhani",
        description: "Slow-cooked black lentils with fresh cream and churned butter.",
        price: 220,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
      },
      {
        name: "Butter Roti (Set of 3)",
        description: "Freshly baked whole wheat flatbreads brushed with pure butter.",
        price: 60,
        category: "Breads",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
      },
      {
        name: "Chicken Dum Biryani",
        description: "Fragrant long-grain basmati rice layered with spiced marinated chicken.",
        price: 340,
        category: "Rice & Biryani",
        isVeg: false,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
      },
      {
        name: "Gulab Jamun (2 Pcs)",
        description: "Golden milk-solid dumplings soaked in rose-cardamom syrup.",
        price: 90,
        category: "Desserts",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500",
      },
    ],
  },
  {
    chef: {
      fullName: "Chef Meera Kulkarni",
      email: "chef2@dabba.com",
      phone: "+91 98765 30002",
      userType: "Restaurant",
      photo: { url: "https://placehold.co/400?text=MK" },
    },
    restaurant: {
      name: "Mumbai Dabbawala Express",
      description: "Traditional Maharashtrian tiffins, batata vada, zesty misal pav, and authentic fast-moving street thalis.",
      address: "Connaught Place, New Delhi",
      cuisine: ["Maharashtrian", "Street Food", "Thali"],
      isOpen: true,
      image: [{ url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop" }],
    },
    menus: [
      {
        name: "Special Veg Thali",
        description: "Complete homestyle thali with dal, 2 seasonal sabzis, 3 rotis, fragrant rice, and sweet.",
        price: 250,
        category: "Thali",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500",
      },
      {
        name: "Batata Vada (2 Pcs)",
        description: "Golden spiced potato fritters served with spicy dry garlic-peanut chutney.",
        price: 80,
        category: "Snacks",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
      },
      {
        name: "Kolhapuri Misal Pav",
        description: "Spicy sprouted moth bean curry topped with farsan, onions, lemon, and warm pav.",
        price: 150,
        category: "Snacks",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500",
      },
      {
        name: "Puran Poli (Set of 2)",
        description: "Sweet stuffed flatbread with jaggery and chana dal served with warm ghee.",
        price: 120,
        category: "Desserts",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500",
      },
    ],
  },
  {
    chef: {
      fullName: "Chef Ramanathan Iyer",
      email: "chef.dakshin@dabba.com",
      phone: "+91 98765 30003",
      userType: "Restaurant",
      photo: { url: "https://placehold.co/400?text=RI" },
    },
    restaurant: {
      name: "Dakshin Rasoi",
      description: "Crispy ghee podi dosas, fluffy steamed idlis, spicy Chettinad curries, and aromatic Madras filter coffee.",
      address: "Indiranagar 100ft Road, Bengaluru",
      cuisine: ["South Indian", "Chettinad", "Healthy Breakfast"],
      isOpen: true,
      image: [{ url: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop" }],
    },
    menus: [
      {
        name: "Ghee Podi Masala Dosa",
        description: "Crispy fermented crepe smeared with aromatic gunpowder podi and spiced potato masala.",
        price: 160,
        category: "Breakfast",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500",
      },
      {
        name: "Steamed Idli & Medu Vada Combo",
        description: "2 soft steamed rice cakes and 1 crispy lentil donut served with piping hot sambar and chutneys.",
        price: 130,
        category: "Breakfast",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
      },
      {
        name: "Chettinad Paneer Masala",
        description: "Fresh paneer braised in roasted whole spices, coconut paste, and black pepper.",
        price: 260,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
      },
      {
        name: "Malabar Parotta (2 Pcs) with Veg Kurma",
        description: "Flaky layered South Indian parottas served with rich vegetable coconut kurma.",
        price: 180,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
      },
      {
        name: "Madras Filter Coffee",
        description: "Freshly brewed chicory blend decoction frothed with boiled creamy milk.",
        price: 60,
        category: "Beverages",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500",
      },
    ],
  },
  {
    chef: {
      fullName: "Chef Farooq Qureshi",
      email: "chef.bawarchi@dabba.com",
      phone: "+91 98765 30004",
      userType: "Restaurant",
      photo: { url: "https://placehold.co/400?text=FQ" },
    },
    restaurant: {
      name: "Royal Hyderabadi Bawarchi",
      description: "Heritage Nizami recipes featuring slow-dum aromatic mutton & chicken biryanis and succulent kebabs.",
      address: "Banjara Hills, Road No. 12, Hyderabad",
      cuisine: ["Hyderabadi", "Biryani", "Mughlai", "Kebab"],
      isOpen: true,
      image: [{ url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop" }],
    },
    menus: [
      {
        name: "Hyderabadi Dum Chicken Biryani",
        description: "Authentic kacchi dum biryani cooked in sealed handi with fragrant spices and saffron.",
        price: 350,
        category: "Biryani",
        isVeg: false,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
      },
      {
        name: "Nizami Mutton Dum Biryani",
        description: "Tender goat meat cuts marinated overnight and cooked with aged basmati rice.",
        price: 480,
        category: "Biryani",
        isVeg: false,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500",
      },
      {
        name: "Tandoori Paneer Tikka",
        description: "Skewered cottage cheese cubes char-grilled with capsicum and spiced yogurt glaze.",
        price: 270,
        category: "Starters",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500",
      },
      {
        name: "Garlic Butter Naan",
        description: "Clay oven leavened bread generously topped with minced garlic and melted butter.",
        price: 75,
        category: "Breads",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
      },
      {
        name: "Shahi Tukda",
        description: "Crispy fried bread slices soaked in saffron rabdi and garnished with crushed pistachios.",
        price: 130,
        category: "Desserts",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500",
      },
    ],
  },
  {
    chef: {
      fullName: "Chef Harpreet Singh",
      email: "chef.punjab@dabba.com",
      phone: "+91 98765 30005",
      userType: "Restaurant",
      photo: { url: "https://placehold.co/400?text=HS" },
    },
    restaurant: {
      name: "Punjab Di Shaan Dhaba",
      description: "Grand Trunk Road nostalgia: smokey clay tandoor rotis, velvety butter chicken, and Amritsari delights.",
      address: "GT Road, Sector 18, Noida",
      cuisine: ["Punjabi", "Tandoor", "Homestyle Thali"],
      isOpen: true,
      image: [{ url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop" }],
    },
    menus: [
      {
        name: "Butter Chicken Special",
        description: "Succulent shredded tandoori chicken simmered in a silky tomato, cashew, and fenugreek makhani.",
        price: 380,
        category: "Main Course",
        isVeg: false,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500",
      },
      {
        name: "Sarson Ka Saag & Makki Di Roti",
        description: "Classic winter mustard greens prepared with white butter, served with two corn flatbreads and jaggery.",
        price: 260,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500",
      },
      {
        name: "Amritsari Chole Kulche Combo",
        description: "Tangy black chickpeas stewed with dry pomegranate seeds served with crisp stuffed kulchas.",
        price: 220,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
      },
      {
        name: "Punjabi Kadhai Paneer",
        description: "Wok-tossed cottage cheese cubes with bell peppers, onions, and freshly ground coriander-chili spice.",
        price: 290,
        category: "Main Course",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
      },
      {
        name: "Patiala Malai Sweet Lassi",
        description: "Thick chilled yogurt blended with sugar, rose water, and topped with a thick dollop of fresh malai.",
        price: 90,
        category: "Beverages",
        isVeg: true,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1571006687899-4c12745cf545?w=500",
      },
    ],
  },
];

/**
 * Upsert user helper ensures user exists and has accurate role & credentials
 */
const upsertUser = async (userData, hashedPassword) => {
  let user = await User.findOne({ email: userData.email });
  if (!user) {
    user = await User.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
      isAvailable: true,
    });
  } else {
    user.fullName = userData.fullName;
    user.phone = userData.phone;
    user.userType = userData.userType;
    user.password = hashedPassword;
    if (user.isActive === undefined) user.isActive = true;
    if (user.isAvailable === undefined) user.isAvailable = true;
    if (userData.photo) {
      user.photo = userData.photo;
    }
    await user.save();
  }
  return user;
};

/**
 * Main seeding function
 */
export const seedDatabase = async ({ force = false } = {}) => {
  try {
    const existingRestaurantCount = await Restaurant.countDocuments();
    if (!force && existingRestaurantCount >= 5) {
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // 1. Seed Admin
    await upsertUser(ADMIN_USER, hashedPassword);

    // 2. Seed Customers
    for (const cust of CUSTOMER_USERS) {
      await upsertUser(cust, hashedPassword);
    }

    // 3. Seed Riders
    for (const rider of RIDER_USERS) {
      await upsertUser(rider, hashedPassword);
    }

    // 4. Seed Restaurants, Chefs, and Menus
    for (const item of RESTAURANTS_DATA) {
      const chefUser = await upsertUser(item.chef, hashedPassword);

      let restaurant = await Restaurant.findOne({ owner: chefUser._id });
      if (!restaurant) {
        restaurant = await Restaurant.findOne({ name: item.restaurant.name });
      }

      if (!restaurant) {
        restaurant = await Restaurant.create({
          ...item.restaurant,
          owner: chefUser._id,
          isActive: true,
        });
      } else {
        restaurant.name = item.restaurant.name;
        restaurant.description = item.restaurant.description;
        restaurant.address = item.restaurant.address;
        restaurant.cuisine = item.restaurant.cuisine;
        restaurant.isOpen = item.restaurant.isOpen;
        restaurant.owner = chefUser._id;
        if (restaurant.isActive === undefined) {
          restaurant.isActive = true;
        }
        if (item.restaurant.image && item.restaurant.image.length > 0) {
          restaurant.image = item.restaurant.image;
        }
        await restaurant.save();
      }

      // Check and seed menu items for this restaurant
      const existingMenuCount = await Menu.countDocuments({ restaurant: restaurant._id });
      if (existingMenuCount === 0 && item.menus && item.menus.length > 0) {
        const menuDocs = item.menus.map((m) => ({
          ...m,
          restaurant: restaurant._id,
        }));
        await Menu.insertMany(menuDocs);
      }
    }

    await User.countDocuments();
    await Restaurant.countDocuments();
    await Menu.countDocuments();
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};


