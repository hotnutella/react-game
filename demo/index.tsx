import { render } from "../src/index";
import { DemoGame } from "./components";

// Mount the app using pure ReactGame - NO React DOM!
const container = document.getElementById("root");
if (container) {
  console.log("Container found, setting up demo...");

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = "2px solid #444";
  canvas.style.backgroundColor = "#000";
  container.appendChild(canvas);

  console.log("Canvas created, about to render...");

  try {
    // Use ReactGame's render function instead of ReactDOM
    render(<DemoGame />, canvas);
    console.log("Render function completed successfully");
  } catch (error) {
    console.error("Error during render:", error);
  }

  // Signal that the page has finished loading
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => {
        console.log("ReactGame Demo: Fully loaded and ready");
      })
    : console.log("ReactGame Demo: Fully loaded and ready");
} else {
  console.error("Root container not found");
}
