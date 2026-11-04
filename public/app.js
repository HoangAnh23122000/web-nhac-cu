"use strict";

// ==== Trạng thái ứng dụng ====
const CART_KEY = "mocMusicCart";
const MAX_QUANTITY = 99;

const state = {
  products: [],
  categories: [],
  shipping: { threshold: 2000000, fee: 30000 },
  user: null,
  cart: loadCart(),
  filters: { category: "", brand: "", q: "", sort: "featured" },
  afterLogin: null,
  adminProducts: []
};

const $ = (selector) => document.querySelector(selector);
const app = $("#app");
const overlay = $("#overlay");
const cartDrawer = $("#cart-drawer");
const cartItems = $("#cart-items");
const cartSummary = $("#cart-summary");
const cartCount = $("#cart-count");
const accountModal = $("#account-modal");
const checkoutModal = $("#checkout-modal");
const adminModal = $("#admin-modal");
const accountContent = $("#account-content");
const checkoutContent = $("#checkout-content");
const adminModalContent = $("#admin-modal-content");
const mobileMenu = $("#mobile-menu");
const menuButton = $(".menu-button");
const toast = $("#toast");
const layers = [cartDrawer, accountModal, checkoutModal, adminModal];

let toastTimer;
let lastFocused = null;
let lastPage = null;
let routeToken = 0;
let pendingFocus = null;

// ==== Hàm tiện ích ====

// Mọi dữ liệu do người dùng nhập đều phải qua esc() trước khi đưa vào HTML, để chống chèn mã (XSS).
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatDate(value) {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

// Bỏ dấu tiếng Việt để tìm "trong" vẫn ra "Trống".
function normalize(value) {
  return String(value).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

async function api(path, { method = "GET", body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
    error.status = response.status;
    throw error;
  }
  return data;
}

// Khóa nút trong lúc gửi để khách không đặt trùng đơn, và hiển thị lỗi ngay trên biểu mẫu.
async function submitForm(form, work) {
  const button = form.querySelector('button[type="submit"]');
  const errorBox = form.querySelector(".form-error");
  if (errorBox) errorBox.textContent = "";
  if (button) button.disabled = true;
  try {
    await work();
  } catch (error) {
    if (errorBox) errorBox.textContent = error.message;
    else showToast(error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

function field(label, control, hint = "") {
  return `<div class="form-group"><label>${esc(label)}${control}</label>${hint ? `<small class="field-hint">${esc(hint)}</small>` : ""}</div>`;
}

const STATUS_CLASS = {
  "Chờ xác nhận": "status-waiting",
  "Đã xác nhận": "status-confirmed",
  "Đang giao": "status-shipping",
  "Hoàn thành": "status-done",
  "Đã hủy": "status-cancelled"
};

function statusPill(status) {
  return `<span class="status-pill ${STATUS_CLASS[status] || ""}">${esc(status)}</span>`;
}

// Điểm đánh giá: 4.3 -> "4,3"; sao làm tròn đến sao gần nhất.
function formatRating(value) {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
}

function stars(value) {
  const full = Math.round(value);
  return `<span class="stars" aria-hidden="true">${"★".repeat(full)}<span class="stars-empty">${"★".repeat(5 - full)}</span></span>`;
}

function getProduct(productId) {
  return state.products.find((product) => product.id === Number(productId));
}

// ==== Dữ liệu ====
async function loadCatalog() {
  const catalog = await api("/catalog");
  state.products = catalog.products;
  state.categories = catalog.categories;
  state.shipping = catalog.shipping;
  reconcileCart();
}

async function loadUser() {
  state.user = (await api("/auth/me")).user;
  updateUserUi();
}

function updateUserUi() {
  const isAdmin = state.user?.role === "admin";
  document.querySelectorAll("[data-admin-only]").forEach((element) => { element.hidden = !isAdmin; });
  // Đăng nhập hoặc đăng xuất khi đang xem sản phẩm thì khu vực đánh giá phải đổi theo.
  loadReviews();
}

// ==== Giỏ hàng ====

// localStorage có thể bị hỏng hoặc bị chặn, nên đọc phải an toàn và kiểm tra từng dòng.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => Number.isInteger(item?.productId) && Number.isInteger(item?.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  } catch {
    // Không lưu được thì giỏ hàng vẫn dùng được đến khi tải lại trang.
  }
}

// Bỏ sản phẩm đã ngừng bán và giảm số lượng về mức còn hàng.
function reconcileCart() {
  let changed = false;
  const items = [];
  for (const item of state.cart) {
    const product = getProduct(item.productId);
    const quantity = product ? Math.min(item.quantity, product.stock, MAX_QUANTITY) : 0;
    if (quantity !== item.quantity) changed = true;
    if (quantity > 0) items.push({ productId: item.productId, quantity });
  }
  state.cart = items;
  if (changed) {
    saveCart();
    showToast("Giỏ hàng đã được cập nhật theo tồn kho mới nhất.");
  }
  updateCart();
}

function addToCart(productId) {
  const product = getProduct(productId);
  if (!product) return;
  const item = state.cart.find((line) => line.productId === product.id);
  const current = item ? item.quantity : 0;
  if (current + 1 > Math.min(product.stock, MAX_QUANTITY)) {
    showToast(product.stock ? `"${product.name}" chỉ còn ${product.stock} sản phẩm.` : `"${product.name}" đã hết hàng.`);
    return;
  }
  if (item) item.quantity += 1;
  else state.cart.push({ productId: product.id, quantity: 1 });
  saveCart();
  updateCart();
  showToast("Đã thêm sản phẩm vào giỏ hàng");
}

function changeQuantity(productId, delta) {
  const product = getProduct(productId);
  const item = state.cart.find((line) => line.productId === Number(productId));
  if (!item || !product) return;
  const next = item.quantity + delta;
  if (next > Math.min(product.stock, MAX_QUANTITY)) {
    showToast(`"${product.name}" chỉ còn ${product.stock} sản phẩm.`);
    return;
  }
  if (next <= 0) state.cart = state.cart.filter((line) => line !== item);
  else item.quantity = next;
  saveCart();
  updateCart();
}

function cartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (getProduct(item.productId)?.price || 0) * item.quantity, 0);
  const shipping = subtotal >= state.shipping.threshold ? 0 : state.shipping.fee;
  return { subtotal, shipping, total: subtotal + shipping };
}

function updateCart() {
  cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="cart-empty"><div><span class="cart-empty-symbol">♫</span><strong>Giỏ hàng đang trống</strong><p>Hãy chọn một nhạc cụ bạn yêu thích nhé.</p><a class="button-dark" href="#products" data-close>Khám phá sản phẩm</a></div></div>`;
    cartSummary.innerHTML = "";
    return;
  }

  cartItems.innerHTML = state.cart.map((item) => {
    const product = getProduct(item.productId);
    if (!product) return "";
    return `<div class="cart-item"><img src="${esc(product.image)}" alt=""><div><h4>${esc(product.name)}</h4><span class="cart-item-price">${formatCurrency(product.price)}</span><div class="quantity-control"><button type="button" data-quantity="-1" data-product="${product.id}" aria-label="Giảm số lượng ${esc(product.name)}">−</button><span>${item.quantity}</span><button type="button" data-quantity="1" data-product="${product.id}" aria-label="Tăng số lượng ${esc(product.name)}">+</button></div></div><button class="remove-item" type="button" data-remove="${product.id}" aria-label="Xóa ${esc(product.name)}">×</button></div>`;
  }).join("");

  const { subtotal, shipping, total } = cartTotals();
  cartSummary.innerHTML = `<div class="summary-line"><span>Tạm tính</span><strong>${formatCurrency(subtotal)}</strong></div><div class="summary-line"><span>Phí giao hàng</span><strong>${shipping ? formatCurrency(shipping) : "Miễn phí"}</strong></div><div class="summary-line summary-total"><span>Tổng cộng</span><span>${formatCurrency(total)}</span></div><button class="button-primary button-full" type="button" id="checkout-button">Tiến hành đặt hàng</button>`;
}

// ==== Thành phần giao diện ====
function productCard(product) {
  const soldOut = product.stock <= 0;
  const badge = soldOut
    ? `<span class="product-badge badge-muted">Hết hàng</span>`
    : product.badge ? `<span class="product-badge">${esc(product.badge)}</span>` : "";
  return `
    <article class="product-card">
      <div class="product-image ${soldOut ? "sold-out" : ""}">
        ${badge}
        <a class="product-link" href="#product/${product.id}" tabindex="-1" aria-hidden="true"><img src="${esc(product.image)}" alt="" loading="lazy"></a>
        ${soldOut ? "" : `<button class="quick-add" type="button" data-add="${product.id}" aria-label="Thêm ${esc(product.name)} vào giỏ">+</button>`}
      </div>
      <a class="product-info" href="#product/${product.id}">
        <div class="product-meta"><span>${esc(product.brand)}</span><span>${esc(product.category)}</span></div>
        <h3 class="product-name">${esc(product.name)}</h3>
        <div class="product-price">${formatCurrency(product.price)}${product.oldPrice ? `<span class="product-old-price">${formatCurrency(product.oldPrice)}</span>` : ""}</div>
        ${product.rating.count ? `<div class="product-rating"><span aria-hidden="true">★</span> ${formatRating(product.rating.average)} · ${product.rating.count} đánh giá</div>` : ""}
      </a>
    </article>
  `;
}

function messagePage(title, text, action = `<a class="button-dark" href="#home">Về trang chủ</a>`) {
  return `<section class="page-message"><h1>${esc(title)}</h1><p>${esc(text)}</p>${action}</section>`;
}

// ==== Trang chủ ====
function homePage() {
  const featured = state.products.slice(0, 8);
  return `
    <section class="hero">
      <div class="hero-copy">
        <div class="hero-copy-inner">
          <span class="eyebrow">Âm thanh của riêng bạn</span>
          <h1>Chạm vào <em>cảm hứng.</em></h1>
          <p>Những nhạc cụ được tuyển chọn kỹ lưỡng, dành cho mọi hành trình âm nhạc — từ nốt đầu tiên đến sân khấu lớn.</p>
          <div class="button-row">
            <a class="button-primary" href="#products">Khám phá sản phẩm &nbsp;→</a>
            <a class="button-secondary" href="#about">Câu chuyện của Mộc</a>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <img src="images/hero.jpg" alt="Những cây guitar đặt trong phòng tập nhạc">
        <div class="hero-note"><strong>Thử đàn miễn phí</strong>Ghé showroom và cảm nhận nhạc cụ phù hợp nhất với bạn.</div>
      </div>
    </section>

    <section class="benefits" aria-label="Lợi ích mua hàng">
      <div class="benefit"><span class="benefit-number">01</span><strong>Chính hãng 100%</strong><small>Nguồn gốc minh bạch</small></div>
      <div class="benefit"><span class="benefit-number">02</span><strong>Bảo hành tận tâm</strong><small>Hỗ trợ đến 24 tháng</small></div>
      <div class="benefit"><span class="benefit-number">03</span><strong>Giao hàng toàn quốc</strong><small>Thanh toán khi nhận hàng</small></div>
      <div class="benefit"><span class="benefit-number">04</span><strong>Tư vấn chuyên môn</strong><small>Đội ngũ nhạc công</small></div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><span class="eyebrow">Tìm thanh âm của bạn</span><h2 class="section-title">Mỗi nhạc cụ,<br>một câu chuyện.</h2></div>
        <a class="section-link" href="#products">Xem tất cả sản phẩm →</a>
      </div>
      <div class="category-grid">
        ${state.categories.slice(0, 5).map((category) => `
          <a class="category-card" href="#products?category=${encodeURIComponent(category.name)}">
            ${category.image ? `<img src="${esc(category.image)}" alt="" loading="lazy">` : ""}
            <span class="category-label"><span><strong>${esc(category.name)}</strong><small>${category.productCount} sản phẩm</small></span><span class="category-arrow">→</span></span>
          </a>
        `).join("")}
      </div>
    </section>

    <section class="section" style="padding-top: 20px">
      <div class="section-heading">
        <div><span class="eyebrow">Được yêu thích nhất</span><h2 class="section-title">Nhạc cụ nổi bật</h2></div>
        <a class="section-link" href="#products">Mua sắm ngay →</a>
      </div>
      <div class="product-grid">${featured.map(productCard).join("")}</div>
    </section>

    <section class="editorial">
      <div class="editorial-image"><img src="images/editorial.jpg" alt="Micro cổ điển trên nền tím" loading="lazy"></div>
      <div class="editorial-copy">
        <div>
          <span class="eyebrow" style="color: #f3c9b6">Không chỉ là nhạc cụ</span>
          <h2>Chúng tôi đồng hành cùng đam mê.</h2>
          <p>Mộc Music tin rằng ai cũng có một giai điệu của riêng mình. Vì vậy, chúng tôi không chỉ bán nhạc cụ mà còn giúp bạn chọn đúng người bạn đồng hành.</p>
          <a class="button-secondary" href="#about">Hiểu thêm về Mộc →</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><div><span class="eyebrow">Khách hàng nói gì</span><h2 class="section-title">Những thanh âm hạnh phúc.</h2></div></div>
      <div class="testimonial-grid">
        <article class="testimonial-card"><div class="stars">★★★★★</div><blockquote>“Mình được tư vấn rất kỹ dù mới học guitar. Đàn đẹp, âm ấm và giao hàng cực kỳ cẩn thận.”</blockquote><div class="testimonial-user"><span class="avatar">A</span><span><strong>An Nguyễn</strong><br>Khách hàng tại TP.HCM</span></div></article>
        <article class="testimonial-card"><div class="stars">★★★★★</div><blockquote>“Chiếc piano Roland đúng như mong đợi. Nhân viên còn hướng dẫn lắp đặt và sử dụng rất nhiệt tình.”</blockquote><div class="testimonial-user"><span class="avatar">L</span><span><strong>Linh Trần</strong><br>Giáo viên âm nhạc</span></div></article>
        <article class="testimonial-card"><div class="stars">★★★★★</div><blockquote>“Shop có nhiều lựa chọn và giá hợp lý. Phần bảo hành rõ ràng nên mình rất yên tâm khi mua.”</blockquote><div class="testimonial-user"><span class="avatar">K</span><span><strong>Khoa Phạm</strong><br>Thành viên ban nhạc</span></div></article>
      </div>
    </section>
  `;
}

// ==== Trang sản phẩm: bộ lọc nằm trên địa chỉ trang, nên tải lại hay bấm quay lại vẫn giữ nguyên ====
function productsHash({ category, brand, q, sort }) {
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (brand) query.set("brand", brand);
  if (q) query.set("q", q);
  if (sort && sort !== "featured") query.set("sort", sort);
  const text = query.toString();
  return `#products${text ? `?${text}` : ""}`;
}

function getFilteredProducts() {
  const { category, brand, q, sort } = state.filters;
  const words = normalize(q).split(/\s+/).filter(Boolean);
  const candidates = state.products.filter((product) => (
    (!category || product.category === category) && (!brand || product.brand === brand)
  ));

  // Ưu tiên khớp tên, danh mục, thương hiệu. Không có thì mới tìm nguyên từ trong mô tả.
  let matches = candidates.filter((product) => {
    const title = normalize(`${product.name} ${product.category} ${product.brand}`);
    return words.every((word) => title.includes(word));
  });
  if (!matches.length) {
    matches = candidates.filter((product) => {
      const descriptionWords = normalize(product.description).split(/[^\p{L}\p{N}]+/u);
      return words.every((word) => descriptionWords.includes(word));
    });
  }
  return matches.sort((first, second) => {
    if (sort === "price-low") return first.price - second.price;
    if (sort === "price-high") return second.price - first.price;
    return first.id - second.id;
  });
}

function filterOption(type, value, label, count, active) {
  return `<div class="filter-option ${active ? "active" : ""}"><button type="button" data-filter="${type}" data-value="${esc(value)}" ${active ? 'aria-pressed="true"' : ""}>${esc(label)}</button><span>${count}</span></div>`;
}

function shopPage() {
  const { category, brand, q, sort } = state.filters;
  const brands = [...new Set(state.products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b));
  const countBrand = (name) => state.products.filter((product) => product.brand === name).length;
  return `
    <section class="page-hero">
      <span class="eyebrow">Bộ sưu tập Mộc Music</span>
      <h1>Chọn nhạc cụ.</h1>
      <p>Từ guitar, piano đến trống và phụ kiện — tất cả đều được chọn lọc để bạn tự tin bắt đầu hoặc tiến xa hơn trên hành trình âm nhạc.</p>
    </section>
    <section class="shop-layout">
      <aside class="filter-panel">
        <div class="filter-group"><h3>Danh mục</h3><div class="filter-options">
          ${filterOption("category", "", "Tất cả", state.products.length, !category)}
          ${state.categories.map((item) => filterOption("category", item.name, item.name, item.productCount, category === item.name)).join("")}
        </div></div>
        <div class="filter-group"><h3>Thương hiệu</h3><div class="filter-options">
          ${filterOption("brand", "", "Tất cả thương hiệu", state.products.length, !brand)}
          ${brands.map((name) => filterOption("brand", name, name, countBrand(name), brand === name)).join("")}
        </div></div>
      </aside>
      <div>
        <div class="shop-toolbar">
          <label class="shop-search"><span aria-hidden="true">⌕</span><input id="product-search" type="search" value="${esc(q)}" placeholder="Tìm nhạc cụ, thương hiệu..." aria-label="Tìm sản phẩm"></label>
          <select id="sort-products" aria-label="Sắp xếp sản phẩm">
            <option value="featured" ${sort === "featured" ? "selected" : ""}>Nổi bật</option>
            <option value="price-low" ${sort === "price-low" ? "selected" : ""}>Giá thấp đến cao</option>
            <option value="price-high" ${sort === "price-high" ? "selected" : ""}>Giá cao đến thấp</option>
          </select>
        </div>
        <div id="shop-results"></div>
      </div>
    </section>
  `;
}

function renderShopResults() {
  const results = $("#shop-results");
  if (!results) return;
  const products = getFilteredProducts();
  results.innerHTML = `
    <div class="result-count" role="status">Hiển thị ${products.length} sản phẩm</div>
    ${products.length ? `<div class="product-grid">${products.map(productCard).join("")}</div>` : `<div class="empty-state"><h3>Chưa tìm thấy sản phẩm</h3><p>Hãy thử từ khóa hoặc bộ lọc khác nhé.</p><a class="button-dark" href="#products">Xóa bộ lọc</a></div>`}
  `;
}

// ==== Trang chi tiết sản phẩm ====
function productPage(product) {
  const related = state.products.filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 4);
  const specs = Object.entries(product.specs);
  return `
    <section class="product-page">
      <a class="breadcrumb" href="#products?category=${encodeURIComponent(product.category)}">← ${esc(product.category)}</a>
      <div class="product-modal-grid">
        <div class="product-modal-image"><img src="${esc(product.image)}" alt="${esc(product.name)}"></div>
        <div class="product-modal-info">
          <span class="eyebrow">${esc(product.category)} · ${esc(product.brand)}</span>
          <h1>${esc(product.name)}</h1>
          <div class="modal-price">${formatCurrency(product.price)}${product.oldPrice ? `<span class="product-old-price">${formatCurrency(product.oldPrice)}</span>` : ""}</div>
          <p class="rating-line">${product.rating.count ? `${stars(product.rating.average)} ${formatRating(product.rating.average)}/5 · ${product.rating.count} đánh giá` : "Chưa có đánh giá"}</p>
          <p class="product-description">${esc(product.description)}</p>
          ${specs.length ? `<div class="spec-table">${specs.map(([label, value]) => `<div class="spec-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>` : ""}
          ${product.stock > 0
            ? `<div class="stock-note">✓ Còn ${product.stock} sản phẩm — sẵn sàng giao hàng</div><button class="button-primary button-full" type="button" data-add="${product.id}">Thêm vào giỏ hàng</button>`
            : `<div class="stock-note out">Sản phẩm tạm hết hàng</div>`}
          <p class="image-note">Ảnh mang tính minh họa.</p>
        </div>
      </div>
      <div class="reviews" id="reviews" data-product="${product.id}"><p class="empty-note">Đang tải đánh giá...</p></div>
      ${related.length ? `<div class="related"><div class="section-heading"><div><span class="eyebrow">Cùng danh mục</span><h2 class="section-title">Có thể bạn thích</h2></div></div><div class="product-grid">${related.map(productCard).join("")}</div></div>` : ""}
    </section>
  `;
}

// ==== Đánh giá sản phẩm (specs/10-danh-gia-san-pham) ====
function starInput(selected) {
  return [1, 2, 3, 4, 5].map((value) => `
    <input type="radio" id="rate-${value}" name="rating" value="${value}" aria-label="${value} sao" required ${value === selected ? "checked" : ""}>
    <label for="rate-${value}" title="${value} sao" aria-hidden="true">★</label>`).join("");
}

// Khu vực gửi đánh giá đổi theo người xem: chưa đăng nhập, chưa đủ điều kiện, hoặc được đánh giá.
function reviewFormArea(me, productId) {
  if (!me.loggedIn) {
    return `<p class="form-intro">Bạn đã mua sản phẩm này? Đăng nhập để chia sẻ cảm nhận.</p><button class="button-dark" type="button" data-open-account>Đăng nhập để đánh giá</button>`;
  }
  if (!me.canReview) {
    return `<p class="form-note">Chỉ khách đã nhận hàng mới đánh giá được sản phẩm này.</p>`;
  }
  const mine = me.review;
  return `
    <form id="review-form" data-product="${productId}">
      <h3>${mine ? "Đánh giá của bạn" : "Viết đánh giá"}</h3>
      ${mine?.isHidden ? `<p class="form-note">Đánh giá của bạn đang bị ẩn vì chưa phù hợp với quy định của cửa hàng. Khách khác không thấy đánh giá này.</p>` : ""}
      <p class="form-error" role="alert"></p>
      <fieldset class="star-input"><legend>Số sao</legend>${starInput(mine?.rating)}</fieldset>
      ${field("Nhận xét (không bắt buộc)", `<textarea name="comment" maxlength="1000" placeholder="Âm thanh, độ hoàn thiện, cảm giác khi chơi...">${esc(mine?.comment)}</textarea>`)}
      <button class="button-primary" type="submit">${mine ? "Cập nhật đánh giá" : "Gửi đánh giá"}</button>
    </form>`;
}

function reviewItem(review) {
  const edited = review.updatedAt !== review.createdAt ? " · đã sửa" : "";
  return `
    <article class="review">
      <div class="review-head"><strong>${esc(review.userName)}</strong>${stars(review.rating)}<span class="visually-hidden">${review.rating} trên 5 sao</span></div>
      ${review.comment ? `<p>${esc(review.comment)}</p>` : ""}
      <small>${formatDate(review.updatedAt)}${edited}${review.isMine ? " · Đánh giá của bạn" : ""}</small>
    </article>`;
}

function reviewsSection({ summary, reviews, me }, productId) {
  return `
    <div class="reviews-side">
      <span class="eyebrow">Đánh giá từ khách đã mua</span>
      ${summary.count
        ? `<div class="reviews-score">${formatRating(summary.average)}<small>/5</small></div>${stars(summary.average)}<p class="form-intro">${summary.count} đánh giá</p>`
        : `<h2 class="section-title">Chưa có đánh giá</h2>`}
      ${reviewFormArea(me, productId)}
    </div>
    <div class="reviews-list">
      ${reviews.length ? reviews.map(reviewItem).join("") : `<p class="empty-note">Chưa có đánh giá nào. Khách đã nhận hàng có thể là người đầu tiên chia sẻ cảm nhận.</p>`}
    </div>`;
}

// Tải đánh giá sau khi trang đã hiện, để trang không phải chờ.
async function loadReviews() {
  const box = $("#reviews");
  if (!box) return;
  const productId = box.dataset.product;
  try {
    const data = await api(`/products/${productId}/reviews`);
    // Người dùng có thể đã chuyển sang sản phẩm khác trong lúc chờ.
    if (box.isConnected) box.innerHTML = reviewsSection(data, productId);
  } catch (error) {
    if (box.isConnected) box.innerHTML = `<p class="empty-note">${esc(error.message)}</p>`;
  }
}

// ==== Trang giới thiệu và chính sách ====
function aboutPage() {
  const brandCount = new Set(state.products.map((product) => product.brand)).size;
  return `
    <section class="about-hero">
      <div class="about-hero-copy">
        <div><span class="eyebrow">Câu chuyện Mộc Music</span><h1 class="section-title">Âm nhạc bắt đầu từ một rung động.</h1><p>Ra đời từ tình yêu dành cho âm nhạc, Mộc Music mong muốn giúp mỗi người tìm thấy nhạc cụ thật sự phù hợp với mình.</p></div>
      </div>
      <div class="about-hero-image"><img src="images/about.jpg" alt="Micro trên sân khấu"></div>
    </section>
    <section class="about-story">
      <div><span class="eyebrow">Về chúng tôi</span><h2>Đúng nhạc cụ.<br>Đúng cảm hứng.</h2></div>
      <div><p>Mộc Music bắt đầu từ một cửa hàng nhỏ nơi những người yêu nhạc có thể thử đàn, trò chuyện và học hỏi lẫn nhau. Chúng tôi hiểu rằng mua nhạc cụ không chỉ là chọn một món đồ — đó là chọn một người bạn đồng hành lâu dài.</p><p>Dù bạn đang tìm cây guitar đầu tiên, nâng cấp bộ trống hay xây dựng phòng thu riêng, đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và tư vấn.</p><div class="button-row" style="margin-top: 28px"><a class="button-primary" href="#products">Khám phá sản phẩm</a><a class="button-secondary" href="tel:19001234">Gọi 1900 1234</a></div></div>
    </section>
    <section class="benefits"><div class="benefit"><span class="benefit-number">${state.products.length}</span><strong>Sản phẩm</strong><small>Đang được bày bán</small></div><div class="benefit"><span class="benefit-number">${brandCount}</span><strong>Thương hiệu</strong><small>Trong danh mục hiện tại</small></div><div class="benefit"><span class="benefit-number">24</span><strong>Tháng bảo hành</strong><small>Tối đa, tùy thương hiệu</small></div><div class="benefit"><span class="benefit-number">7</span><strong>Ngày đổi trả</strong><small>Khi có lỗi kỹ thuật</small></div></section>
  `;
}

function policyPage() {
  return `
    <section class="page-hero"><span class="eyebrow">An tâm mua sắm</span><h1>Chính sách.</h1><p>Những thông tin quan trọng về giao hàng, thanh toán, đổi trả và bảo hành tại Mộc Music.</p></section>
    <article class="policy-content"><h2>Giao hàng</h2><p>Mộc Music giao hàng trên toàn quốc. Đơn từ ${formatCurrency(state.shipping.threshold)} được miễn phí giao hàng tiêu chuẩn, đơn thấp hơn có phí ${formatCurrency(state.shipping.fee)}. Thời gian dự kiến từ 1–3 ngày tại nội thành và 3–7 ngày tại các tỉnh.</p><h2>Thanh toán</h2><p>Hiện tại Mộc Music hỗ trợ thanh toán tiền mặt khi nhận hàng (COD). Bạn có thể tự hủy đơn khi đơn đang ở trạng thái chờ xác nhận.</p><h2>Đổi trả</h2><p>Sản phẩm được hỗ trợ đổi trong vòng 7 ngày khi có lỗi kỹ thuật từ nhà sản xuất hoặc giao sai sản phẩm. Nhạc cụ cần còn nguyên tình trạng, phụ kiện và bao bì đi kèm.</p><h2>Bảo hành</h2><p>Tất cả sản phẩm chính hãng được bảo hành từ 6 đến 24 tháng tùy thương hiệu. Mộc Music hỗ trợ tiếp nhận, kiểm tra và gửi bảo hành trong suốt thời gian sử dụng.</p><h2>Hỗ trợ</h2><p>Liên hệ hotline 1900 1234 hoặc email hello@mocmusic.vn để được tư vấn. Thời gian hỗ trợ từ 8:30 đến 21:00 mỗi ngày.</p></article>
  `;
}

// ==== Khu vực quản trị ====
const ADMIN_TABS = [
  ["overview", "#admin", "Tổng quan"],
  ["orders", "#admin/orders", "Đơn hàng"],
  ["products", "#admin/products", "Sản phẩm"],
  ["categories", "#admin/categories", "Danh mục"],
  ["customers", "#admin/customers", "Khách hàng"],
  ["reviews", "#admin/reviews", "Đánh giá"]
];

function adminShell(tab, content) {
  return `
    <section class="page-hero"><span class="eyebrow">Khu vực quản trị</span><h1>${esc(ADMIN_TABS.find(([key]) => key === tab)[2])}.</h1></section>
    <section class="admin-page">
      <nav class="admin-tabs" aria-label="Mục quản trị">${ADMIN_TABS.map(([key, href, label]) => `<a href="${href}" class="${key === tab ? "active" : ""}">${label}</a>`).join("")}</nav>
      <div id="admin-content">${content}</div>
    </section>
  `;
}

async function adminOverview() {
  const stats = await api("/admin/stats");
  const maxSold = Math.max(1, ...stats.categorySales.map((row) => row.quantity));
  return `
    <div class="admin-stats">
      <div class="stat-card"><small>Doanh thu (đơn hoàn thành)</small><strong>${formatCurrency(stats.revenue)}</strong></div>
      <div class="stat-card"><small>Đơn hàng</small><strong>${stats.orderCount}</strong></div>
      <div class="stat-card"><small>Sản phẩm đang bán</small><strong>${stats.productCount}</strong></div>
      <div class="stat-card"><small>Khách hàng</small><strong>${stats.customerCount}</strong></div>
    </div>
    <div class="admin-grid">
      <div class="admin-card"><h3>Đơn theo trạng thái</h3><table class="admin-table"><thead><tr><th>Trạng thái</th><th>Số đơn</th></tr></thead><tbody>${stats.byStatus.map((row) => `<tr><td>${statusPill(row.status)}</td><td>${row.count}</td></tr>`).join("")}</tbody></table></div>
      <div class="admin-card"><h3>Số lượng bán theo danh mục</h3>${stats.categorySales.length ? `<div class="bar-list">${stats.categorySales.map((row) => `<div><div class="bar-label"><span>${esc(row.name)}</span><strong>${row.quantity}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(row.quantity / maxSold * 100)}%"></div></div></div>`).join("")}</div>` : `<p class="empty-note">Chưa có đơn hàng nào.</p>`}</div>
    </div>
    <div class="admin-card" style="margin-top: 20px"><h3>Sắp hết hàng (còn 3 trở xuống)</h3>${stats.lowStock.length ? `<table class="admin-table"><thead><tr><th>Sản phẩm</th><th>Tồn kho</th></tr></thead><tbody>${stats.lowStock.map((row) => `<tr><td>${esc(row.name)}</td><td>${row.stock}</td></tr>`).join("")}</tbody></table>` : `<p class="empty-note">Không có sản phẩm nào sắp hết hàng.</p>`}</div>
  `;
}

async function adminOrders() {
  const { orders } = await api("/admin/orders");
  if (!orders.length) return `<div class="admin-card"><p class="empty-note">Chưa có đơn hàng nào.</p></div>`;
  return `<div class="admin-card"><table class="admin-table"><thead><tr><th>Mã đơn</th><th>Người nhận</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th>Chuyển sang</th></tr></thead><tbody>${orders.map((order) => `
    <tr>
      <td><strong>#${esc(order.code)}</strong></td>
      <td>${esc(order.customerName)}<br>${esc(order.phone)}<br>${esc(order.address)}</td>
      <td><ul class="admin-items">${order.items.map((item) => `<li>${esc(item.name)} × ${item.quantity}</li>`).join("")}</ul></td>
      <td>${formatCurrency(order.total)}<br><small>Tiền mặt khi nhận</small></td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${statusPill(order.status)}</td>
      <td>${order.nextStatuses.length ? `<select data-order-status="${order.id}" aria-label="Đổi trạng thái đơn ${esc(order.code)}"><option value="">Chọn...</option>${order.nextStatuses.map((status) => `<option value="${esc(status)}">${esc(status)}</option>`).join("")}</select>` : "—"}</td>
    </tr>`).join("")}</tbody></table></div>`;
}

async function adminProducts() {
  const { products } = await api("/admin/products");
  state.adminProducts = products;
  return `
    <div class="admin-toolbar"><h3>${products.length} sản phẩm</h3><button class="button-dark" type="button" data-product-form="">+ Thêm sản phẩm</button></div>
    <div class="admin-card"><table class="admin-table"><thead><tr><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th></th></tr></thead><tbody>${products.map((product) => `
      <tr class="${product.isActive ? "" : "row-muted"}">
        <td>${product.image ? `<img src="${esc(product.image)}" alt="">` : ""}</td>
        <td><strong>${esc(product.name)}</strong><br>${esc(product.brand)}</td>
        <td>${esc(product.category)}</td>
        <td>${formatCurrency(product.price)}</td>
        <td>${product.stock}</td>
        <td>${product.isActive ? "Đang bán" : "Đã ẩn"}</td>
        <td><div class="admin-actions"><button class="link-button" type="button" data-product-form="${product.id}">Sửa</button><button class="link-button" type="button" data-product-active="${product.id}" data-active="${product.isActive ? "false" : "true"}">${product.isActive ? "Ẩn" : "Bán lại"}</button></div></td>
      </tr>`).join("")}</tbody></table></div>
  `;
}

async function adminCategories() {
  await loadCatalog();
  return `
    <div class="admin-toolbar"><h3>${state.categories.length} danh mục</h3><button class="button-dark" type="button" data-category-form="">+ Thêm danh mục</button></div>
    <div class="admin-card"><table class="admin-table"><thead><tr><th>Ảnh</th><th>Tên</th><th>Sản phẩm đang bán</th><th></th></tr></thead><tbody>${state.categories.map((category) => `
      <tr>
        <td>${category.image ? `<img src="${esc(category.image)}" alt="">` : ""}</td>
        <td><strong>${esc(category.name)}</strong></td>
        <td>${category.productCount}</td>
        <td><div class="admin-actions"><button class="link-button" type="button" data-category-form="${category.id}">Sửa</button><button class="link-button" type="button" data-category-delete="${category.id}">Xóa</button></div></td>
      </tr>`).join("")}</tbody></table></div>
  `;
}

async function adminCustomers() {
  const { customers } = await api("/admin/customers");
  if (!customers.length) return `<div class="admin-card"><p class="empty-note">Chưa có khách hàng nào.</p></div>`;
  return `<div class="admin-card"><table class="admin-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Ngày đăng ký</th><th>Số đơn</th></tr></thead><tbody>${customers.map((customer) => `<tr><td>${esc(customer.name)}</td><td>${esc(customer.email)}</td><td>${formatDate(customer.createdAt)}</td><td>${customer.orderCount}</td></tr>`).join("")}</tbody></table></div>`;
}

async function adminReviews() {
  const { reviews } = await api("/admin/reviews");
  if (!reviews.length) return `<div class="admin-card"><p class="empty-note">Chưa có đánh giá nào.</p></div>`;
  const hiddenCount = reviews.filter((review) => review.isHidden).length;
  return `
    <div class="admin-toolbar"><h3>${reviews.length} đánh giá${hiddenCount ? `, ${hiddenCount} đang ẩn` : ""}</h3></div>
    <div class="admin-card"><table class="admin-table"><thead><tr><th>Sản phẩm</th><th>Khách</th><th>Số sao</th><th>Nhận xét</th><th>Ngày</th><th>Trạng thái</th><th></th></tr></thead><tbody>${reviews.map((review) => `
      <tr class="${review.isHidden ? "row-muted" : ""}">
        <td><a href="#product/${review.productId}">${esc(review.productName)}</a></td>
        <td>${esc(review.userName)}<br><small>${esc(review.userEmail)}</small></td>
        <td>${stars(review.rating)}<span class="visually-hidden">${review.rating} sao</span></td>
        <td class="review-comment">${review.comment ? esc(review.comment) : "—"}</td>
        <td>${formatDate(review.updatedAt)}</td>
        <td>${review.isHidden ? "Đang ẩn" : "Đang hiện"}</td>
        <td><button class="link-button" type="button" data-review-hidden="${review.id}" data-hidden="${review.isHidden ? "false" : "true"}">${review.isHidden ? "Hiện lại" : "Ẩn"}</button></td>
      </tr>`).join("")}</tbody></table></div>`;
}

const ADMIN_VIEWS = {
  overview: adminOverview,
  orders: adminOrders,
  products: adminProducts,
  categories: adminCategories,
  customers: adminCustomers,
  reviews: adminReviews
};

async function renderAdmin(tab, token) {
  if (!state.user) {
    app.innerHTML = messagePage("Vui lòng đăng nhập", "Khu vực này chỉ dành cho quản trị viên.", `<button class="button-dark" type="button" data-open-account>Đăng nhập</button>`);
    return;
  }
  if (state.user.role !== "admin") {
    app.innerHTML = messagePage("Không có quyền truy cập", "Tài khoản của bạn không phải tài khoản quản trị.");
    return;
  }
  if (!ADMIN_VIEWS[tab]) {
    app.innerHTML = messagePage("Không tìm thấy trang", "Mục quản trị này không tồn tại.");
    return;
  }
  app.innerHTML = adminShell(tab, `<p class="loading">Đang tải...</p>`);
  try {
    const content = await ADMIN_VIEWS[tab]();
    if (token === routeToken) $("#admin-content").innerHTML = content;
  } catch (error) {
    if (token !== routeToken) return;
    if (error.status === 401) {
      state.user = null;
      updateUserUi();
      route();
      return;
    }
    $("#admin-content").innerHTML = `<div class="admin-card"><p class="empty-note">${esc(error.message)}</p></div>`;
  }
}

function currentAdminTab() {
  return window.location.hash.slice(1).split("?")[0].split("/")[1] || "overview";
}

async function refreshAdminTab() {
  const content = await ADMIN_VIEWS[currentAdminTab()]();
  const target = $("#admin-content");
  if (target) target.innerHTML = content;
}

function specsToText(specs) {
  return Object.entries(specs).map(([label, value]) => `${label}: ${value}`).join("\n");
}

// Mỗi dòng có dạng "Tên thông số: Giá trị".
function textToSpecs(text) {
  const specs = {};
  for (const line of text.split("\n")) {
    const position = line.indexOf(":");
    if (position > 0 && line.slice(position + 1).trim()) {
      specs[line.slice(0, position).trim()] = line.slice(position + 1).trim();
    }
  }
  return specs;
}

function openProductForm(productId) {
  const product = state.adminProducts.find((item) => item.id === Number(productId));
  adminModalContent.innerHTML = `
    <h2>${product ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
    <form id="product-form" data-id="${product ? product.id : ""}">
      <p class="form-error" role="alert"></p>
      ${field("Tên sản phẩm", `<input name="name" required maxlength="150" value="${esc(product?.name)}">`)}
      <div class="form-row">
        ${field("Danh mục", `<select name="categoryId" required>${state.categories.map((category) => `<option value="${category.id}" ${product?.categoryId === category.id ? "selected" : ""}>${esc(category.name)}</option>`).join("")}</select>`)}
        ${field("Thương hiệu", `<input name="brand" required maxlength="80" value="${esc(product?.brand)}">`)}
      </div>
      <div class="form-row">
        ${field("Giá bán (đ)", `<input name="price" type="number" min="0" step="1000" required value="${esc(product?.price)}">`)}
        ${field("Giá cũ (đ, không bắt buộc)", `<input name="oldPrice" type="number" min="0" step="1000" value="${esc(product?.oldPrice)}">`)}
      </div>
      <div class="form-row">
        ${field("Tồn kho", `<input name="stock" type="number" min="0" step="1" required value="${esc(product?.stock ?? 0)}">`)}
        ${field("Nhãn (không bắt buộc)", `<input name="badge" maxlength="30" value="${esc(product?.badge)}">`)}
      </div>
      ${field("Đường dẫn ảnh", `<input name="image" maxlength="500" value="${esc(product?.image)}">`, "Ví dụ: images/p-cajon.jpg hoặc một liên kết https://")}
      ${field("Mô tả", `<textarea name="description" maxlength="2000">${esc(product?.description)}</textarea>`)}
      ${field("Thông số kỹ thuật", `<textarea name="specs">${esc(product ? specsToText(product.specs) : "")}</textarea>`, "Mỗi dòng một thông số, ví dụ — Chất liệu: Gỗ Spruce")}
      <button class="button-primary button-full" type="submit">Lưu sản phẩm</button>
    </form>`;
  openLayer(adminModal);
}

function openCategoryForm(categoryId) {
  const category = state.categories.find((item) => item.id === Number(categoryId));
  adminModalContent.innerHTML = `
    <h2>${category ? "Sửa danh mục" : "Thêm danh mục"}</h2>
    <form id="category-form" data-id="${category ? category.id : ""}">
      <p class="form-error" role="alert"></p>
      ${field("Tên danh mục", `<input name="name" required maxlength="60" value="${esc(category?.name)}">`)}
      ${field("Đường dẫn ảnh", `<input name="image" maxlength="500" value="${esc(category?.image)}">`, "Ví dụ: images/c-guitar.jpg hoặc một liên kết https://")}
      <button class="button-primary button-full" type="submit">Lưu danh mục</button>
    </form>`;
  openLayer(adminModal);
}

// ==== Điều hướng ====
const TITLES = { home: "Nhạc cụ cho mọi cảm hứng", products: "Sản phẩm", about: "Về chúng tôi", policy: "Chính sách", admin: "Quản trị" };

function setTitle(title) {
  document.title = `Mộc Music | ${title}`;
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}

function route({ keepLayers = false } = {}) {
  const token = ++routeToken;
  const hashValue = window.location.hash.slice(1) || "home";
  const separator = hashValue.indexOf("?");
  const path = separator === -1 ? hashValue : hashValue.slice(0, separator);
  const query = new URLSearchParams(separator === -1 ? "" : hashValue.slice(separator + 1));
  const [page, argument] = path.split("/");

  if (!keepLayers) closeLayers({ restoreFocus: false });
  closeMobileMenu();
  setTitle(TITLES[page] || "Không tìm thấy trang");

  if (page === "home") {
    app.innerHTML = homePage();
  } else if (page === "products") {
    state.filters = {
      category: query.get("category") || "",
      brand: query.get("brand") || "",
      q: query.get("q") || "",
      sort: query.get("sort") || "featured"
    };
    app.innerHTML = shopPage();
    renderShopResults();
    if (pendingFocus) {
      document.querySelector(pendingFocus)?.focus();
      pendingFocus = null;
    }
  } else if (page === "product") {
    const product = getProduct(argument);
    if (product) {
      setTitle(product.name);
      app.innerHTML = productPage(product);
      loadReviews();
    } else {
      setTitle("Không tìm thấy sản phẩm");
      app.innerHTML = messagePage("Không tìm thấy sản phẩm", "Sản phẩm này không tồn tại hoặc đã ngừng bán.", `<a class="button-dark" href="#products">Xem sản phẩm khác</a>`);
    }
  } else if (page === "about") {
    app.innerHTML = aboutPage();
  } else if (page === "policy") {
    app.innerHTML = policyPage();
  } else if (page === "admin") {
    renderAdmin(argument || "overview", token);
  } else {
    app.innerHTML = messagePage("Không tìm thấy trang", "Trang bạn tìm không tồn tại.");
  }

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === page || (link.dataset.nav === "products" && page === "product"));
  });

  // Đổi bộ lọc trong cùng trang sản phẩm thì giữ nguyên vị trí cuộn.
  const pageKey = page === "product" ? path : page;
  if (pageKey !== lastPage) window.scrollTo({ top: 0, behavior: "instant" });
  lastPage = pageKey;
}

// Vẽ lại trang đang xem khi tồn kho đổi, nhưng không đóng hộp thoại đang mở.
function refreshStorePage() {
  if (!window.location.hash.startsWith("#admin")) route({ keepLayers: true });
}

// ==== Lớp phủ (giỏ hàng, hộp thoại) ====
function focusableIn(layer) {
  return [...layer.querySelectorAll('a[href], button:not([disabled]), input, select, textarea')]
    .filter((element) => element.offsetParent !== null);
}

function focusLayer(layer) {
  const target = layer.querySelector("input, select, textarea") || focusableIn(layer)[0];
  target?.focus();
}

function openLayer(layer) {
  const previous = document.activeElement;
  closeLayers({ restoreFocus: false });
  if (!layers.includes(previous) && !layers.some((item) => item.contains(previous))) lastFocused = previous;
  overlay.classList.add("open");
  layer.classList.add("open");
  document.body.classList.add("locked");
  focusLayer(layer);
}

function closeLayers({ restoreFocus = true } = {}) {
  const wasOpen = layers.some((layer) => layer.classList.contains("open"));
  overlay.classList.remove("open");
  layers.forEach((layer) => layer.classList.remove("open"));
  document.body.classList.remove("locked");
  if (wasOpen && restoreFocus && lastFocused?.isConnected) lastFocused.focus();
}

function openLayerElement() {
  return layers.find((layer) => layer.classList.contains("open"));
}

// ==== Tài khoản ====
function loginForm(notice = "") {
  return `
    <span class="eyebrow">Chào mừng trở lại</span><h2>Đăng nhập</h2>
    ${notice ? `<p class="form-note">${esc(notice)}</p>` : ""}
    <form id="login-form"><p class="form-error" role="alert"></p>
      ${field("Email", `<input name="email" type="email" required autocomplete="email" placeholder="ban@email.com">`)}
      ${field("Mật khẩu", `<input name="password" type="password" required autocomplete="current-password" placeholder="••••••••">`)}
      <button class="button-primary button-full" type="submit">Đăng nhập</button>
    </form>
    <div class="form-switch">Chưa có tài khoản? <button type="button" data-account-view="register">Đăng ký ngay</button></div>`;
}

function registerForm() {
  return `
    <span class="eyebrow">Thành viên Mộc Music</span><h2>Tạo tài khoản</h2><p class="form-intro">Lưu đơn hàng và theo dõi trạng thái giao hàng.</p>
    <form id="register-form"><p class="form-error" role="alert"></p>
      ${field("Họ và tên", `<input name="name" required maxlength="100" autocomplete="name" placeholder="Nguyễn Văn An">`)}
      ${field("Email", `<input name="email" type="email" required autocomplete="email" placeholder="ban@email.com">`)}
      ${field("Mật khẩu", `<input name="password" type="password" minlength="8" required autocomplete="new-password" placeholder="Tối thiểu 8 ký tự">`)}
      <button class="button-primary button-full" type="submit">Đăng ký</button>
    </form>
    <div class="form-switch">Đã có tài khoản? <button type="button" data-account-view="login">Đăng nhập</button></div>`;
}

function orderCard(order) {
  return `
    <div class="order-mini">
      <div class="order-mini-head"><strong>#${esc(order.code)}</strong>${statusPill(order.status)}</div>
      ${formatDate(order.createdAt)}
      <ul>${order.items.map((item) => `<li>${esc(item.name)} × ${item.quantity}</li>`).join("")}</ul>
      <strong>${formatCurrency(order.total)}</strong> · Tiền mặt khi nhận hàng<br>
      Giao đến: ${esc(order.customerName)}, ${esc(order.phone)}, ${esc(order.address)}
      ${order.status === "Chờ xác nhận" ? `<br><button class="link-button" type="button" data-cancel-order="${order.id}">Hủy đơn này</button>` : ""}
    </div>`;
}

async function renderAccount(view = "login", notice = "") {
  if (!state.user) {
    accountContent.innerHTML = view === "register" ? registerForm() : loginForm(notice);
    return;
  }
  const user = state.user;
  const initial = user.name.trim().charAt(0).toUpperCase();
  const greeting = user.name.trim().split(/\s+/).at(-1);
  const head = `<div class="user-welcome"><div class="user-avatar">${esc(initial)}</div><span class="eyebrow">Tài khoản của bạn</span><h2>Xin chào, ${esc(greeting)}!</h2><p class="form-intro">${esc(user.email)}</p></div>`;
  const foot = `${user.role === "admin" ? `<a class="button-dark button-full" href="#admin" style="margin-bottom: 10px">Vào trang quản trị</a>` : ""}<button class="button-secondary button-full" type="button" id="logout-button">Đăng xuất</button>`;

  accountContent.innerHTML = `${head}<div class="order-list"><strong>Đơn hàng của bạn</strong><p class="form-intro">Đang tải...</p></div>${foot}`;
  try {
    const { orders } = await api("/orders/mine");
    if (state.user !== user) return;
    accountContent.querySelector(".order-list").innerHTML = `<strong>Đơn hàng của bạn</strong>${orders.length ? orders.map(orderCard).join("") : `<p class="form-intro">Bạn chưa có đơn hàng nào.</p>`}`;
  } catch (error) {
    accountContent.querySelector(".order-list").innerHTML = `<p class="form-error">${esc(error.message)}</p>`;
  }
}

function openAccount(notice = "") {
  openLayer(accountModal);
  renderAccount("login", notice).then(() => focusLayer(accountModal));
}

async function afterAuth(user, message) {
  state.user = user;
  updateUserUi();
  showToast(message);
  const next = state.afterLogin;
  state.afterLogin = null;
  if (next === "checkout") {
    openCheckout();
    return;
  }
  if (window.location.hash.startsWith("#admin")) {
    closeLayers();
    route();
    return;
  }
  await renderAccount();
}

// ==== Đặt hàng ====
function openCheckout() {
  if (!state.cart.length) return;
  if (!state.user) {
    state.afterLogin = "checkout";
    openAccount("Vui lòng đăng nhập hoặc đăng ký để đặt hàng. Giỏ hàng của bạn vẫn được giữ nguyên.");
    return;
  }
  const { subtotal, shipping, total } = cartTotals();
  checkoutContent.innerHTML = `
    <span class="eyebrow">Bước cuối cùng</span><h2>Đặt hàng</h2><p class="form-intro">Điền thông tin nhận hàng để hoàn tất đơn mua.</p>
    <form id="checkout-form"><div class="checkout-grid"><div>
      <p class="form-error" role="alert"></p>
      ${field("Họ và tên người nhận", `<input name="customerName" required maxlength="100" autocomplete="name" value="${esc(state.user.name)}">`)}
      ${field("Số điện thoại", `<input name="phone" type="tel" required pattern="0[0-9]{9}" title="10 chữ số, bắt đầu bằng 0" autocomplete="tel" placeholder="0901234567">`)}
      ${field("Địa chỉ nhận hàng", `<textarea name="address" required maxlength="300" autocomplete="street-address" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"></textarea>`)}
      <div class="form-group"><span class="form-label">Phương thức thanh toán</span><div class="payment-fixed">Thanh toán tiền mặt khi nhận hàng (COD)</div></div>
    </div><aside class="checkout-summary"><h3>Đơn hàng</h3>
      ${state.cart.map((item) => {
        const product = getProduct(item.productId);
        return `<div class="checkout-product"><span>${esc(product.name)} × ${item.quantity}</span><strong>${formatCurrency(product.price * item.quantity)}</strong></div>`;
      }).join("")}
      <div class="summary-line"><span>Tạm tính</span><strong>${formatCurrency(subtotal)}</strong></div>
      <div class="summary-line"><span>Phí giao hàng</span><strong>${shipping ? formatCurrency(shipping) : "Miễn phí"}</strong></div>
      <div class="summary-line summary-total"><span>Tổng cộng</span><span>${formatCurrency(total)}</span></div>
      <button class="button-primary button-full" type="submit">Xác nhận đặt hàng</button>
    </aside></div></form>`;
  openLayer(checkoutModal);
}

function showOrderSuccess(order) {
  checkoutContent.innerHTML = `
    <div class="order-success">
      <span class="eyebrow">Đặt hàng thành công</span>
      <h2>Cảm ơn bạn!</h2>
      <span class="order-code">#${esc(order.code)}</span>
      <p class="form-intro">Tổng ${formatCurrency(order.total)}, thanh toán tiền mặt khi nhận hàng. Cửa hàng sẽ gọi ${esc(order.phone)} để xác nhận đơn.</p>
      <div class="button-row" style="justify-content: center">
        <button class="button-dark" type="button" data-open-account>Xem đơn hàng</button>
        <a class="button-secondary" href="#products" data-close>Tiếp tục mua sắm</a>
      </div>
    </div>`;
  focusLayer(checkoutModal);
}

// ==== Xử lý thao tác người dùng ====
document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const addButton = target.closest("[data-add]");
  if (addButton) {
    addToCart(addButton.dataset.add);
    return;
  }

  const filterButton = target.closest("[data-filter]");
  if (filterButton) {
    const { filter, value } = filterButton.dataset;
    pendingFocus = `[data-filter="${filter}"][data-value="${CSS.escape(value)}"]`;
    const next = productsHash({ ...state.filters, [filter]: value });
    if (window.location.hash === next) pendingFocus = null;
    window.location.hash = next;
    return;
  }

  if (target.closest(".cart-button")) {
    updateCart();
    openLayer(cartDrawer);
    return;
  }

  if (target.closest("[data-open-account]")) {
    closeMobileMenu();
    openAccount();
    return;
  }

  if (target.closest(".menu-button")) {
    const open = mobileMenu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    if (open) mobileMenu.style.top = `${$(".site-header").getBoundingClientRect().bottom}px`;
    return;
  }

  if (target.closest("#mobile-menu a")) {
    closeMobileMenu();
    return;
  }

  if (target.closest(".search-toggle")) {
    if (!window.location.hash.startsWith("#products")) window.location.hash = "products";
    window.setTimeout(() => $("#product-search")?.focus(), 50);
    return;
  }

  if (target.closest("[data-close]") || target === overlay) {
    closeLayers();
    return;
  }

  const quantityButton = target.closest("[data-quantity]");
  if (quantityButton) {
    changeQuantity(quantityButton.dataset.product, Number(quantityButton.dataset.quantity));
    return;
  }

  const removeButton = target.closest("[data-remove]");
  if (removeButton) {
    state.cart = state.cart.filter((item) => item.productId !== Number(removeButton.dataset.remove));
    saveCart();
    updateCart();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng");
    return;
  }

  if (target.closest("#checkout-button")) {
    openCheckout();
    return;
  }

  const accountViewButton = target.closest("[data-account-view]");
  if (accountViewButton) {
    await renderAccount(accountViewButton.dataset.accountView);
    focusLayer(accountModal);
    return;
  }

  if (target.closest("#logout-button")) {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    state.user = null;
    state.afterLogin = null;
    updateUserUi();
    closeLayers();
    showToast("Bạn đã đăng xuất");
    if (window.location.hash.startsWith("#admin")) route();
    return;
  }

  const cancelButton = target.closest("[data-cancel-order]");
  if (cancelButton) {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await api(`/orders/${cancelButton.dataset.cancelOrder}/cancel`, { method: "POST" });
      await loadCatalog();
      refreshStorePage();
      showToast("Đã hủy đơn hàng");
    } catch (error) {
      showToast(error.message);
    }
    await renderAccount();
    return;
  }

  const productFormButton = target.closest("[data-product-form]");
  if (productFormButton) {
    openProductForm(productFormButton.dataset.productForm);
    return;
  }

  const activeButton = target.closest("[data-product-active]");
  if (activeButton) {
    const isActive = activeButton.dataset.active === "true";
    if (!isActive && !window.confirm("Ẩn sản phẩm này? Khách sẽ không thấy và không mua được nữa.")) return;
    try {
      await api(`/admin/products/${activeButton.dataset.productActive}/active`, { method: "PATCH", body: { isActive } });
      await loadCatalog();
      await refreshAdminTab();
      showToast(isActive ? "Sản phẩm đã được bán lại" : "Đã ẩn sản phẩm");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const reviewHiddenButton = target.closest("[data-review-hidden]");
  if (reviewHiddenButton) {
    const isHidden = reviewHiddenButton.dataset.hidden === "true";
    try {
      await api(`/admin/reviews/${reviewHiddenButton.dataset.reviewHidden}`, { method: "PATCH", body: { isHidden } });
      await loadCatalog();
      await refreshAdminTab();
      showToast(isHidden ? "Đã ẩn đánh giá" : "Đã hiện lại đánh giá");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const categoryFormButton = target.closest("[data-category-form]");
  if (categoryFormButton) {
    openCategoryForm(categoryFormButton.dataset.categoryForm);
    return;
  }

  const categoryDeleteButton = target.closest("[data-category-delete]");
  if (categoryDeleteButton) {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      await api(`/admin/categories/${categoryDeleteButton.dataset.categoryDelete}`, { method: "DELETE" });
      await refreshAdminTab();
      showToast("Đã xóa danh mục");
    } catch (error) {
      showToast(error.message);
    }
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "product-search") {
    state.filters.q = event.target.value;
    history.replaceState(null, "", productsHash(state.filters));
    renderShopResults();
  }
});

document.addEventListener("change", async (event) => {
  if (event.target.id === "sort-products") {
    state.filters.sort = event.target.value;
    history.replaceState(null, "", productsHash(state.filters));
    renderShopResults();
    return;
  }

  const orderId = event.target.dataset?.orderStatus;
  if (orderId && event.target.value) {
    const status = event.target.value;
    if (status === "Đã hủy" && !window.confirm("Hủy đơn này? Tồn kho sẽ được hoàn lại.")) {
      event.target.value = "";
      return;
    }
    try {
      await api(`/admin/orders/${orderId}`, { method: "PATCH", body: { status } });
      await loadCatalog();
      showToast(`Đơn đã chuyển sang "${status}"`);
    } catch (error) {
      showToast(error.message);
    }
    await refreshAdminTab();
  }
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));

  if (form.id === "login-form") {
    await submitForm(form, async () => {
      const { user } = await api("/auth/login", { method: "POST", body: data });
      await afterAuth(user, "Đăng nhập thành công");
    });
  }

  if (form.id === "register-form") {
    await submitForm(form, async () => {
      const { user } = await api("/auth/register", { method: "POST", body: data });
      await afterAuth(user, "Tạo tài khoản thành công");
    });
  }

  if (form.id === "checkout-form") {
    await submitForm(form, async () => {
      try {
        const { order } = await api("/orders", { method: "POST", body: { ...data, items: state.cart } });
        state.cart = [];
        saveCart();
        await loadCatalog();
        refreshStorePage();
        showOrderSuccess(order);
      } catch (error) {
        // Hết phiên đăng nhập thì mời đăng nhập lại; hết hàng thì cập nhật giỏ theo tồn kho mới.
        if (error.status === 401) {
          state.user = null;
          updateUserUi();
          state.afterLogin = "checkout";
          openAccount(error.message);
          return;
        }
        if (error.status === 409) {
          await loadCatalog();
          refreshStorePage();
        }
        throw error;
      }
    });
  }

  if (form.id === "review-form") {
    await submitForm(form, async () => {
      await api(`/products/${form.dataset.product}/reviews`, { method: "POST", body: { rating: Number(data.rating), comment: data.comment } });
      await loadCatalog();
      refreshStorePage();
      showToast("Đã lưu đánh giá. Cảm ơn bạn!");
    });
  }

  if (form.id === "product-form") {
    await submitForm(form, async () => {
      const body = { ...data, specs: textToSpecs(data.specs), categoryId: Number(data.categoryId) };
      const id = form.dataset.id;
      await api(id ? `/admin/products/${id}` : "/admin/products", { method: id ? "PUT" : "POST", body });
      await loadCatalog();
      await refreshAdminTab();
      closeLayers();
      showToast(id ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
    });
  }

  if (form.id === "category-form") {
    await submitForm(form, async () => {
      const id = form.dataset.id;
      await api(id ? `/admin/categories/${id}` : "/admin/categories", { method: id ? "PUT" : "POST", body: data });
      await refreshAdminTab();
      closeLayers();
      showToast(id ? "Đã cập nhật danh mục" : "Đã thêm danh mục");
    });
  }
});

document.addEventListener("keydown", (event) => {
  const layer = openLayerElement();
  if (!layer) return;
  if (event.key === "Escape") {
    closeLayers();
    return;
  }
  // Giữ phím Tab trong hộp thoại đang mở.
  if (event.key === "Tab") {
    const items = focusableIn(layer);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

window.addEventListener("hashchange", () => route());

// ==== Khởi động ====
async function start() {
  updateCart();
  try {
    await Promise.all([loadCatalog(), loadUser()]);
    route();
  } catch (error) {
    app.innerHTML = messagePage("Không kết nối được máy chủ", "Hãy chạy lệnh npm start rồi mở http://localhost:3000.", "");
    console.error(error);
  }
}

start();
