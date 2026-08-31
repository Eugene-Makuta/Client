// Shibuli digital electronics - Product detail page
(function () {
  "use strict";
  const T = window.TECHHUB;
  const S = T.store;
  const $ = (s) => document.querySelector(s);

  function getId() {
    return new URLSearchParams(location.search).get("id");
  }

  function related(p) {
    return T.PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  }

  function render(p) {
    const root = $("#product-root");
    const cat = T.CATEGORIES.find((c) => c.id === p.category);
    const catName = cat ? cat.name : p.category;
    const inStock = p.stock > 0;
    const old = p.oldPrice ? `<span class="old-price">${S.formatKES(p.oldPrice)}</span>` : "";
    const specs = Object.entries(p.specs)
      .map(([k, v]) => `<div class="row"><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");

    // Use the same image for the gallery thumbnails (visual variety via zoom)
    const imgs = [p.image, p.image, p.image, p.image];

    $("#breadcrumb").innerHTML = `<a href="index.html">Home</a><i class="fas fa-chevron-right"></i>
      <a href="shop.html?cat=${p.category}">${catName}</a><i class="fas fa-chevron-right"></i><span>${p.name}</span>`;

    root.innerHTML = `
      <div class="pd-layout">
        <div class="pd-gallery">
          <div class="pd-main-img">
            <img id="pd-main" src="${p.image}" alt="${p.name}" onerror="TechHub.store.handleImgError(this,'${p.name.replace(/'/g, "")}')" />
          </div>
          <div class="pd-thumbs">
            ${imgs
              .map(
                (src, i) =>
                  `<div class="thumb ${i === 0 ? "active" : ""}" data-src="${src}"><img src="${src}" alt="" onerror="TechHub.store.handleImgError(this,'${p.name.replace(/'/g, "")}')" /></div>`
              )
              .join("")}
          </div>
        </div>

        <div class="pd-info">
          <span class="product-cat">${catName}</span>
          <h1>${p.name}</h1>
          <div class="rating"><span class="stars">${S.starsHTML(p.rating)}</span><span>${p.rating} · ${p.reviews} reviews</span></div>
          <div class="pd-price"><span class="price">${S.formatKES(p.price)}</span>${old}</div>
          <div class="pd-stock ${inStock ? "" : "out"}">
            <i class="fas ${inStock ? "fa-circle-check" : "fa-circle-xmark"}"></i>
            ${inStock ? `In Stock (${p.stock} available)` : "Out of Stock"}
          </div>
          <p class="pd-desc">${p.description}</p>

          <div class="specs">${specs}</div>

          <div class="qty-row">
            <div class="qty">
              <button id="qty-minus" aria-label="Decrease"><i class="fas fa-minus"></i></button>
              <input id="qty-input" type="number" value="1" min="1" ${inStock ? "" : "disabled"} />
              <button id="qty-plus" aria-label="Increase"><i class="fas fa-plus"></i></button>
            </div>
            <span style="color:var(--muted);font-size:0.9rem">Quantity</span>
          </div>

          <div class="pd-actions">
            <button class="btn btn-primary btn-lg" id="add-btn" ${inStock ? "" : "disabled"}>
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
            <button class="btn btn-accent btn-lg" id="buy-btn" ${inStock ? "" : "disabled"}>
              <i class="fas fa-bolt"></i> Buy Now
            </button>
          </div>
          <p style="color:var(--muted);font-size:0.85rem;margin-top:16px">
            <i class="fas fa-truck-fast"></i> Free delivery · <i class="fas fa-shield-halved"></i> 2-year warranty · <i class="fas fa-rotate-left"></i> 7-day returns
          </p>
        </div>
      </div>

      <div style="margin-top:64px">
        <div class="section-head" style="margin-bottom:28px">
          <span class="eyebrow">You may also like</span>
          <h2>Related Products</h2>
        </div>
        <div class="product-grid" id="related-grid"></div>
      </div>
    `;

    // Quantity controls
    const qtyInput = $("#qty-input");
    $("#qty-minus").addEventListener("click", () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    $("#qty-plus").addEventListener("click", () => {
      qtyInput.value = Math.min(p.stock || 99, (parseInt(qtyInput.value, 10) || 1) + 1);
    });

    // Thumbnail switching (scrolls to zoom target by swapping src)
    root.querySelectorAll(".thumb").forEach((th) => {
      th.addEventListener("click", () => {
        root.querySelectorAll(".thumb").forEach((x) => x.classList.remove("active"));
        th.classList.add("active");
        $("#pd-main").src = th.getAttribute("data-src");
      });
    });

    // Add to cart
    const addBtn = $("#add-btn");
    if (addBtn)
      addBtn.addEventListener("click", () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        S.addToCart(p.id, qty);
      });

    // Buy now -> add and go to checkout
    const buyBtn = $("#buy-btn");
    if (buyBtn)
      buyBtn.addEventListener("click", () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        S.addToCart(p.id, qty);
        window.location.href = "checkout.html";
      });

    // Related
    const rel = related(p);
    $("#related-grid").innerHTML = rel.length
      ? rel.map((x) => S.productCardHTML(x)).join("")
      : `<p style="color:var(--muted)">No related products yet.</p>`;

    document.title = `${p.name} — Shibuli digital electronics`;
  }

  function renderNotFound() {
    $("#product-root").innerHTML = `<div class="no-results">
      <div class="ic"><i class="fas fa-box-open"></i></div>
      <h3>Product not found</h3>
      <p>The product you're looking for doesn't exist.</p>
      <a href="shop.html" class="btn btn-outline" style="margin-top:14px">Back to Shop</a>
    </div>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const id = getId();
    const p = id && S.getProduct(id);
    if (p) render(p);
    else renderNotFound();
  });
})();
