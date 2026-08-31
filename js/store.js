// Shibuli digital electronics - Shared utilities: cart, localStorage, toast, UI helpers
(function () {
  "use strict";

  const STORAGE_KEY = "shibuli_cart_v1";
  const T = window.TECHHUB || (window.TECHHUB = {});

  /* ----------------------------- Formatting ----------------------------- */
  function formatKES(amount) {
    return "KSh " + Math.round(amount).toLocaleString("en-KE");
  }

  function getProduct(id) {
    return (T.PRODUCTS || []).find((p) => p.id === id);
  }

  function starsHTML(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let out = "";
    for (let i = 0; i < 5; i++) {
      if (i < full) out += '<i class="fas fa-star"></i>';
      else if (i === full && half) out += '<i class="fas fa-star-half-alt"></i>';
      else out += '<i class="far fa-star"></i>';
    }
    return out;
  }

  /* ------------------------------ Cart core ------------------------------ */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function cartSubtotal() {
    return getCart().reduce((sum, item) => {
      const p = getProduct(item.id);
      return p ? sum + p.price * item.qty : sum;
    }, 0);
  }

  function addToCart(id, qty = 1) {
    const cart = getCart();
    const existing = cart.find((i) => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, qty });
    saveCart(cart);
    const p = getProduct(id);
    if (p) {
      toast(`${p.name} added to cart.`, "success");
      bumpCartIcon();
    }
  }

  // Global delegation so any [data-add] button across pages works
  function initAddButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      e.preventDefault();
      addToCart(btn.getAttribute("data-add"), 1);
    });
  }

  function setQty(id, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) removeFromCart(id, false);
    else saveCart(cart);
  }

  function removeFromCart(id, notify = true) {
    let cart = getCart().filter((i) => i.id !== id);
    saveCart(cart);
    if (notify) toast("Item removed from cart.", "info");
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    updateCartCount();
  }

  /* ------------------------------- UI bits ------------------------------- */
  function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const count = cartCount();
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  }

  function bumpCartIcon() {
    const ic = document.getElementById("cart-icon");
    if (!ic) return;
    ic.classList.remove("bump");
    // force reflow
    void ic.offsetWidth;
    ic.classList.add("bump");
  }

  let toastTimer;
  function toast(message, type = "info") {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    const icon =
      type === "success"
        ? "fa-check-circle"
        : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle";
    el.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  // Generates an inline SVG placeholder for products whose image fails to load
  function placeholder(label) {
    const text = (label || "Shibuli").slice(0, 16);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#1e293b'/><stop offset='1' stop-color='#2563eb'/>
      </linearGradient></defs>
      <rect width='600' height='600' fill='url(#g)'/>
      <text x='50%' y='52%' fill='#fff' font-family='Arial' font-size='42' font-weight='700' text-anchor='middle'>${text}</text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function handleImgError(img, label) {
    img.onerror = null;
    img.src = placeholder(label);
  }

  // Renders a product card used on home + shop pages
  function productCardHTML(p) {
    const cat = (T.CATEGORIES || []).find((c) => c.id === p.category);
    const catName = cat ? cat.name : p.category;
    const badgeClass = /new/i.test(p.badge || "")
      ? "new"
      : /hot/i.test(p.badge || "")
      ? "hot"
      : /value|budget/i.test(p.badge || "")
      ? "value"
      : "";
    const badge = p.badge
      ? `<span class="badge ${badgeClass}">${p.badge}</span>`
      : p.oldPrice
      ? `<span class="badge">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`
      : "";
    const old = p.oldPrice
      ? `<span class="old-price">${formatKES(p.oldPrice)}</span>`
      : "";
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media">
          <a href="product.html?id=${p.id}">${badge}</a>
          <a href="product.html?id=${p.id}" class="product-wish" title="Quick view"><i class="far fa-heart"></i></a>
          <a href="product.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="TechHub.store.handleImgError(this,'${p.name.replace(/'/g, "")}')" />
          </a>
        </div>
        <div class="product-body">
          <span class="product-cat">${catName}</span>
          <a href="product.html?id=${p.id}" class="product-name">${p.name}</a>
          <div class="rating">
            <span class="stars">${starsHTML(p.rating)}</span>
            <span>(${p.reviews})</span>
          </div>
          <div class="price-row">
            <span class="price">${formatKES(p.price)}</span>
            ${old}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" data-add="${p.id}"><i class="fas fa-cart-plus"></i> Add</button>
            <a href="product.html?id=${p.id}" class="btn btn-ghost">Details</a>
          </div>
        </div>
      </article>`;
  }

  /* --------------------------- Navigation UI ----------------------------- */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("open");
        menu.classList.toggle("open");
      });
    }
    // Close mobile menu when a link is clicked
    document.querySelectorAll(".nav-menu a").forEach((a) => {
      a.addEventListener("click", () => {
        if (menu) menu.classList.remove("open");
        if (toggle) toggle.classList.remove("open");
      });
    });

    // Sticky shadow on scroll
    const header = document.querySelector(".site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Search form -> shop page
    document.querySelectorAll("form[data-search]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        const q = input ? encodeURIComponent(input.value.trim()) : "";
        window.location.href = `shop.html?q=${q}`;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initAddButtons();
    updateCartCount();
  });

  // Expose API
  T.store = {
    formatKES,
    getProduct,
    starsHTML,
    productCardHTML,
    getCart,
    saveCart,
    cartCount,
    cartSubtotal,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    updateCartCount,
    toast,
    handleImgError,
    placeholder,
  };

  // Backwards-compatibility: some templates use `TechHub` (mixed case)
  // Ensure both globals point to the same object so inline handlers work.
  window.TechHub = window.TechHub || window.TECHHUB;
})();
