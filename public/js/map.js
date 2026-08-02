const listingDataElement = document.getElementById("listing-data");

if (listingDataElement) {
    const listing = JSON.parse(listingDataElement.textContent);

    console.log("Listing received by map.js:", listing);

    const latitude = Number(listing.latitude);
    const longitude = Number(listing.longitude);

    if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
    ) {
        const map = L.map("map").setView(
            [latitude, longitude],
            13
        );

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
            }
        ).addTo(map);

        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(listing.title)
            .openPopup();

    } else {
        console.error(
            "Latitude or longitude is missing:",
            listing
        );
    }
}