/* ========================================
   Restaurant Images (Stitch-generated)
   ======================================== */
export const RESTAURANT_IMAGES = {
  mughalEra: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiXAolW_wMSj1grDlAtt7KOdxMcmh8AFbX_-UO-khirO3VWaV3PumTY1lb22CLBrEnDau7LFND5-YOgbL8lFPL3ii-spRgmX1lnAjof8lIlBsMQm_abXN96fbZPLmd4lUmYG3Nq34pSuVz7pDkZID5pqY4bvP-axJgHZShcx2YULbj7mwUGQeXglXHY2H5TfqjUGBWeOLGXYBxCllpURsgDObiqHCWekKwAx1Py3OOis99EHH5lNZrjI0SJCLAQYQzoIYzeZFnKAx1',
  southFlavor: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlomyxN8u4hh1QI65OLNE4vHvLKanf0xdb42YfolYCzObX5I2-V73nv6wE7WzximmoMXACMf3nXnw6hKeGQgHMSQXJOxEGmNbwWFd4RJZfWttIQFhKINL0Jxp1aWcTOMgQhDxmVgwWOZez8ObNKuQTvRUUBTrz2LKF3ijlUSn170YQQIIaGTARRwDYZkzK5h9sJ3Pe9O5jecornm5dvY8mW9xUz8wgFEH5LFNdq84Sxf9SPxJNh-JC7I0IHWzMbYbXoM19qII8Q1Ue',
  goldenDragon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvupD83eQH9YKjQn1iDlcdoCbIi4RB5TAWYXHV_11gYTaiQqTuLtxes1blt8T9oBLsJPpUnAh6i3rrOqUjH0fWrxiyplrEX6FT6XAd5O9Sw2Kx5dBfbyoN-m5tfQnLPiJbxXlEDryY8AYdUTN0g99KIiwE1oMCpY84xhBzyspyATfL_xj72PxXdOkSp-bTB7-iXdGUWVLIuUKdp6u9EGk2luNzPUuliyqoD9bIb8k8cp31-Mzot7nzZofFdmrdgOd9tApVg0KuYgZ0',
};

/* ========================================
   Stats Data
   ======================================== */
export const STATS = [
  { value: '11 MIN', label: 'Avg. Delivery' },
  { value: '6,200+', label: 'Restaurants' },
  { value: '42', label: 'Cities Covered' },
  { value: '99.1%', label: 'On-time Rate' },
];

/* ========================================
   Cuisine Chips
   ======================================== */
export const CUISINE_CHIPS = [
  { label: 'North Indian', active: true },
  { label: 'South Indian', active: false },
  { label: 'Chinese', active: false },
  { label: 'Biryani', active: false },
  { label: 'Street Food', active: false },
  { label: 'Desserts', active: false },
  { label: 'Healthy', active: false },
  { label: 'Bakery', active: false },
];

/* ========================================
   How It Works Steps
   ======================================== */
export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Place your order',
    description: 'Browse curated menus and tap to order. Our system instantly syncs with the nearest available Dabbawala.',
  },
  {
    number: '02',
    title: 'The kitchen fires it',
    description: 'Real-time coordination ensures your food is packed exactly as the delivery partner arrives. Zero wait time.',
  },
  {
    number: '03',
    title: 'It comes to you',
    description: 'Track your meal with hyper-precision. From the kitchen stove to your doorstep, every second is accounted for.',
  },
];

/* ========================================
   Restaurant Cards Data
   ======================================== */
export const RESTAURANTS = [
  {
    id: 1,
    name: 'The Mughal Era',
    cuisine: 'North Indian • Fine Dining',
    rating: '4.8',
    deliveryTime: '25 MIN',
    priceForTwo: '₹500 FOR TWO',
    image: RESTAURANT_IMAGES.mughalEra,
    imageAlt: 'Premium North Indian dining with rich butter chicken and steaming naan bread',
  },
  {
    id: 2,
    name: 'South Flavor',
    cuisine: 'South Indian • Comfort',
    rating: '4.5',
    deliveryTime: '30 MIN',
    priceForTwo: '₹300 FOR TWO',
    image: RESTAURANT_IMAGES.southFlavor,
    imageAlt: 'Vibrant South Indian cuisine featuring golden dosas and colorful chutneys',
  },
  {
    id: 3,
    name: 'Golden Dragon',
    cuisine: 'Chinese • Authentic',
    rating: '4.6',
    deliveryTime: '20 MIN',
    priceForTwo: '₹450 FOR TWO',
    image: RESTAURANT_IMAGES.goldenDragon,
    imageAlt: 'Modern Chinese fusion dish with vibrant vegetables and noodles',
  },
];

/* ========================================
   Hero Ticket Data
   ======================================== */
export const HERO_TICKET = {
  orderId: '#4471',
  time: '12:32 PM',
  status: 'OUT FOR DELIVERY',
  items: [
    { name: 'Butter Chicken x2', price: '₹840' },
    { name: 'Garlic Naan x3', price: '₹180' },
  ],
};

/* ========================================
   Testimonial Data
   ======================================== */
export const TESTIMONIAL = {
  quote: "The fastest delivery in Indiranagar, every single time. It's like they know what I want before I even press order.",
  customerName: 'Rahul S.',
  customerLabel: 'Customer',
  verifiedLabel: 'Verified Trip',
  verifiedTime: '12:45 PM',
};

/* ========================================
   Footer Links
   ======================================== */
export const FOOTER_LINKS = {
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  contact: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Support Center', href: '/support' },
    { label: 'Help Desk', href: '/help' },
  ],
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
};

/* ========================================
   Nav Links
   ======================================== */
export const NAV_LINKS = [
  { label: 'Menu', href: '/menu' },
  { label: 'Track', href: '/track' },
  { label: 'About', href: '/about' },
];
