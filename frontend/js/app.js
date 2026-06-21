// Frontend JavaScript
console.log("app.js loaded");
const propertyContainer = document.getElementById("property-container");

async function fetchProperties(){
  try {
    const response = await fetch(
      "http://localhost:4000/api/property/all"
    );

    const data = await response.json();

    console.log(data); // IMPORTANT

    data.properties.forEach((property) => {
      const card = document.createElement("div");

      card.classList.add("card");

      card.innerHTML = `
        <h3>${property.title}</h3>
        <p>📍 ${property.location}</p>
        <p>💰 ₹${property.price}</p>
        <button>View Details</button>
      `;

      propertyContainer.appendChild(card);
    });
  } catch (error) {
    console.log(error);
  }
}

fetchProperties();
