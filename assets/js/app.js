import { contact, inspirations, loopCopy } from "./data/content.js";
import { cityWalks, hotDestinations, placesByRegion } from "./data/places.js";
import { initContact } from "./modules/contact.js";
import { initInspiration } from "./modules/inspiration.js";
import { initLoop } from "./modules/loop.js";
import { initMenu } from "./modules/menu.js";
import { initThemes } from "./modules/themes.js";
import { initRecommendations } from "./modules/recommendations.js";
import { initTravelLab } from "./modules/travelLab.js";
import { initPet } from "./modules/pet.js";
import { initReveal } from "./modules/reveal.js";

initMenu();
initThemes("neon");
initInspiration(inspirations);
initLoop(loopCopy);
initTravelLab(placesByRegion);
initRecommendations({ hotDestinations, cityWalks });
initContact(contact.email);
initPet();
initReveal();

document.querySelector("#year").textContent = new Date().getFullYear();
