// Shibuli digital electronics - Shop page logic
(function () {
  "use strict";
  const T = window.TECHHUB;
  const S = T.store;
  const $ = (s) => document.querySelector(s);

  const state = {
    q: new URLSearchParams(location.search).get("q") || "",
    cat: new URLSearchParams(location.search).get("cat") || "",
    sort: new URLSearchParams(location.search).get("sort") || "popular",
  };

  function buildCategoryFilter() {
    const wrap = $("#cat-filter");
    const counts = {};
    T.PRODUCTS.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    let html = `<button data-cat="" class="${!state.cat ? "active" : ""}">All Products <span class="count">${T.PRODUCTS.length}</span></button>`;
    html += T.CATEGORIES.map(
      (c) => `<button data-cat="${c.id}" class="${state.cat === c.id ? "active" : ""}">
        ${c.icon} ${c.name} <span class="count">${counts[c.id] || 0}</span>
      </button>`
    ).join("");
    wrap.innerHTML = html;
    wrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.cat = btn.getAttribute("data-cat");
        syncUrl();
        buildCategoryFilter();
        render();
      });
    });
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.cat) params.set("cat", state.cat);
    if (state.sort && state.sort !== "popular") params.set("sort", state.sort);
    const qs = params.toString();
    history.replaceState(null, "", qs ? `shop.html?${qs}` : "shop.html");
  }

  function applyFilters() {
    let list = T.PRODUCTS.slice();
    if (state.cat) list = list.filter((p) => p.category === state.cat);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.short.toLowerCase().includes(q)
      );
    }
    switch (state.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "discount": list.sort((a, b) => disc(b) - disc(a)); break;
      default: list.sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }

  function disc(p) {
    return p.oldPrice ? (1 - p.price / p.oldPrice) : 0;
  }

  function render() {
    const grid = $("#shop-grid");
    const list = applyFilters();
    $("#result-count").textContent = `${list.length} product${list.length !== 1 ? "s" : ""}${state.cat ? " in " + catName(state.cat) : ""}${state.q ? ` for "${state.q}"` : ""}`;

    if (!list.length) {
      grid.innerHTML = `<div class="no-results">
        <div class="ic"><i class="fas fa-magnifying-glass"></i></div>
        <h3>No products found</h3>
        <p>Try a different search or clear the filters.</p>
        <button class="btn btn-outline" id="reset-now" style="margin-top:14px">Clear filters</button>
      </div>`;
      const r = $("#reset-now");
      if (r) r.addEventListener("click", clearAll);
      return;
    }
    grid.innerHTML = list.map((p) => S.productCardHTML(p)).join("");
  }

  function catName(id) {
    const c = T.CATEGORIES.find((x) => x.id === id);
    return c ? c.name : id;
  }

  function clearAll() {
    state.q = "";
    state.cat = "";
    state.sort = "popular";
    $("#sort").value = "popular";
    syncUrl();
    buildCategoryFilter();
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Sync sort select
    $("#sort").value = state.sort;
    $("#sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      syncUrl();
      render();
    });

    // Mobile filter toggle
    $("#mobile-filter").addEventListener("click", () => $("#shop-sidebar").classList.toggle("open"));
    $("#clear-filters").addEventListener("click", clearAll);

    buildCategoryFilter();
    render();
  });
})();
