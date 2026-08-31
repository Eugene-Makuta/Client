// Shibuli digital electronics - Cart page logic
(function () {
  "use strict";
  const T = window.TECHHUB;
  const S = T.store;
  const $ = (s) => document.querySelector(s);

  function cartItems() {
    return S.getCart()
      .map((i) => ({ product: S.getProduct(i.id), qty: i.qty }))
      .filter((i) => i.product);
  }

  function render() {
    const items = cartItems();
    const wrap = $("#cart-items");
    const summaryBox = $("#cart-summary-box");

    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">
        <div class="ic"><i class="fas fa-cart-shopping"></i></div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet. Let's fix that!</p>
        <a href="shop.html" class="btn btn-primary" style="margin-top:14px"><i class="fas fa-bag-shopping"></i> Browse Products</a>
      </div>`;
      summaryBox.style.display = "none";
      return;
    }
    summaryBox.style.display = "";

    wrap.innerHTML = items
      .map(({ product: p, qty }) => {
        const line = p.price * qty;
        return `<div class="cart-row" data-id="${p.id}">
          <a class="thumb" href="product.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}" onerror="TechHub.store.handleImgError(this,'${p.name.replace(/'/g, "")}')" />
          </a>
          <div>
            <a href="product.html?id=${p.id}" class="name">${p.name}</a>
            <div class="meta">${S.formatKES(p.price)} each</div>
            <div class="qty" style="margin-top:10px">
              <button class="q-minus" aria-label="Decrease"><i class="fas fa-minus"></i></button>
              <input type="number" value="${qty}" min="1" max="${p.stock || 99}" />
              <button class="q-plus" aria-label="Increase"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          <div class="right">
            <span class="line-price">${S.formatKES(line)}</span>
            <button class="remove" data-remove="${p.id}"><i class="fas fa-trash"></i> Remove</button>
          </div>
        </div>`;
      })
      .join("");

    renderSummary(items);

    // Wire controls
    wrap.querySelectorAll(".cart-row").forEach((row) => {
      const id = row.getAttribute("data-id");
      const p = S.getProduct(id);
      const input = row.querySelector("input");

      row.querySelector(".q-minus").addEventListener("click", () => {
        S.setQty(id, Math.max(1, (parseInt(input.value, 10) || 1) - 1));
        render();
      });
      row.querySelector(".q-plus").addEventListener("click", () => {
        S.setQty(id, Math.min(p.stock || 99, (parseInt(input.value, 10) || 1) + 1));
        render();
      });
      input.addEventListener("change", () => {
        let v = parseInt(input.value, 10) || 1;
        v = Math.max(1, Math.min(p.stock || 99, v));
        S.setQty(id, v);
        render();
      });
      row.querySelector("[data-remove]").addEventListener("click", () => {
        S.removeFromCart(id);
        render();
      });
    });
  }

  function renderSummary(items) {
    const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
    const shipping = subtotal >= 15000 || subtotal === 0 ? 0 : 500;
    const total = subtotal + shipping;
    const count = items.reduce((s, i) => s + i.qty, 0);

    $("#summary-body").innerHTML = `
      <div class="summary-row"><span>Items (${count})</span><span class="val">${S.formatKES(subtotal)}</span></div>
      <div class="summary-row"><span>Delivery</span><span class="val">${shipping === 0 ? "Free" : S.formatKES(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${S.formatKES(total)}</span></div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#clear-cart").addEventListener("click", () => {
      if (!S.getCart().length) return;
      if (confirm("Remove all items from your cart?")) {
        S.clearCart();
        S.toast("Cart cleared.", "info");
        render();
      }
    });
    render();
  });
})();
