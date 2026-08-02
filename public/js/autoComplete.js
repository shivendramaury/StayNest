const locationInput = document.getElementById("location");

const suggestionsBox = document.getElementById(
    "location-suggestions"
);

let debounceTimer;

locationInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    const query = locationInput.value.trim();

    if (query.length < 3) {
        suggestionsBox.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch location suggestions");
            }

            const data = await response.json();

            suggestionsBox.innerHTML = "";

            data.features.forEach((place) => {
                const properties = place.properties;

                const locationName = [
                    properties.name,
                    properties.city,
                    properties.state,
                    properties.country
                ]
                    .filter(Boolean)
                    .join(", ");

                const suggestion = document.createElement("div");

                suggestion.classList.add("location-suggestion");

                suggestion.textContent = locationName;

                suggestion.addEventListener("click", () => {
                    locationInput.value = locationName;

                    suggestionsBox.innerHTML = "";
                });

                suggestionsBox.appendChild(suggestion);
            });

        } catch (error) {
            console.error(
                "Error fetching locations:",
                error
            );

            suggestionsBox.innerHTML = "";
        }
    }, 500);
});