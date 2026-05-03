# Bagasse Packaging Website

A static B2B website built for a bagasse packaging company. The site presents company information and product data through a lightweight frontend, with product content managed through a headless CMS.

The project uses a Jamstack-style structure, where the frontend is separated from the content management system. Product information is stored in a structured JSON file and can be updated through Decap CMS without editing the source code directly.

## Tech Stack and Tools

- **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS
- **Build tool:** Vite
- **Content management:** DecapBridge
- **Hosting and deployment:** Netlify, GitHub

## Architecture and Features

- **Headless CMS integration**  
  DecapBridge is used to provide an admin area for managing product content. Product updates are written to a central `products.json` file, allowing products to be added, edited or removed through the CMS.

- **Separated product data**  
  Product information is stored separately from the page structure in JSON format. Vanilla JavaScript fetches this data and renders the product sections on the client side.

- **Vite build setup**  
  Vite is used for local development and production builds. It provides a faster development workflow and creates an optimised build for deployment.

- **Tailwind CSS styling**  
  Tailwind CSS is used to build the site layout and reusable styling directly in the markup, while keeping the final production CSS smaller through unused style removal.

- **Netlify deployment workflow**  
  The site is deployed through Netlify. Updates pushed to the GitHub repository or content changes made through the CMS, can trigger a new build and deployment.
