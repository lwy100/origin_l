import { contact, inspirations, loopCopy, quoteCollections } from "./data/content.js?v=20260714-6";
import { cityWalks, hotDestinations, placesByRegion } from "./data/places.js?v=20260714-6";
import { initContact } from "./modules/contact.js?v=20260714-6";
import { initInspiration } from "./modules/inspiration.js?v=20260714-6";
import { initLoop } from "./modules/loop.js?v=20260714-6";
import { initMenu } from "./modules/menu.js?v=20260714-6";
import { initThemes } from "./modules/themes.js?v=20260714-6";
import { initRecommendations } from "./modules/recommendations.js?v=20260714-6";
import { initTravelLab } from "./modules/travelLab.js?v=20260714-6";
import { initPet } from "./modules/pet.js?v=20260714-6";
import { initReveal } from "./modules/reveal.js?v=20260714-6";
import { initQuotes } from "./modules/quotes.js?v=20260714-6";
import { authApi } from "./modules/supabase.js?v=20260714-6";

await authApi.initialize();

initMenu();
initThemes("neon");
initInspiration(inspirations);
initLoop(loopCopy);
initTravelLab(placesByRegion);
initRecommendations({ hotDestinations, cityWalks });
initContact(contact.email);
initPet();
initQuotes(quoteCollections);
initReveal();

document.querySelector("#year").textContent = new Date().getFullYear();
