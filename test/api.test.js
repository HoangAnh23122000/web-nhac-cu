// Kiểm thử tự động các nghiệp vụ chính: npm test
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const config = require("../server/config");
const { openDb } = require("../server/db");
const { seed } = require("../server/seed");
const { createApp } = require("../server/app");

let server;
let baseUrl;
let db;

// Mỗi "client" giữ cookie riêng, giống một trình duyệt riêng.
function client() {
  let cookie = "";
  return async function call(method, path, body) {
    const response = await fetch(baseUrl + path, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    return { status: response.status, data: await response.json().catch(() => null), setCookie };
  };
}

let userCounter = 0;
async function newCustomer() {
  const call = client();
  const email = `khach${++userCounter}@test.vn`;
  const result = await call("POST", "/api/auth/register", { name: "Khách Test", email, password: "matkhau123" });
  assert.equal(result.status, 201);
  return call;
}

async function admin() {
  const call = client();
  const result = await call("POST", "/api/auth/login", { email: config.admin.email, password: config.admin.password });
  assert.equal(result.status, 200);
  return call;
}

const shippingInfo = { customerName: "Nguyễn Văn A", phone: "0901234567", address: "1 Lê Lợi, Quận 1, TP.HCM" };
const stockOf = (id) => db.prepare("SELECT stock FROM products WHERE id = ?").get(id).stock;
const priceOf = (id) => db.prepare("SELECT price FROM products WHERE id = ?").get(id).price;

before(async () => {
  db = openDb(":memory:");
  seed(db);
  await new Promise((resolve) => {
    server = createApp(db, { authRateLimit: 100000 }).listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  db.close();
});

test("danh mục công khai trả về sản phẩm và không cần đăng nhập", async () => {
  const { status, data } = await client()("GET", "/api/catalog");
  assert.equal(status, 200);
  assert.equal(data.products.length, 12);
  assert.equal(data.categories.length, 7);
  assert.deepEqual(data.shipping, config.shipping);
});

test("đăng ký: mật khẩu được băm, không lưu dạng thô", async () => {
  const call = client();
  const { status, data, setCookie } = await call("POST", "/api/auth/register", { name: "An", email: "An@Test.vn", password: "matkhau123" });
  assert.equal(status, 201);
  assert.equal(data.user.role, "customer");
  assert.equal(data.user.password_hash, undefined);
  assert.match(setCookie, /HttpOnly/i);
  const row = db.prepare("SELECT password_hash FROM users WHERE email = 'an@test.vn'").get();
  assert.notEqual(row.password_hash, "matkhau123");
  assert.match(row.password_hash, /^\$2[aby]\$/);
});

test("đăng ký: không cho tự đặt quyền admin", async () => {
  const { data } = await client()("POST", "/api/auth/register", { name: "Hacker", email: "hack@test.vn", password: "matkhau123", role: "admin" });
  assert.equal(data.user.role, "customer");
});

test("đăng ký: từ chối email trùng, email sai và mật khẩu ngắn", async () => {
  const call = client();
  const body = { name: "B", email: "trung@test.vn", password: "matkhau123" };
  assert.equal((await call("POST", "/api/auth/register", body)).status, 201);
  assert.equal((await client()("POST", "/api/auth/register", { ...body, email: "TRUNG@test.vn" })).status, 409);
  assert.equal((await client()("POST", "/api/auth/register", { ...body, email: "khong-hop-le" })).status, 400);
  assert.equal((await client()("POST", "/api/auth/register", { ...body, email: "c@test.vn", password: "123" })).status, 400);
});

test("đăng nhập: sai mật khẩu bị từ chối, đúng thì vào được, đăng xuất thì mất phiên", async () => {
  const call = client();
  const email = config.demoCustomer.email;
  assert.equal((await call("POST", "/api/auth/login", { email, password: "sai-mat-khau" })).status, 401);
  assert.equal((await call("POST", "/api/auth/login", { email: "khongco@test.vn", password: "x" })).status, 401);
  assert.equal((await call("POST", "/api/auth/login", { email, password: config.demoCustomer.password })).status, 200);
  assert.equal((await call("GET", "/api/auth/me")).data.user.email, email);
  await call("POST", "/api/auth/logout");
  assert.equal((await call("GET", "/api/auth/me")).data.user, null);
});

test("phân quyền: khách và người lạ không vào được quản trị", async () => {
  const stranger = client();
  const customer = await newCustomer();
  for (const path of ["/api/admin/stats", "/api/admin/orders", "/api/admin/products", "/api/admin/customers"]) {
    assert.equal((await stranger("GET", path)).status, 401, path);
    assert.equal((await customer("GET", path)).status, 403, path);
  }
  assert.equal((await customer("POST", "/api/admin/products", { name: "x" })).status, 403);
  assert.equal((await (await admin())("GET", "/api/admin/stats")).status, 200);
});

test("đặt hàng: bắt buộc đăng nhập", async () => {
  const { status } = await client()("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 1, quantity: 1 }] });
  assert.equal(status, 401);
});

test("đặt hàng: giá do máy chủ tính, bỏ qua giá trình duyệt gửi lên", async () => {
  const call = await newCustomer();
  const { status, data } = await call("POST", "/api/orders", {
    ...shippingInfo, total: 1, items: [{ productId: 1, quantity: 2, price: 1 }]
  });
  assert.equal(status, 201);
  assert.equal(data.order.subtotal, priceOf(1) * 2);
  assert.equal(data.order.shippingFee, 0);
  assert.equal(data.order.total, priceOf(1) * 2);
  assert.equal(data.order.status, "Chờ xác nhận");
  assert.equal(data.order.paymentMethod, "COD");
  assert.match(data.order.code, /^MM\d{6}$/);
});

test("đặt hàng: đơn lưu đủ thông tin giao hàng và giữ giá lúc mua", async () => {
  const call = await newCustomer();
  const adminCall = await admin();
  const before = priceOf(5);
  const { data } = await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 5, quantity: 1 }] });
  assert.equal(data.order.phone, shippingInfo.phone);
  assert.equal(data.order.address, shippingInfo.address);

  db.prepare("UPDATE products SET price = price + 1000 WHERE id = 5").run();
  const { data: orders } = await adminCall("GET", "/api/admin/orders");
  const saved = orders.orders.find((order) => order.id === data.order.id);
  assert.equal(saved.items[0].unitPrice, before);
  db.prepare("UPDATE products SET price = ? WHERE id = 5").run(before);
});

test("đặt hàng: tính phí giao hàng khi đơn dưới ngưỡng miễn phí", async () => {
  const call = await newCustomer();
  const id = Number(db.prepare("INSERT INTO products (name, category_id, brand, price, stock) VALUES ('Dây đàn', 1, 'Test', 100000, 5)").run().lastInsertRowid);
  const { data } = await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: id, quantity: 1 }] });
  assert.equal(data.order.shippingFee, config.shipping.fee);
  assert.equal(data.order.total, 100000 + config.shipping.fee);
});

test("tồn kho: trừ khi đặt, không cho mua quá số còn lại", async () => {
  const call = await newCustomer();
  const id = Number(db.prepare("INSERT INTO products (name, category_id, brand, price, stock) VALUES ('Hàng ít', 1, 'Test', 3000000, 3)").run().lastInsertRowid);

  const tooMany = await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: id, quantity: 4 }] });
  assert.equal(tooMany.status, 409);
  assert.equal(stockOf(id), 3);

  assert.equal((await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: id, quantity: 2 }] })).status, 201);
  assert.equal(stockOf(id), 1);
});

test("tồn kho: nhiều người cùng mua món cuối thì chỉ một người được", async () => {
  const id = Number(db.prepare("INSERT INTO products (name, category_id, brand, price, stock) VALUES ('Món cuối', 1, 'Test', 3000000, 1)").run().lastInsertRowid);
  const customers = await Promise.all(Array.from({ length: 5 }, newCustomer));
  const results = await Promise.all(customers.map((call) =>
    call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: id, quantity: 1 }] })));
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 4);
  assert.equal(stockOf(id), 0);
});

test("tồn kho: lỗi ở một sản phẩm thì không trừ kho sản phẩm khác trong đơn", async () => {
  const call = await newCustomer();
  const start = stockOf(2);
  const { status } = await call("POST", "/api/orders", {
    ...shippingInfo, items: [{ productId: 2, quantity: 1 }, { productId: 3, quantity: 99 }]
  });
  assert.equal(status, 409);
  assert.equal(stockOf(2), start);
});

test("đặt hàng: từ chối dữ liệu không hợp lệ", async () => {
  const call = await newCustomer();
  const item = [{ productId: 1, quantity: 1 }];
  const invalid = [
    { ...shippingInfo, phone: "123", items: item },
    { ...shippingInfo, customerName: "   ", items: item },
    { ...shippingInfo, address: "", items: item },
    { ...shippingInfo, items: [] },
    { ...shippingInfo, items: [{ productId: 1, quantity: 0 }] },
    { ...shippingInfo, items: [{ productId: 1, quantity: -5 }] },
    { ...shippingInfo, items: [{ productId: 1, quantity: 1.5 }] },
    { ...shippingInfo, items: [{ productId: "abc", quantity: 1 }] }
  ];
  for (const body of invalid) assert.equal((await call("POST", "/api/orders", body)).status, 400, JSON.stringify(body));
  assert.equal((await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 99999, quantity: 1 }] })).status, 409);
});

test("đơn hàng: khách chỉ thấy và chỉ hủy được đơn của mình", async () => {
  const owner = await newCustomer();
  const other = await newCustomer();
  const { data } = await owner("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 1, quantity: 1 }] });
  assert.equal((await owner("GET", "/api/orders/mine")).data.orders.length, 1);
  assert.equal((await other("GET", "/api/orders/mine")).data.orders.length, 0);
  assert.equal((await other("POST", `/api/orders/${data.order.id}/cancel`)).status, 404);
});

test("đơn hàng: khách hủy đơn chờ xác nhận thì hoàn kho; đã xác nhận thì không tự hủy được", async () => {
  const call = await newCustomer();
  const adminCall = await admin();
  const start = stockOf(4);

  const first = (await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 4, quantity: 2 }] })).data.order;
  assert.equal(stockOf(4), start - 2);
  assert.equal((await call("POST", `/api/orders/${first.id}/cancel`)).data.order.status, "Đã hủy");
  assert.equal(stockOf(4), start);
  assert.equal((await call("POST", `/api/orders/${first.id}/cancel`)).status, 409);
  assert.equal(stockOf(4), start, "hủy lần hai không được cộng kho thêm");

  const second = (await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 4, quantity: 1 }] })).data.order;
  await adminCall("PATCH", `/api/admin/orders/${second.id}`, { status: "Đã xác nhận" });
  assert.equal((await call("POST", `/api/orders/${second.id}/cancel`)).status, 409);
});

test("quản trị: đơn đi đúng quy trình trạng thái và doanh thu chỉ tính đơn hoàn thành", async () => {
  const call = await newCustomer();
  const adminCall = await admin();
  const revenueBefore = (await adminCall("GET", "/api/admin/stats")).data.revenue;
  const { order } = (await call("POST", "/api/orders", { ...shippingInfo, items: [{ productId: 6, quantity: 2 }] })).data;
  const path = `/api/admin/orders/${order.id}`;

  assert.equal((await adminCall("PATCH", path, { status: "Hoàn thành" })).status, 409, "không được nhảy cóc");
  assert.equal((await adminCall("PATCH", path, { status: "Bừa" })).status, 400);
  assert.equal((await adminCall("PATCH", path, { status: "Đã xác nhận" })).status, 200);
  assert.equal((await adminCall("PATCH", path, { status: "Đang giao" })).status, 200);
  assert.equal((await adminCall("GET", "/api/admin/stats")).data.revenue, revenueBefore);
  assert.equal((await adminCall("PATCH", path, { status: "Hoàn thành" })).status, 200);
  assert.equal((await adminCall("GET", "/api/admin/stats")).data.revenue, revenueBefore + order.total);
  assert.equal((await adminCall("PATCH", path, { status: "Đã hủy" })).status, 409, "đơn hoàn thành không hủy được");
});

test("quản trị: thêm, sửa, ẩn sản phẩm; sản phẩm ẩn không bán được nhưng đơn cũ vẫn còn", async () => {
  const adminCall = await admin();
  const customer = await newCustomer();
  const product = { name: "Kèn Test", categoryId: 6, brand: "Test", price: 2500000, oldPrice: "", stock: 5, image: "images/p-flute.jpg", description: "Mô tả", specs: { "Chất liệu": "Đồng" } };

  const created = await adminCall("POST", "/api/admin/products", product);
  assert.equal(created.status, 201);
  const id = created.data.product.id;
  assert.equal(created.data.product.category, "Nhạc cụ hơi");
  assert.deepEqual(created.data.product.specs, { "Chất liệu": "Đồng" });

  assert.equal((await adminCall("PUT", `/api/admin/products/${id}`, { ...product, price: 2000000 })).data.product.price, 2000000);
  assert.equal((await adminCall("POST", "/api/admin/products", { ...product, price: -1 })).status, 400);
  assert.equal((await adminCall("POST", "/api/admin/products", { ...product, image: "javascript:alert(1)" })).status, 400);
  assert.equal((await adminCall("POST", "/api/admin/products", { ...product, categoryId: 9999 })).status, 400);

  const order = (await customer("POST", "/api/orders", { ...shippingInfo, items: [{ productId: id, quantity: 1 }] })).data.order;
  await adminCall("PATCH", `/api/admin/products/${id}/active`, { isActive: false });

  assert.ok(!(await client()("GET", "/api/catalog")).data.products.some((p) => p.id === id));
  assert.equal((await customer("POST", "/api/orders", { ...shippingInfo, items: [{ productId: id, quantity: 1 }] })).status, 409);
  assert.equal((await customer("GET", "/api/orders/mine")).data.orders.find((o) => o.id === order.id).items[0].name, "Kèn Test");
});

test("quản trị: danh mục đang có sản phẩm thì không xóa được, tên không được trùng", async () => {
  const adminCall = await admin();
  assert.equal((await adminCall("DELETE", "/api/admin/categories/1")).status, 409);
  assert.equal((await adminCall("POST", "/api/admin/categories", { name: "guitar" })).status, 409);
  const { data } = await adminCall("POST", "/api/admin/categories", { name: "Danh mục tạm" });
  assert.equal((await adminCall("PUT", `/api/admin/categories/${data.category.id}`, { name: "Đã đổi tên" })).data.category.name, "Đã đổi tên");
  assert.equal((await adminCall("DELETE", `/api/admin/categories/${data.category.id}`)).status, 200);
});

test("bảo mật: danh sách khách hàng không chứa mật khẩu; lỗi JSON trả về 400; có header bảo mật", async () => {
  const adminCall = await admin();
  const { data } = await adminCall("GET", "/api/admin/customers");
  assert.ok(data.customers.length > 0);
  assert.ok(data.customers.every((c) => c.password_hash === undefined));

  const broken = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{hong" });
  assert.equal(broken.status, 400);

  const page = await fetch(`${baseUrl}/`);
  assert.match(page.headers.get("content-security-policy"), /script-src 'self'/);
});
