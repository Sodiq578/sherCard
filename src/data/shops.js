// src/data/shops.js
export const getShops = () => {
  try {
    const stored = localStorage.getItem('shops');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("shops o'qishda xato:", error);
  }

  const defaultShops = [
    {
      id: 1,
      name: "Evos",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Evos_logo.png",
      menu: [
        { id: 101, name: "Lavash", price: 25000, image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 102, name: "Burger", price: 30000, image: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 103, name: "Cola", price: 8000, image: "https://images.pexels.com/photos/1322188/pexels-photo-1322188.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 2,
      name: "Bellissimo",
      logo: "https://bellissimo.uz/images/logo_new.svg",
      menu: [
        { id: 201, name: "Pizza Margherita", price: 45000, image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 202, name: "Pasta", price: 35000, image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 203, name: "Tiramisu", price: 20000, image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 3,
      name: "KFC",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/KFC_logo.svg",
      menu: [
        { id: 301, name: "Zinger Burger", price: 38000, image: "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 302, name: "6 dona Hot Wings", price: 42000, image: "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-60616.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 303, name: "Fries", price: 15000, image: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 4,
      name: "McDonald's",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/McDonald%27s_logo.svg",
      menu: [
        { id: 401, name: "Big Mac", price: 40000, image: "https://images.pexels.com/photos/2983098/pexels-photo-2983098.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 402, name: "McChicken", price: 32000, image: "https://images.pexels.com/photos/2282528/pexels-photo-2282528.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 403, name: "McFlurry", price: 18000, image: "https://images.pexels.com/photos/1352270/pexels-photo-1352270.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 5,
      name: "Korzinka",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Korzinka_logo.svg",
      menu: [
        { id: 501, name: "Non (1 dona)", price: 3000, image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 502, name: "Sut (1L)", price: 12000, image: "https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 503, name: "Tuxum (10 ta)", price: 15000, image: "https://images.pexels.com/photos/162712/egg-eggshell-protein-food-162712.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 6,
      name: "Chopar Pizza",
      logo: "https://static.tildacdn.com/tild3864-3935-4665-b837-343230396133/choparlogo.svg",
      menu: [
        { id: 601, name: "Chopar Special", price: 55000, image: "https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 602, name: "Pepperoni", price: 48000, image: "https://images.pexels.com/photos/280252/pexels-photo-280252.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 7,
      name: "FeedUp",
      logo: "https://feedup.uz/_nuxt/img/logo.2e4ff10.svg",
      menu: [
        { id: 701, name: "Doner", price: 28000, image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 702, name: "Shaurma", price: 25000, image: "https://images.pexels.com/photos/461326/pexels-photo-461326.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
    {
      id: 8,
      name: "Lavash House",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Lavash_House_logo.png",
      menu: [
        { id: 801, name: "Tandir Lavash", price: 22000, image: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 802, name: "Guruchli Lavash", price: 30000, image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
  ];

  try {
    localStorage.setItem('shops', JSON.stringify(defaultShops));
  } catch (e) {
    console.warn("localStorage ga yozib bo‘lmadi:", e);
  }
  return defaultShops;
};

export const saveShops = (shops) => {
  try {
    localStorage.setItem('shops', JSON.stringify(shops));
  } catch (e) {
    console.error("shops saqlashda xato:", e);
  }
};