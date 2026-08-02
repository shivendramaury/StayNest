const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateCoordinates() {
    try{
        await mongoose.connect(MONGO_URL);
        console.log("Database connected");

        const listings = await Listing.find();

        for(const listing of listings) {
            if(
                Number.isFinite(listing.latitude) &&
                Number.isFinite(listing.longitude)
            ){
                console.log('Skipped: ${listing.title');
                continue;
            }

            const address = `${listing.location}, ${listing.country}`;

            try{
                console.log(`Searching: ${address}`);

                const response = await axios.get(
                    "https://nominatim.openstreetmap.org/search",
                    {
                        params: {
                            q: address,
                            format: "json",
                            limit: 1,
                            addressdetails: 1,
                        },
                        headers: {
                            "User-Agent": "WanderlustProject/1.0 shivendramaury@gmail.com",
                            "Accept-Language": "en"
                        }

                    }
                );

                if(response.data.length === 0){
                    console.log(`Location not found: ${address}`);
                    continue;
                }

                listing.latitude = Number(response.data[0].lat);
                listing.longitude = Number(response.data[0].lon);

                await listing.save();

                console.log(
                    `Updated: ${listing.title} (${listing.latitude}, ${listing.longitude})`
                );

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            catch(err) {
                console.log(`Error updating ${listing.title}`);
                console.log(err.message);
            }
        }
        console.log("\n All possible listing updated.");
        mongoose.connection.close();
    }

    catch(err){
        console.log(err);
    }
}

updateCoordinates();