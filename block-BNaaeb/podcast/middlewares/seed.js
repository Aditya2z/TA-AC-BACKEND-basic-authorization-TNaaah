const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // For hashing the password
const User = require("../models/user"); // Replace with the actual path to your User model

// Function to seed admin user
async function seedAdmin() {
  try {
    // Check if an admin user already exists (optional)
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seeding.");
    } else {
      // Create a new admin user
      const adminData = {
        name: "Admin User",
        email: "admin@example.com",
        password: "adminPassword",
        isAdmin: true,
        membership: "premium",
      };

      // Save the admin user to the database
      const adminUser = new User(adminData);
      await adminUser.save();
      console.log("Admin user seeded successfully.");
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  }
}

module.exports = seedAdmin;
