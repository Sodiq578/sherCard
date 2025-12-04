// =======================
//  STARTER SHOPS DATA
// =======================
const DEFAULT_SHOPS = [
  {
    id: 1,
    name: "Burger King",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Burger_King_2020.svg",
    description: "Tez tayyorlanadigan burgerlar",
    menu: [
      { id: 1, name: "Whopper", price: 45000, image: "https://static.wikia.nocookie.net/burgerking/images/7/7c/Whopper.png" },
      { id: 2, name: "Cheeseburger", price: 35000, image: "https://static.wikia.nocookie.net/burgerking/images/2/28/Cheeseburger.png" },
    ],
  },
  {
    id: 2,
    name: "KFC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/KFC_logo.svg",
    description: "Mazali tovuq go‘shtli taomlar",
    menu: [
      { id: 3, name: "Zinger", price: 48000, image: "https://static.wikia.nocookie.net/kfc/images/9/9e/Zinger.png" },
      { id: 4, name: "BoxMaster", price: 52000, image: "https://static.wikia.nocookie.net/kfc/images/a/a0/Boxmaster.png" },
    ],
  },
  // ... qolganlari o‘zgarishsiz
];


// =======================
//  STORAGE SETTINGS
// =======================
const SHOP_KEY = "shopsData";


// =======================
//  GET SHOPS
// =======================
export const getShops = () => {
  try {
    const stored = localStorage.getItem(SHOP_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SHOPS;
  } catch (err) {
    console.error("shopsData o‘qishda xato:", err);
    return DEFAULT_SHOPS;
  }
};


// =======================
//  SAVE SHOPS
// =======================
export const saveShops = (shops) => {
  try {
    if (!Array.isArray(shops)) throw new Error("Shops array bo‘lishi kerak!");

    localStorage.setItem(SHOP_KEY, JSON.stringify(shops));
    return true;
  } catch (err) {
    console.error("shopsData saqlashda xato:", err);
    return false;
  }
};


// =======================
//  ADD SHOP
// =======================
export const addShop = (shop) => {
  const shops = getShops();

  const newShop = {
    id: Date.now(),
    name: shop.name?.trim() || "Noma'lum",
    logo: shop.logo?.trim() || "https://picsum.photos/seed/default/200/300",
    description: shop.description || "",
    createdAt: new Date().toISOString(),
    menu: shop.menu || [],
  };

  shops.push(newShop);
  saveShops(shops);

  return newShop;
};


// =======================
//  UPDATE SHOP
// =======================
export const updateShop = (id, updates) => {
  const shops = getShops();
  const index = shops.findIndex((shop) => shop.id === id);

  if (index === -1) return null;

  shops[index] = { ...shops[index], ...updates };
  saveShops(shops);

  return shops[index];
};


// =======================
//  DELETE SHOP
// =======================
export const deleteShop = (id) => {
  const shops = getShops();
  const filtered = shops.filter((shop) => shop.id !== id);

  saveShops(filtered);
  return true;
};
