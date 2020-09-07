const AdminBro = require("admin-bro");
const AdminBroExpress = require("admin-bro-expressjs");
const AdminBroMongoose = require("admin-bro-mongoose");

const User = require("../models/user");
const Keys = require("../models/sharpshooterkeys");
const SharpShooterGlobalKeys = require("../models/SharpShooterGlobalkey");
const InceptionKeys = require("../models/inceptionKey");
const GoCheatKeys = require("../models/goCheatKey");
const keysPricing = require("../models/keyPricing");
const keysTransaction = require("../models/keysTransaction");
const paymentTransaction = require("../models/paymentTransaction");
const coupons = require("../models/couponPrice");
AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro({
  rootPath: "/admin56324513comp752ad2",
  resources: [
    User,
    Keys,
    SharpShooterGlobalKeys,
    InceptionKeys,
    GoCheatKeys,
    keysPricing,
    keysTransaction,
    coupons,
    paymentTransaction
  ],
  branding: {
    companyName: "Birocheats|| Admin-Panel",
    softwareBrothers: false
  }
});

const ADMIN = {
  email: process.env.ADMIN_EMAIL || "abc@gmail.com",
  password: process.env.ADMIN_PASSWORD || "123"
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  cookieName: "admin",
  cookiePassword: "sadasdasdasda",
  authenticate: async (email, password) => {
    if (email === ADMIN.email && password === ADMIN.password) {
      return ADMIN;
    }
    return null;
  }
});

module.exports = adminRouter = AdminBroExpress.buildRouter(adminBro);
