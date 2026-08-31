// Shibuli digital electronics - Checkout page script: build order details and submit to Web3Forms
(function () {
  "use strict";
  const T = window.TECHHUB || (window.TECHHUB = {});
  const S = T.store || {};

  function buildOrderPayload() {
    const cart = (S.getCart && S.getCart()) || [];
    const items = cart
      .map((it) => {
        const p = S.getProduct ? S.getProduct(it.id) : null;
        if (!p) return null;
        const line = p.price * it.qty;
        return { id: p.id, name: p.name, qty: it.qty, price: p.price, lineTotal: line };
      })
      .filter(Boolean);
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    return { items, subtotal, items_count: items.reduce((s, i) => s + i.qty, 0) };
  }

  function formatOrderText(payload, customer) {
    const lines = [];
    lines.push("New Electronics Shop Order", "");
    lines.push(`Name: ${customer.name || ""}`);
    lines.push(`Phone: ${customer.phone || ""}`);
    lines.push(`Email: ${customer.email || ""}`);
    lines.push(`Location: ${customer.location || ""}`, "");
    lines.push("ORDER:");
    payload.items.forEach((it) => {
      lines.push(`${it.name} x ${it.qty} - ${S.formatKES ? S.formatKES(it.lineTotal) : it.lineTotal}`);
    });
    lines.push("", `Total: ${S.formatKES ? S.formatKES(payload.subtotal) : payload.subtotal}`);
    return lines.join("\n");
  }

  function renderSummaryList(payload) {
    const list = document.getElementById("orderSummaryList");
    const totalEl = document.getElementById("summaryTotal");
    if (!list || !totalEl) return;
    if (!payload.items.length) {
      list.innerHTML = '<p style="color:var(--muted)">Your cart is empty.</p>';
      totalEl.textContent = S.formatKES ? S.formatKES(0) : "KSh 0";
      return;
    }
    list.innerHTML = payload.items
      .map((it) => `<div class="order-line"><span>${it.name} x ${it.qty}</span><span>${S.formatKES ? S.formatKES(it.lineTotal) : it.lineTotal}</span></div>`)
      .join("");
    totalEl.textContent = S.formatKES ? S.formatKES(payload.subtotal) : payload.subtotal;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const orderTextarea = document.getElementById("orderDetails");
    const subtotalInput = document.getElementById("subtotal");
    const itemsCountInput = document.getElementById("items_count");

    function refresh() {
      const payload = buildOrderPayload();
      const dummyCustomer = { name: "", phone: "", email: "", location: "" };
      const orderText = formatOrderText(payload, dummyCustomer);
      if (orderTextarea) orderTextarea.value = orderText;
      if (subtotalInput) subtotalInput.value = payload.subtotal;
      if (itemsCountInput) itemsCountInput.value = payload.items_count;
      renderSummaryList(payload);
    }

    refresh();

    const editBtn = document.getElementById("editCartBtn");
    if (editBtn) editBtn.addEventListener("click", () => (window.location.href = "shop.html"));

    const form = document.getElementById("checkoutForm");
    const submitBtn = document.getElementById("placeOrderBtn");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submitBtn) submitBtn.disabled = true;

      const customer = {
        name: (form.querySelector('input[name="name"]') || {}).value || "",
        phone: (form.querySelector('input[name="phone"]') || {}).value || "",
        email: (form.querySelector('input[name="email"]') || {}).value || "",
        location: (form.querySelector('input[name="location"]') || {}).value || "",
      };

      const latest = buildOrderPayload();
      const messageBody = formatOrderText(latest, customer);

      if (orderTextarea) orderTextarea.value = messageBody;
      if (subtotalInput) subtotalInput.value = latest.subtotal;
      if (itemsCountInput) itemsCountInput.value = latest.items_count;

      const fd = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
        mode: "cors",
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success) {
            S.toast && S.toast("Order placed — confirmation sent by email.", "success");
            S.clearCart && S.clearCart();
            S.updateCartCount && S.updateCartCount();
            setTimeout(() => (window.location.href = "index.html"), 1600);
          } else {
            S.toast && S.toast(data.message || "Failed to place order.", "error");
            if (submitBtn) submitBtn.disabled = false;
          }
        })
        .catch((err) => {
          console.error(err);
          S.toast && S.toast("Network error sending order. Try again later.", "error");
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
})();
