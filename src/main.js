import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))


// Function for injecting header and footer partials
const loadHtml = async (selector, url) => {
  const element = document.querySelector(selector);
  if (element) {
    const response = await fetch(url);
    if (response.ok) {
      const text = await response.text();
      element.innerHTML = text;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadHtml("#header-placeholder", "/partials/_header.html");
  loadHtml("#footer-placeholder", "/partials/_footer.html");
});
