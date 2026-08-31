// Shibuli digital electronics - Home page rendering
(function () {
  "use strict";
  const T = window.TECHHUB;
  const S = T.store;
  const $ = (s) => document.querySelector(s);

  function renderCategories() {
    const grid = $("#categories-grid");
    if (!grid) return;
    grid.innerHTML = T.CATEGORIES.map((c) => {
      const count = T.PRODUCTS.filter((p) => p.category === c.id).length;
      return `<a class="cat-card" href="shop.html?cat=${c.id}">
        <div class="ic">${c.icon}</div>
        <h4>${c.name}</h4>
        <small>${count} items</small>
      </a>`;
    }).join("");
  }

  function renderFeatures() {
    const grid = $("#features-grid");
    if (!grid) return;
    const features = [
      { ic: "fa-truck-fast", t: "Fast Delivery", d: "Same-day dispatch in Nairobi and 1-3 days countrywide." },
      { ic: "fa-shield-halved", t: "2-Year Warranty", d: "Every device backed by our comprehensive warranty." },
      { ic: "fa-tag", t: "Best Prices", d: "We negotiate hard so you get unbeatable value." },
      { ic: "fa-headset", t: "24/7 Support", d: "Friendly experts ready to help before and after sale." },
    ];
    grid.innerHTML = features
      .map(
        (f) => `<div class="feature">
        <div class="ic"><i class="fas ${f.ic}"></i></div>
        <h4>${f.t}</h4>
        <p>${f.d}</p>
      </div>`
      )
      .join("");
  }

  function renderTestimonials() {
    const grid = $("#testimonials-grid");
    if (!grid) return;
    const items = [
      { n: "Aisha M.", r: "Nairobi", s: 5, q: "Got my iPhone 16 in a day. Packaging was perfect and price beat every shop I checked. Highly recommend Shibuli!" },
      { n: "Brian O.", r: "Mombasa", s: 5, q: "Bought a Dell Latitude for my business. Smooth process, great support and zero hassle with delivery." },
      { n: "Faith K.", r: "Kisumu", s: 4, q: "The Sony headphones are amazing. Website was easy to use and checkout with M-Pesa was instant." },
      { n: "David W.", r: "Eldoret", s: 5, q: "Shibuli is now my go-to for gadgets. Transparent pricing and genuine products every time." },
      { n: "Mercy N.", r: "Nakuru", s: 5, q: "Excellent service! Had a question at 10pm and the support team replied immediately. Wow." },
      { n: "Kevin L.", r: "Thika", s: 4, q: "Purchased a 55-inch Samsung TV. Arrived well protected and the picture quality is stunning." },
    ];
    grid.innerHTML = items
      .map(
        (t) => `<div class="testimonial">
        <div class="stars">${S.starsHTML(t.s)}</div>
        <p>"${t.q}"</p>
        <div class="who">
          <div class="avatar">${t.n.charAt(0)}</div>
          <div><b>${t.n}</b><small>${t.r}</small></div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderProducts() {
    const featured = T.PRODUCTS.slice(0, 4);
    const best = [...T.PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
    const offers = T.PRODUCTS.filter((p) => p.oldPrice).slice(0, 4);

    const fg = $("#featured-grid");
    const bg = $("#bestsellers-grid");
    const og = $("#offers-grid");
    if (fg) fg.innerHTML = featured.map((p) => S.productCardHTML(p)).join("");
    if (bg) bg.innerHTML = best.map((p) => S.productCardHTML(p)).join("");
    if (og) og.innerHTML = offers.map((p) => S.productCardHTML(p)).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    renderFeatures();
    renderTestimonials();
    renderProducts();
  });
})();
