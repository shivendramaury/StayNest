const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// MongoDB Atlas URI
const MONGO_URL =
  "mongodb+srv://shivendramaury_db_user:Shiv123@cluster0.jbtfuch.mongodb.net/StayNest?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to Atlas");

    await initDB();

    console.log("Data was initialized");

    mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
}

const initDB = async () => {
  // Delete old data
  await Listing.deleteMany({});

  // Add owner field to every listing
  const data = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("6a71fb720d14c0889d4dd134"),
  }));

  // Insert into Atlas
  await Listing.insertMany(data);
};

main();