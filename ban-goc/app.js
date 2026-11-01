const products = [
  {
    id: 1,
    name: "Guitar Acoustic Yamaha F310",
    category: "Guitar",
    brand: "Yamaha",
    price: 3490000,
    oldPrice: 3890000,
    badge: "Bán chạy",
    rating: 4.9,
    stock: 12,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=85",
    description: "Mẫu guitar acoustic được yêu thích nhờ âm thanh cân bằng, phím đàn dễ chơi và độ bền cao. Phù hợp cho người mới bắt đầu lẫn người chơi lâu năm.",
    specs: { "Mặt đàn": "Gỗ Spruce", "Lưng và hông": "Gỗ Tonewood", "Dáng đàn": "Dreadnought", "Xuất xứ": "Indonesia" }
  },
  {
    id: 2,
    name: "Piano Điện Roland FP-10",
    category: "Piano",
    brand: "Roland",
    price: 12990000,
    oldPrice: 14500000,
    badge: "Giảm 10%",
    rating: 4.8,
    stock: 7,
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1000&q=85",
    description: "Piano điện nhỏ gọn với 88 phím nặng chuẩn, âm thanh SuperNATURAL chân thực và kết nối Bluetooth MIDI tiện lợi.",
    specs: { "Bàn phím": "88 phím PHA-4", "Âm sắc": "15 voices", "Công suất": "2 x 6W", "Kết nối": "Bluetooth MIDI" }
  },
  {
    id: 3,
    name: "Guitar Điện Fender Player Stratocaster",
    category: "Guitar",
    brand: "Fender",
    price: 21900000,
    oldPrice: null,
    badge: "Mới",
    rating: 4.9,
    stock: 4,
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=1000&q=85",
    description: "Âm thanh Fender đặc trưng, thiết kế biểu tượng và cảm giác chơi mượt mà. Một cây đàn linh hoạt cho nhiều thể loại âm nhạc.",
    specs: { "Thân đàn": "Alder", "Cần đàn": "Maple", "Pickup": "3 Player Series", "Số phím": "22" }
  },
  {
    id: 4,
    name: "Bộ Trống Cơ Pearl Roadshow",
    category: "Trống",
    brand: "Pearl",
    price: 15490000,
    oldPrice: 16900000,
    badge: "Ưu đãi",
    rating: 4.7,
    stock: 5,
    image: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1000&q=85",
    description: "Bộ trống đầy đủ cấu hình cho người mới, gồm hardware và cymbal. Chất âm mạnh mẽ, chắc chắn và dễ căn chỉnh.",
    specs: { "Số trống": "5 chiếc", "Chất liệu": "Poplar 9 lớp", "Cymbal": "Hi-hat + Crash", "Màu": "Jet Black" }
  },
  {
    id: 5,
    name: "Violin Scott Cao STV-017",
    category: "Violin",
    brand: "Scott Cao",
    price: 5850000,
    oldPrice: null,
    badge: "Gợi ý",
    rating: 4.8,
    stock: 9,
    image: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=1000&q=85",
    description: "Violin thủ công có âm sắc ấm, độ vang tốt và ngoại hình cổ điển. Đi kèm hộp đàn, vĩ và nhựa thông.",
    specs: { "Kích thước": "4/4", "Mặt đàn": "Gỗ Spruce", "Lưng đàn": "Gỗ Maple", "Phụ kiện": "Hộp + vĩ" }
  },
  {
    id: 6,
    name: "Ukulele Concert Enya Nova U",
    category: "Ukulele",
    brand: "Enya",
    price: 1890000,
    oldPrice: 2190000,
    badge: "Yêu thích",
    rating: 4.9,
    stock: 18,
    image: "https://images.unsplash.com/photo-1586199220052-58f013be3b8f?auto=format&fit=crop&w=1000&q=85",
    description: "Ukulele carbon chống nước với thiết kế hiện đại, âm thanh trong trẻo và trọng lượng rất nhẹ, lý tưởng để mang theo mọi nơi.",
    specs: { "Kích thước": "Concert 23 inch", "Chất liệu": "Carbon Fiber", "Dây": "Fluorocarbon", "Phụ kiện": "Bao + capo" }
  },
  {
    id: 7,
    name: "Keyboard Casio CT-S300",
    category: "Piano",
    brand: "Casio",
    price: 4790000,
    oldPrice: 5200000,
    badge: "Cho người mới",
    rating: 4.7,
    stock: 11,
    image: "https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=1000&q=85",
    description: "Keyboard 61 phím năng động, tích hợp 400 âm sắc và bánh xe pitch bend. Thiết kế tay cầm giúp di chuyển thuận tiện.",
    specs: { "Bàn phím": "61 phím", "Âm sắc": "400 tones", "Điệu đệm": "77 rhythms", "Nguồn": "Adapter hoặc pin" }
  },
  {
    id: 8,
    name: "Sáo Flute Yamaha YFL-222",
    category: "Nhạc cụ hơi",
    brand: "Yamaha",
    price: 15900000,
    oldPrice: null,
    badge: "Chính hãng",
    rating: 4.8,
    stock: 6,
    image: "https://images.unsplash.com/photo-1567184406952-9f6ba54cb614?auto=format&fit=crop&w=1000&q=85",
    description: "Flute tiêu chuẩn dành cho học sinh với thiết kế phím bấm thoải mái, phản hồi nhạy và âm thanh rõ ràng ở mọi quãng.",
    specs: { "Hệ thống": "Offset G", "Phím": "Covered keys", "Chất liệu": "Nickel silver", "E mechanism": "Có" }
  },
  {
    id: 9,
    name: "Loa Guitar Marshall MG15G",
    category: "Phụ kiện",
    brand: "Marshall",
    price: 3290000,
    oldPrice: 3600000,
    badge: "Phổ biến",
    rating: 4.6,
    stock: 14,
    image: "https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=1000&q=85",
    description: "Amp guitar 15W nhỏ gọn, hai kênh clean và overdrive cùng thiết kế Marshall cổ điển, phù hợp luyện tập tại nhà.",
    specs: { "Công suất": "15W", "Loa": "8 inch", "Kênh": "Clean + Overdrive", "Kết nối": "AUX + Headphone" }
  },
  {
    id: 10,
    name: "Guitar Classic Cordoba C5",
    category: "Guitar",
    brand: "Cordoba",
    price: 9990000,
    oldPrice: null,
    badge: "Cao cấp",
    rating: 4.9,
    stock: 3,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=85",
    description: "Guitar classic mặt gỗ Cedar nguyên tấm, mang lại âm thanh ấm áp và giàu sắc thái trong một thiết kế Tây Ban Nha tinh tế.",
    specs: { "Mặt đàn": "Solid Cedar", "Lưng hông": "Mahogany", "Cần đàn": "Mahogany", "Scale": "650mm" }
  },
  {
    id: 11,
    name: "Cajon Meinl Headliner",
    category: "Trống",
    brand: "Meinl",
    price: 2790000,
    oldPrice: 3100000,
    badge: "Giảm giá",
    rating: 4.7,
    stock: 15,
    image: "https://images.unsplash.com/photo-1571327073757-71d13c24de30?auto=format&fit=crop&w=1000&q=85",
    description: "Trống cajon có tiếng bass sâu và snare sắc nét, kích thước thoải mái cho các buổi biểu diễn acoustic và đường phố.",
    specs: { "Mặt trống": "MDF", "Dây snare": "Điều chỉnh được", "Chiều cao": "46cm", "Chân": "Cao su chống trượt" }
  },
  {
    id: 12,
    name: "Tai Nghe Kiểm Âm Audio-Technica M40x",
    category: "Phụ kiện",
    brand: "Audio-Technica",
    price: 2490000,
    oldPrice: 2790000,
    badge: "Studio",
    rating: 4.8,
    stock: 20,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
    description: "Tai nghe kiểm âm chuyên nghiệp với đáp tuyến phẳng, âm thanh chi tiết và thiết kế gập gọn dùng trong studio hoặc luyện nhạc.",
    specs: { "Driver": "40mm", "Tần số": "15–24.000Hz", "Trở kháng": "35 ohms", "Cáp": "Tháo rời" }
  }
];

const categories = [
  { name: "Guitar", image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=1200&q=85" },
  { name: "Piano", image: "https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=900&q=85" },
  { name: "Trống", image: "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?auto=format&fit=crop&w=900&q=85" },
  { name: "Violin", image: "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=900&q=85" },
  { name: "Ukulele", image: "https://images.unsplash.com/photo-1586199220052-58f013be3b8f?auto=format&fit=crop&w=900&q=85" }
];

const state = {
  cart: JSON.parse(localStorage.getItem("mocMusicCart") || "[]"),
  user: JSON.parse(localStorage.getItem("mocMusicUser") || "null"),
  orders: JSON.parse(localStorage.getItem("mocMusicOrders") || "[]"),
  activeCategory: "Tất cả",
  activeBrand: "Tất cả",
  searchTerm: "",
  sortBy: "featured"
};

const app = document.querySelector("#app");
const overlay = document.querySelector("#overlay");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");
const cartCount = document.querySelector("#cart-count");
const productModal = document.querySelector("#product-modal");
const accountModal = document.querySelector("#account-modal");
const checkoutModal = document.querySelector("#checkout-modal");
const accountContent = document.querySelector("#account-content");
const checkoutContent = document.querySelector("#checkout-content");
const toast = document.querySelector("#toast");
let toastTimer;

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function saveState() {
  localStorage.setItem("mocMusicCart", JSON.stringify(state.cart));
  localStorage.setItem("mocMusicUser", JSON.stringify(state.user));
  localStorage.setItem("mocMusicOrders", JSON.stringify(state.orders));
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function getProduct(productId) {
  return products.find((product) => product.id === Number(productId));
}

function productCard(product) {
  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image product-open" role="button" tabindex="0" aria-label="Xem ${product.name}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <button class="quick-add" type="button" data-add="${product.id}" aria-label="Thêm ${product.name} vào giỏ">+</button>
      </div>
      <div class="product-info product-open" role="button" tabindex="0">
        <div class="product-meta"><span>${product.brand}</span><span>★ ${product.rating}</span></div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">${formatCurrency(product.price)}${product.oldPrice ? `<span class="product-old-price">${formatCurrency(product.oldPrice)}</span>` : ""}</div>
      </div>
    </article>
  `;
}

function homePage() {
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
        <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=90" alt="Nghệ sĩ chơi guitar trong phòng thu">
        <div class="hero-note"><strong>Thử đàn miễn phí</strong>Ghé showroom và cảm nhận nhạc cụ phù hợp nhất với bạn.</div>
      </div>
    </section>

    <section class="benefits" aria-label="Lợi ích mua hàng">
      <div class="benefit"><span class="benefit-number">01</span><strong>Chính hãng 100%</strong><small>Nguồn gốc minh bạch</small></div>
      <div class="benefit"><span class="benefit-number">02</span><strong>Bảo hành tận tâm</strong><small>Hỗ trợ đến 24 tháng</small></div>
      <div class="benefit"><span class="benefit-number">03</span><strong>Giao hàng toàn quốc</strong><small>Đóng gói an toàn</small></div>
      <div class="benefit"><span class="benefit-number">04</span><strong>Tư vấn chuyên môn</strong><small>Đội ngũ nhạc công</small></div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><span class="eyebrow">Tìm thanh âm của bạn</span><h2 class="section-title">Mỗi nhạc cụ,<br>một câu chuyện.</h2></div>
        <a class="section-link" href="#products">Xem tất cả sản phẩm →</a>
      </div>
      <div class="category-grid">
        ${categories.map((category) => `
          <a class="category-card" href="#products?category=${encodeURIComponent(category.name)}">
            <img src="${category.image}" alt="Nhạc cụ ${category.name}" loading="lazy">
            <span class="category-label"><span><strong>${category.name}</strong><small>${products.filter((product) => product.category === category.name).length} sản phẩm</small></span><span class="category-arrow">→</span></span>
          </a>
        `).join("")}
      </div>
    </section>

    <section class="section" style="padding-top: 20px">
      <div class="section-heading">
        <div><span class="eyebrow">Được yêu thích nhất</span><h2 class="section-title">Nhạc cụ nổi bật</h2></div>
        <a class="section-link" href="#products">Mua sắm ngay →</a>
      </div>
      <div class="product-grid">${products.slice(0, 8).map(productCard).join("")}</div>
    </section>

    <section class="editorial">
      <div class="editorial-image"><img src="https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=1200&q=85" alt="Người nghệ sĩ biểu diễn guitar" loading="lazy"></div>
      <div class="editorial-copy">
        <div>
          <span class="eyebrow">Không chỉ là nhạc cụ</span>
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

function getFilteredProducts() {
  const filteredProducts = products.filter((product) => {
    const categoryMatch = state.activeCategory === "Tất cả" || product.category === state.activeCategory;
    const brandMatch = state.activeBrand === "Tất cả" || product.brand === state.activeBrand;
    const searchableText = `${product.name} ${product.category} ${product.brand}`.toLowerCase();
    const searchMatch = searchableText.includes(state.searchTerm.toLowerCase());
    return categoryMatch && brandMatch && searchMatch;
  });

  return [...filteredProducts].sort((firstProduct, secondProduct) => {
    if (state.sortBy === "price-low") return firstProduct.price - secondProduct.price;
    if (state.sortBy === "price-high") return secondProduct.price - firstProduct.price;
    if (state.sortBy === "rating") return secondProduct.rating - firstProduct.rating;
    return firstProduct.id - secondProduct.id;
  });
}

function shopPage() {
  const categoryNames = ["Tất cả", ...new Set(products.map((product) => product.category))];
  const brandNames = ["Tất cả", ...new Set(products.map((product) => product.brand))];
  return `
    <section class="page-hero">
      <span class="eyebrow">Bộ sưu tập Mộc Music</span>
      <h1>Chọn nhạc cụ.</h1>
      <p>Từ guitar, piano đến trống và phụ kiện — tất cả đều được chọn lọc để bạn tự tin bắt đầu hoặc tiến xa hơn trên hành trình âm nhạc.</p>
    </section>
    <section class="shop-layout">
      <aside class="filter-panel">
        <div class="filter-group"><h3>Danh mục</h3><div class="filter-options">
          ${categoryNames.map((category) => `<div class="filter-option ${state.activeCategory === category ? "active" : ""}"><button type="button" data-category="${category}">${category}</button><span>${category === "Tất cả" ? products.length : products.filter((product) => product.category === category).length}</span></div>`).join("")}
        </div></div>
        <div class="filter-group"><h3>Thương hiệu</h3><div class="filter-options">
          ${brandNames.map((brand) => `<div class="filter-option ${state.activeBrand === brand ? "active" : ""}"><button type="button" data-brand="${brand}">${brand}</button><span>${brand === "Tất cả" ? products.length : products.filter((product) => product.brand === brand).length}</span></div>`).join("")}
        </div></div>
      </aside>
      <div>
        <div class="shop-toolbar">
          <label class="shop-search"><span>⌕</span><input id="product-search" type="search" value="${state.searchTerm}" placeholder="Tìm đàn, thương hiệu..."></label>
          <select id="sort-products" aria-label="Sắp xếp sản phẩm">
            <option value="featured" ${state.sortBy === "featured" ? "selected" : ""}>Nổi bật</option>
            <option value="price-low" ${state.sortBy === "price-low" ? "selected" : ""}>Giá thấp đến cao</option>
            <option value="price-high" ${state.sortBy === "price-high" ? "selected" : ""}>Giá cao đến thấp</option>
            <option value="rating" ${state.sortBy === "rating" ? "selected" : ""}>Đánh giá cao</option>
          </select>
        </div>
        <div id="shop-results"></div>
      </div>
    </section>
  `;
}

function renderShopResults() {
  const results = document.querySelector("#shop-results");
  if (!results) return;
  const filteredProducts = getFilteredProducts();
  results.innerHTML = `
    <div class="result-count">Hiển thị ${filteredProducts.length} sản phẩm</div>
    ${filteredProducts.length ? `<div class="product-grid">${filteredProducts.map(productCard).join("")}</div>` : `<div class="empty-state"><h3>Chưa tìm thấy sản phẩm</h3><p>Hãy thử từ khóa hoặc bộ lọc khác nhé.</p><button class="button-dark" type="button" id="clear-filters">Xóa bộ lọc</button></div>`}
  `;
}

function aboutPage() {
  return `
    <section class="about-hero">
      <div class="about-hero-copy">
        <div><span class="eyebrow">Câu chuyện Mộc Music</span><h1 class="section-title">Âm nhạc bắt đầu từ một rung động.</h1><p>Ra đời từ tình yêu dành cho âm nhạc, Mộc Music mong muốn giúp mỗi người tìm thấy nhạc cụ thật sự phù hợp với mình.</p></div>
      </div>
      <div class="about-hero-image"><img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85" alt="Ban nhạc biểu diễn cùng nhau"></div>
    </section>
    <section class="about-story">
      <div><span class="eyebrow">Từ năm 2018</span><h2>Đúng nhạc cụ.<br>Đúng cảm hứng.</h2></div>
      <div><p>Mộc Music bắt đầu từ một cửa hàng nhỏ nơi những người yêu nhạc có thể thử đàn, trò chuyện và học hỏi lẫn nhau. Chúng tôi hiểu rằng mua nhạc cụ không chỉ là chọn một món đồ — đó là chọn một người bạn đồng hành lâu dài.</p><p>Ngày nay, Mộc phục vụ khách hàng trên toàn quốc với hàng trăm sản phẩm chính hãng. Dù bạn đang tìm cây guitar đầu tiên, nâng cấp bộ trống hay xây dựng phòng thu riêng, đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và tư vấn.</p><div class="button-row" style="margin-top: 28px"><a class="button-primary" href="#products">Khám phá sản phẩm</a><a class="button-secondary" href="tel:19001234">Gọi 1900 1234</a></div></div>
    </section>
    <section class="benefits"><div class="benefit"><span class="benefit-number">8+</span><strong>Năm kinh nghiệm</strong><small>Trong ngành nhạc cụ</small></div><div class="benefit"><span class="benefit-number">12K</span><strong>Khách hàng</strong><small>Đã tin tưởng Mộc</small></div><div class="benefit"><span class="benefit-number">30+</span><strong>Thương hiệu</strong><small>Chính hãng quốc tế</small></div><div class="benefit"><span class="benefit-number">4.9</span><strong>Điểm đánh giá</strong><small>Từ cộng đồng</small></div></section>
  `;
}

function adminPage() {
  const revenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = state.orders.length ? state.orders.slice().reverse() : [
    { id: "MM24018", customer: "Nguyễn Minh Anh", date: "24/10/2026", total: 3490000, status: "Đang giao" },
    { id: "MM24017", customer: "Trần Quốc Huy", date: "23/10/2026", total: 12990000, status: "Đã xác nhận" },
    { id: "MM24016", customer: "Lê Thanh Hà", date: "22/10/2026", total: 1890000, status: "Hoàn thành" }
  ];
  return `
    <section class="page-hero"><span class="eyebrow">Khu vực quản trị mô phỏng</span><h1>Tổng quan.</h1><p>Theo dõi hoạt động cửa hàng, đơn hàng và sản phẩm tại một nơi.</p></section>
    <section class="admin-page">
      <div class="admin-stats">
        <div class="stat-card"><small>Doanh thu demo</small><strong>${revenue ? formatCurrency(revenue) : "18,3 triệu"}</strong></div>
        <div class="stat-card"><small>Đơn hàng</small><strong>${state.orders.length || 36}</strong></div>
        <div class="stat-card"><small>Sản phẩm</small><strong>${products.length}</strong></div>
        <div class="stat-card"><small>Khách hàng</small><strong>${state.user ? 127 : 126}</strong></div>
      </div>
      <div class="admin-grid">
        <div class="admin-card"><h3>Đơn hàng gần đây</h3><table class="admin-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>${recentOrders.slice(0, 6).map((order) => `<tr><td>#${order.id}</td><td>${order.customer}</td><td>${order.date}</td><td>${formatCurrency(order.total)}</td><td><span class="status-pill">${order.status}</span></td></tr>`).join("")}</tbody></table></div>
        <div class="admin-card"><h3>Danh mục bán chạy</h3><div class="bar-list"><div><div class="bar-label"><span>Guitar</span><strong>42%</strong></div><div class="bar-track"><div class="bar-fill" style="width:42%"></div></div></div><div><div class="bar-label"><span>Piano & Keyboard</span><strong>28%</strong></div><div class="bar-track"><div class="bar-fill" style="width:28%"></div></div></div><div><div class="bar-label"><span>Trống & Bộ gõ</span><strong>17%</strong></div><div class="bar-track"><div class="bar-fill" style="width:17%"></div></div></div><div><div class="bar-label"><span>Phụ kiện</span><strong>13%</strong></div><div class="bar-track"><div class="bar-fill" style="width:13%"></div></div></div></div></div>
      </div>
    </section>
  `;
}

function policyPage() {
  return `
    <section class="page-hero"><span class="eyebrow">An tâm mua sắm</span><h1>Chính sách.</h1><p>Những thông tin quan trọng về giao hàng, đổi trả và bảo hành tại Mộc Music.</p></section>
    <article class="policy-content"><h2>Giao hàng</h2><p>Mộc Music giao hàng trên toàn quốc. Đơn từ 2.000.000đ được miễn phí giao hàng tiêu chuẩn. Thời gian dự kiến từ 1–3 ngày tại nội thành và 3–7 ngày tại các tỉnh.</p><h2>Đổi trả</h2><p>Sản phẩm được hỗ trợ đổi trong vòng 7 ngày khi có lỗi kỹ thuật từ nhà sản xuất hoặc giao sai sản phẩm. Nhạc cụ cần còn nguyên tình trạng, phụ kiện và bao bì đi kèm.</p><h2>Bảo hành</h2><p>Tất cả sản phẩm chính hãng được bảo hành từ 6 đến 24 tháng tùy thương hiệu. Mộc Music hỗ trợ tiếp nhận, kiểm tra và gửi bảo hành trong suốt thời gian sử dụng.</p><h2>Hỗ trợ</h2><p>Liên hệ hotline 1900 1234 hoặc email hello@mocmusic.vn để được tư vấn. Thời gian hỗ trợ từ 8:30 đến 21:00 mỗi ngày.</p></article>
  `;
}

function setActiveNavigation(page) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === page);
  });
}

function route() {
  const hashValue = window.location.hash.slice(1) || "home";
  const [page, queryString] = hashValue.split("?");
  const query = new URLSearchParams(queryString || "");

  if (page === "products") {
    state.activeCategory = query.get("category") || state.activeCategory;
    app.innerHTML = shopPage();
    renderShopResults();
  } else if (page === "about") {
    app.innerHTML = aboutPage();
  } else if (page === "admin") {
    app.innerHTML = adminPage();
  } else if (page === "policy") {
    app.innerHTML = policyPage();
  } else {
    app.innerHTML = homePage();
  }

  setActiveNavigation(page);
  document.querySelector(".mobile-menu").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function addToCart(productId, quantity = 1) {
  const existingItem = state.cart.find((item) => item.productId === Number(productId));
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({ productId: Number(productId), quantity });
  }
  saveState();
  updateCart();
  showToast("Đã thêm sản phẩm vào giỏ hàng");
}

function updateCart() {
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  cartCount.textContent = itemCount;

  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="cart-empty"><div><span class="cart-empty-symbol">♫</span><strong>Giỏ hàng đang trống</strong><p>Hãy chọn một nhạc cụ bạn yêu thích nhé.</p><a class="button-dark" href="#products" data-close="cart">Khám phá sản phẩm</a></div></div>`;
    cartSummary.innerHTML = "";
    return;
  }

  cartItems.innerHTML = state.cart.map((item) => {
    const product = getProduct(item.productId);
    if (!product) return "";
    return `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><h4>${product.name}</h4><span class="cart-item-price">${formatCurrency(product.price)}</span><div class="quantity-control"><button type="button" data-quantity="-1" data-product="${product.id}">−</button><span>${item.quantity}</span><button type="button" data-quantity="1" data-product="${product.id}">+</button></div></div><button class="remove-item" type="button" data-remove="${product.id}" aria-label="Xóa ${product.name}">×</button></div>`;
  }).join("");

  const shipping = subtotal >= 2000000 ? 0 : 30000;
  cartSummary.innerHTML = `<div class="summary-line"><span>Tạm tính</span><strong>${formatCurrency(subtotal)}</strong></div><div class="summary-line"><span>Phí giao hàng</span><strong>${shipping ? formatCurrency(shipping) : "Miễn phí"}</strong></div><div class="summary-line summary-total"><span>Tổng cộng</span><span>${formatCurrency(subtotal + shipping)}</span></div><button class="button-primary button-full" type="button" id="checkout-button">Tiến hành thanh toán</button>`;
}

function openLayer(layer) {
  closeLayers();
  overlay.classList.add("open");
  layer.classList.add("open");
  document.body.classList.add("locked");
}

function closeLayers() {
  overlay.classList.remove("open");
  cartDrawer.classList.remove("open");
  productModal.classList.remove("open");
  accountModal.classList.remove("open");
  checkoutModal.classList.remove("open");
  document.body.classList.remove("locked");
}

function openProduct(productId) {
  const product = getProduct(productId);
  if (!product) return;
  productModal.innerHTML = `
    <button class="close-button modal-close" type="button" data-close="modal" aria-label="Đóng">×</button>
    <div class="product-modal-grid">
      <div class="product-modal-image"><img src="${product.image}" alt="${product.name}"></div>
      <div class="product-modal-info">
        <span class="eyebrow">${product.category} · ${product.brand}</span>
        <h2>${product.name}</h2>
        <div class="modal-price">${formatCurrency(product.price)}${product.oldPrice ? `<span class="product-old-price">${formatCurrency(product.oldPrice)}</span>` : ""}</div>
        <p class="product-description">${product.description}</p>
        <div class="spec-table">${Object.entries(product.specs).map(([label, value]) => `<div class="spec-row"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
        <div class="stock-note">✓ Còn ${product.stock} sản phẩm — sẵn sàng giao hàng</div>
        <button class="button-primary button-full" type="button" data-add="${product.id}">Thêm vào giỏ hàng</button>
      </div>
    </div>`;
  openLayer(productModal);
}

function renderAccount(isRegister = false) {
  if (state.user) {
    accountContent.innerHTML = `<div class="user-welcome"><div class="user-avatar">${state.user.name.charAt(0).toUpperCase()}</div><span class="eyebrow">Tài khoản của bạn</span><h2>Xin chào, ${state.user.name.split(" ").slice(-1)[0]}!</h2><p class="form-intro">${state.user.email}</p><div class="order-list"><strong>Đơn hàng gần đây</strong>${state.orders.length ? state.orders.slice().reverse().map((order) => `<div class="order-mini"><strong>#${order.id}</strong> · ${order.date}<br>${formatCurrency(order.total)} · ${order.status}</div>`).join("") : `<p class="form-intro">Bạn chưa có đơn hàng nào.</p>`}</div><button class="button-secondary button-full" type="button" id="logout-button">Đăng xuất</button></div>`;
    return;
  }

  accountContent.innerHTML = isRegister ? `
    <span class="eyebrow">Thành viên Mộc Music</span><h2>Tạo tài khoản</h2><p class="form-intro">Lưu đơn hàng và nhận những ưu đãi dành riêng cho bạn.</p>
    <form id="register-form"><div class="form-group"><label>Họ và tên</label><input name="name" required placeholder="Nguyễn Văn An"></div><div class="form-group"><label>Email</label><input name="email" type="email" required placeholder="ban@email.com"></div><div class="form-group"><label>Mật khẩu</label><input name="password" type="password" minlength="6" required placeholder="Tối thiểu 6 ký tự"></div><button class="button-primary button-full" type="submit">Đăng ký</button></form>
    <div class="form-switch">Đã có tài khoản? <button type="button" data-account-view="login">Đăng nhập</button></div>` : `
    <span class="eyebrow">Chào mừng trở lại</span><h2>Đăng nhập</h2><p class="form-intro">Dùng email bất kỳ để trải nghiệm tài khoản demo.</p>
    <form id="login-form"><div class="form-group"><label>Email</label><input name="email" type="email" required placeholder="ban@email.com"></div><div class="form-group"><label>Mật khẩu</label><input name="password" type="password" required placeholder="••••••••"></div><button class="button-primary button-full" type="submit">Đăng nhập</button></form>
    <div class="form-switch">Chưa có tài khoản? <button type="button" data-account-view="register">Đăng ký ngay</button></div>`;
}

function openAccount() {
  renderAccount();
  openLayer(accountModal);
}

function getCartTotal() {
  const subtotal = state.cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  return subtotal + (subtotal >= 2000000 ? 0 : 30000);
}

function openCheckout() {
  if (!state.cart.length) return;
  const total = getCartTotal();
  checkoutContent.innerHTML = `
    <span class="eyebrow">Bước cuối cùng</span><h2>Thanh toán</h2><p class="form-intro">Điền thông tin nhận hàng để hoàn tất đơn mua.</p>
    <form id="checkout-form"><div class="checkout-grid"><div><div class="form-group"><label>Họ và tên</label><input name="name" required value="${state.user?.name || ""}" placeholder="Nguyễn Văn An"></div><div class="form-group"><label>Số điện thoại</label><input name="phone" required pattern="[0-9]{9,11}" placeholder="0901234567"></div><div class="form-group"><label>Địa chỉ nhận hàng</label><textarea name="address" required placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"></textarea></div><div class="form-group"><label>Phương thức thanh toán</label><select name="payment"><option>Thanh toán khi nhận hàng</option><option>Chuyển khoản ngân hàng</option><option>Ví điện tử</option></select></div></div><aside class="checkout-summary"><h3>Đơn hàng</h3>${state.cart.map((item) => { const product = getProduct(item.productId); return `<div class="checkout-product"><span>${product.name} × ${item.quantity}</span><strong>${formatCurrency(product.price * item.quantity)}</strong></div>`; }).join("")}<div class="summary-line summary-total"><span>Tổng cộng</span><span>${formatCurrency(total)}</span></div><button class="button-primary button-full" type="submit">Xác nhận đặt hàng</button></aside></div></form>`;
  openLayer(checkoutModal);
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const productOpen = event.target.closest(".product-open");
  const productCardElement = event.target.closest("[data-product-id]");

  if (addButton) {
    event.stopPropagation();
    addToCart(addButton.dataset.add);
    if (productModal.classList.contains("open")) closeLayers();
    return;
  }

  if (productOpen && productCardElement) {
    openProduct(productCardElement.dataset.productId);
    return;
  }

  if (event.target.closest(".cart-button")) {
    updateCart();
    openLayer(cartDrawer);
  }

  if (event.target.closest(".account-button")) openAccount();

  if (event.target.closest(".menu-button")) {
    const mobileMenu = document.querySelector(".mobile-menu");
    mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!mobileMenu.classList.contains("open")));
  }

  if (event.target.closest(".search-toggle")) {
    window.location.hash = "products";
    window.setTimeout(() => document.querySelector("#product-search")?.focus(), 100);
  }

  if (event.target.matches("[data-close]") || event.target.closest("[data-close]")) closeLayers();

  if (event.target === overlay) closeLayers();

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.activeCategory = categoryButton.dataset.category;
    app.innerHTML = shopPage();
    renderShopResults();
  }

  const brandButton = event.target.closest("[data-brand]");
  if (brandButton) {
    state.activeBrand = brandButton.dataset.brand;
    app.innerHTML = shopPage();
    renderShopResults();
  }

  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const cartItem = state.cart.find((item) => item.productId === Number(quantityButton.dataset.product));
    if (cartItem) {
      cartItem.quantity += Number(quantityButton.dataset.quantity);
      if (cartItem.quantity <= 0) state.cart = state.cart.filter((item) => item !== cartItem);
      saveState();
      updateCart();
    }
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    state.cart = state.cart.filter((item) => item.productId !== Number(removeButton.dataset.remove));
    saveState();
    updateCart();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng");
  }

  if (event.target.closest("#checkout-button")) openCheckout();

  const accountViewButton = event.target.closest("[data-account-view]");
  if (accountViewButton) renderAccount(accountViewButton.dataset.accountView === "register");

  if (event.target.closest("#logout-button")) {
    state.user = null;
    saveState();
    closeLayers();
    showToast("Bạn đã đăng xuất");
  }

  if (event.target.closest("#clear-filters")) {
    state.activeCategory = "Tất cả";
    state.activeBrand = "Tất cả";
    state.searchTerm = "";
    app.innerHTML = shopPage();
    renderShopResults();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "product-search") {
    state.searchTerm = event.target.value;
    renderShopResults();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "sort-products") {
    state.sortBy = event.target.value;
    renderShopResults();
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();

  if (event.target.id === "newsletter-form") {
    event.target.reset();
    showToast("Cảm ơn bạn đã đăng ký nhận bản tin!");
  }

  if (event.target.id === "login-form") {
    const formData = new FormData(event.target);
    const email = formData.get("email");
    state.user = { name: email.split("@")[0], email };
    saveState();
    renderAccount();
    showToast("Đăng nhập thành công");
  }

  if (event.target.id === "register-form") {
    const formData = new FormData(event.target);
    state.user = { name: formData.get("name"), email: formData.get("email") };
    saveState();
    renderAccount();
    showToast("Tạo tài khoản thành công");
  }

  if (event.target.id === "checkout-form") {
    const formData = new FormData(event.target);
    const order = {
      id: `MM${Date.now().toString().slice(-6)}`,
      customer: formData.get("name"),
      date: new Date().toLocaleDateString("vi-VN"),
      total: getCartTotal(),
      status: "Đã xác nhận",
      items: [...state.cart]
    };
    state.orders.push(order);
    state.cart = [];
    saveState();
    updateCart();
    closeLayers();
    showToast(`Đặt hàng thành công! Mã đơn #${order.id}`);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLayers();
});

window.addEventListener("hashchange", route);

updateCart();
route();
