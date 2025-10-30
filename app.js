/* app.js - Professional Billing UI
   Works with index.html & style.css provided earlier.
*/

// ---------- LocalStorage Keys ----------
const PRODUCTS_KEY = "products_v2";
const CART_KEY     = "cart_v2";
const BILLS_KEY    = "bills_v2";
const PROFILE_KEY  = "profile_v2";
const DARK_KEY     = "dark_v2";

// ---------- State ----------
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
let cart     = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let bills    = JSON.parse(localStorage.getItem(BILLS_KEY)) || [];
let profile  = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};

// ---------- Elements ----------
const productList      = document.getElementById("product-list");
const cartEl           = document.getElementById("cart");
const totalEl          = document.getElementById("total");
const billList         = document.getElementById("bill-list"); // last bill area
const historyList      = document.getElementById("history-list");

const headerTitle      = document.getElementById("header-title");
const headerSub        = document.getElementById("header-sub");
const headerOffer      = document.getElementById("header-offer");

const productNameInput = document.getElementById("product-name");
const productPriceInput= document.getElementById("product-price");
const productImgInput  = document.getElementById("product-img");
const emojiUpload      = document.getElementById("emoji-upload");
const searchInput      = document.getElementById("search");

const shopNameInput    = document.getElementById("shopNameInput");
const addressInput     = document.getElementById("addressInput");
const offerInput       = document.getElementById("offerInput");
const phoneInput       = document.getElementById("phoneInput");

const addProductBtn    = document.getElementById("add-product-btn");
const generateBillBtn  = document.getElementById("generate-bill-btn");
const printLastBillBtn = document.getElementById("print-last-bill");
const clearCartBtn     = document.getElementById("clear-cart-btn");
const clearCartBtnBottom     = document.getElementById("clear-cart-btn-bottom");

const saveProfileBtn   = document.getElementById("save-profile");
const clearShopBtn     = document.getElementById("clear-shop");
const clearAddressBtn  = document.getElementById("clear-address");
const clearOfferBtn    = document.getElementById("clear-offer");
const clearPhoneBtn    = document.getElementById("clear-phone");
const downloadHistoryPdfBtn = document.getElementById("download-history-pdf");
const clearHistoryBtn  = document.getElementById("clear-history");

// ---------- Helpers ----------
function saveData() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
function formatCurrency(n){ return "PKR " + Number(n).toFixed(2); }
function idNow(){ return Date.now().toString(); } // numeric-like id

// ---------- Render Products (card style like you wanted) ----------
function renderProducts(search = "") {
  productList.innerHTML = "";
  // filter produces a list view; we will attach data-id attributes and always find product by id
  const visible = products.filter(p => p.name.toLowerCase().includes((search || "").toLowerCase()));

  visible.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <div class="editDeleteBtn">
        <button data-action="delete" data-id="${p.id}" title="Delete">🗑️</button>
        <button data-action="edit" data-id="${p.id}" title="Edit">✎</button>
      </div>
      <div class="product-image">
        <img src="${p.image || ''}" alt="${p.name}" />
      </div>
      <div class="product-details">
        <h4 class="product-name">${p.name}</h4>
        <p class="product-price">Price: ${formatCurrency(p.price)}</p>
      </div>
      <div class="product-actions">
        <div class="qty-inline" style="align-items:center">
          <button class="qty-dec" data-id="${p.id}">−</button>
          <div id="qty-${p.id}" style="min-width:28px; text-align:center;">${p.tempQty || 0}</div>
          <button class="qty-inc" data-id="${p.id}">+</button>
        </div>
        <button class="addBtn" data-action="select" data-id="${p.id}">Add</button>
      </div>
    `;

    // single delegated click handler for this card
    div.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      const action = btn.dataset.action;        // e.g. "delete", "edit", "select" or undefined for qty buttons
      const id = btn.dataset.id;               // product id (string)
      if (!id) return;

      // find product index in main products array using id
      const idx = products.findIndex(x => String(x.id) === String(id));
      if (idx === -1) return; // product not found (shouldn't happen)

      // route actions
      if (action === "delete") return deleteProduct(idx);
      if (action === "edit")   return editProduct(idx);
      if (btn.classList.contains("qty-inc")) return increaseQtyById(id);
      if (btn.classList.contains("qty-dec")) return decreaseQtyById(id);
      if (action === "select") return selectProductById(id);
    });

    productList.appendChild(div);
  });
}

// increase / decrease using product id (keeps tempQty on product object)
function increaseQtyById(id){
  const idx = products.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return;
  products[idx].tempQty = (products[idx].tempQty || 0) + 1;
  const el = document.getElementById("qty-" + products[idx].id);
  if (el) el.innerText = products[idx].tempQty;
}

function decreaseQtyById(id){
  const idx = products.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return;
  products[idx].tempQty = Math.max(0, (products[idx].tempQty || 0) - 1);
  const el = document.getElementById("qty-" + products[idx].id);
  if (el) el.innerText = products[idx].tempQty;
}

// selectProduct by id (adds to cart). Keeps cart logic same as before but uses id mapping
function selectProductById(id){
  const idx = products.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return;
  const q = products[idx].tempQty || 1;
  if (q <= 0) return alert("Quantity must be at least 1.");
  const p = products[idx];
  const found = cart.find(x => x.name === p.name && x.price === p.price);
  if (found) found.quantity += q;
  else cart.push({ name: p.name, price: p.price, image: p.image || "", quantity: q });
  products[idx].tempQty = 0;
  saveData();
  renderProducts(searchInput.value);
  renderCart();
}




// ---------- Product operations ----------
function addProduct() {
  const name = (productNameInput.value || "").trim();
  const price = parseFloat(productPriceInput.value);
  if (!name || isNaN(price)) return alert("Enter valid product name and price.");

  const file = productImgInput.files && productImgInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // products.push({ name, price, image: reader.result });
      products.push({ id: Date.now().toString(), name, price, image: reader.result });
      productNameInput.value = "";
      productPriceInput.value = "";
      productImgInput.value = "";
      saveData();
      renderProducts(searchInput.value);
    };
    reader.readAsDataURL(file);
  } else {
    products.push({ id: Date.now().toString() , name, price });
    productNameInput.value = "";
    productPriceInput.value = "";
    saveData();
    renderProducts(searchInput.value);
  }
}

function editProduct(i) {
  const newName = prompt("Edit product name:", products[i].name);
  const newPrice = parseFloat(prompt("Edit product price:", products[i].price));
  if (newName && !isNaN(newPrice)) {
    products[i].name = newName;
    products[i].price = newPrice;
    saveData();
    renderProducts(searchInput.value);
  }
}

function deleteProduct(i) {
  if (!confirm("Delete this product?")) return;
  products.splice(i,1);
  saveData();
  renderProducts(searchInput.value);
}

function increaseQty(i){
  products[i].tempQty = (products[i].tempQty || 0) + 1;
  const el = document.getElementById("qty-"+i);
  if(el) el.innerText = products[i].tempQty;
}
function decreaseQty(i){
  products[i].tempQty = Math.max(0, (products[i].tempQty || 0) - 1);
  const el = document.getElementById("qty-"+i);
  if(el) el.innerText = products[i].tempQty;
}

// selectProduct (Add) - add current tempQty or 1 to cart
function selectProduct(i){
  const q = products[i].tempQty || 1;
  if (q <= 0) return alert("Quantity must be at least 1.");
  const p = products[i];
  const found = cart.find(x => x.name === p.name && x.price === p.price);
  if (found) found.quantity += q;
  else cart.push({ name: p.name, price: p.price, image: p.image||"", quantity: q });
  products[i].tempQty = 0;
  saveData();
  renderProducts(searchInput.value);
  renderCart();
}




// _____________________________________________________
// ---------- Cart rendering & actions ----------
function renderCart(){
  cartEl.innerHTML = "";
  let total = 0;
  cart.forEach((it, idx) => {
    total += it.price * it.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${it.image||''}" alt="${it.name}" />
      <div style="min-width:140px">${it.name}</div>
      <div>${formatCurrency(it.price)}</div>
      <div style="margin-left:6px">x ${it.quantity}</div>
      <div class="cart-actions">
        <button class="cart-dec" data-i="${idx}">−</button>
        <button class="cart-inc" data-i="${idx}">+</button>
        <button class="btn btn-danger cart-rem" data-i="${idx}">X</button>
      </div>
    `;
    div.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      if (btn.classList.contains("cart-inc")) return changeCartQty(i, +1);
      if (btn.classList.contains("cart-dec")) return changeCartQty(i, -1);
      if (btn.classList.contains("cart-rem")) return removeFromCart(i);
    });
    cartEl.appendChild(div);
  });
  totalEl.innerText = "Total: " + formatCurrency(total);
}

function changeCartQty(i, delta){
  if (!cart[i]) return;
  cart[i].quantity = Math.max(0, cart[i].quantity + delta);
  if (cart[i].quantity === 0) cart.splice(i,1);
  saveData();
  renderCart();
}
function removeFromCart(i){
  if (!cart[i]) return;
  cart.splice(i,1);
  saveData();
  renderCart();
}
function clearCart(){
  if (!confirm("Clear entire cart?")) return;
  cart = [];
  saveData();
  renderCart();
  billList.innerHTML = "";
}

// ---------- Bill generator (DOES NOT clear cart) ----------
function generateBill() {
  if (cart.length === 0) return alert("Cart is empty.");

  let total = 0;
  cart.forEach(it => total += it.price * it.quantity);

  const time = Date.now();
  const id = idNow();
  const billObj = {
    id,
    time,
    items: cart.map(it => ({ name: it.name, qty: it.quantity, price: it.price })),
    total,
    profile
  };

  bills.push(billObj);
  saveData();
  renderHistory();

  // Clear old content
  billList.innerHTML = "";

  // Create Bill Table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  // Shop Info
  table.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center; font-weight:bold; font-size:1.2rem; padding:8px;">
        ${profile.shopName || "Billing Software"}
      </td>
    </tr>
    <tr>
      <td colspan="4" style="text-align:center; padding:4px;">
        Phone: ${(profile.phones || []).join(" | ") || "-"} | Address: ${profile.address || "-"}
      </td>
    </tr>
    <tr>
      <td colspan="4" style="text-align:center; padding:4px;">
        ID: ${id} | ${new Date(time).toLocaleString()}
      </td>
    </tr>
    <tr>
      <th style="border:1px solid #ddd; padding:6px;">Item</th>
      <th style="border:1px solid #ddd; padding:6px; text-align:center;">Qty</th>
      <th style="border:1px solid #ddd; padding:6px; text-align:right;">Price</th>
      <th style="border:1px solid #ddd; padding:6px; text-align:right;">Total</th>
    </tr>
  `;

  // Add items
  cart.forEach(it => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="border:1px solid #ddd; padding:6px;">${it.name}</td>
      <td style="border:1px solid #ddd; padding:6px; text-align:center;">${it.quantity}</td>
      <td style="border:1px solid #ddd; padding:6px; text-align:right;">${it.price.toFixed(2)}</td>
      <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(it.price * it.quantity).toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });

  // Add total only ONCE
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="3" style="text-align:right; padding:6px; border-top:2px solid #000; font-weight:bold;">
      Total:
    </td>
    <td style="text-align:right; padding:6px; border-top:2px solid #000; font-weight:bold;">
      ${formatCurrency(total)}
    </td>
  `;
  table.appendChild(totalRow);

  // Add Offer if exists
  if (profile.offer) {
    const offerRow = document.createElement("tr");
    offerRow.innerHTML = `
      <td colspan="4" style="text-align:center; padding:8px; border-top:1px solid #ccc; font-style:italic;">
        ${profile.offer}
      </td>
    `;
    table.appendChild(offerRow);
  }

  billList.appendChild(table);

  // Print Button
  const btn = document.createElement("button");
  btn.textContent = "Print Bill";
  btn.className = "btn btn-primary no-print";
  btn.style.marginTop = "10px";
  btn.addEventListener("click", () => printBill(table));
  billList.appendChild(btn);
}

// ✅ Single clean print (no blank pages)
function printBill(content) {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          @page { margin: 10mm; }
          body {
            font-family: Arial, sans-serif;
            background: #fff;
            color: #000;
            margin: 0;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px;
            font-size: 14px;
          }
          th {
            background: #f5f5f5;
          }
          .no-print { display: none; }
        </style>
      </head>
      <body>
        ${content.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();

  // Wait till content loads, then print once
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
  //clear the bill table 
  billList.innerHTML = "";
  //clear the cart table
  cart = [];
  saveData();
  renderCart();
}

// ---------- History functions (printable PDF via print dialog) ----------
function renderHistory(){
  historyList.innerHTML = "";
  // display from newest to oldest
  bills.slice().reverse().forEach(b => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div style="font-weight:700">${b.id}</div>
      <div style="color:#6b7280">${new Date(b.time).toLocaleString()}</div>
      <div style="margin-left:auto">${formatCurrency(b.total)} <button class="btn" data-action="reprint" data-id="${b.id}">Reprint</button></div>
    `;
    div.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      if (btn.dataset.action === "reprint") reprintBill(btn.dataset.id);
    });
    historyList.appendChild(div);
  });
}

function reprintBill(id){
  const b = bills.find(x=> x.id === id);
  if (!b) return alert("Bill not found");
  // build table same as generateBill but from history object
  const t = document.createElement("table");
  t.style.width = "100%";
  t.innerHTML = `
    <thead>
      <tr><th colspan="4" style="text-align:center">${(b.profile && b.profile.shopName) || "Billing Software"}</th></tr>
      <tr><th colspan="4" style="text-align:center">Phone: ${((b.profile && b.profile.phones) || []).join(" | ")} | ${(b.profile && b.profile.address) || "-"}</th></tr>
      <tr><th colspan="4" style="text-align:center">ID: ${b.id} &nbsp;|&nbsp; ${new Date(b.time).toLocaleString()}</th></tr>
      <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");
  b.items.forEach(it => {
    const r = document.createElement("tr");
    r.innerHTML = `<td>${it.name}</td><td>${it.qty}</td><td>${Number(it.price).toFixed(2)}</td><td>${(it.qty * it.price).toFixed(2)}</td>`;
    tbody.appendChild(r);
  });
  t.appendChild(tbody);
  const foot = document.createElement("tfoot");
  foot.innerHTML = `<tr><td colspan="3" style="text-align:right">Total:</td><td>${Number(b.total).toFixed(2)}</td></tr>`;
  t.appendChild(foot);

  // print this bill immediately
  printHtmlForPrint(t.outerHTML);
}

// download history as printable PDF (we open a window with a table and call print)
function downloadHistoryPdf(){
  if (bills.length === 0) return alert("No history to download");

  const tbl = document.createElement("table");
  tbl.style.width = "100%";
  tbl.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Date / Time</th>
        <th>Total Bill</th>
      </tr>
    </thead>
  `;
  const tb = document.createElement("tbody");

  bills.forEach(b => {
    const r = document.createElement("tr");
    r.innerHTML = `
      <td>${b.id}</td>
      <td>${new Date(b.time).toLocaleString()}</td>
      <td>${formatCurrency(b.total)}</td>
    `;
    tb.appendChild(r);
  });

  tbl.appendChild(tb);

  // Use same print function with styling
  printHtmlForPrint(`
    <h2 style="text-align:center;">Billing History</h2>
    ${tbl.outerHTML}
  `);
}

// ---------- Profile handlers ----------
function loadProfileToForm(){
  shopNameInput.value = profile.shopName || "";
  addressInput.value = profile.address || "";
  offerInput.value = profile.offer || "";
  phoneInput.value = (profile.phones||[]).join(", ");
  renderHeader();
}
function renderHeader(){
  headerTitle.innerText = profile.shopName || "Billing Software";
  const phones = (profile.phones||[]).join(" | ");
  headerSub.innerText = `Phone: ${phones || "-"} | Address: ${profile.address || "-"}`;
  headerOffer.innerText = profile.offer || "";
}
function saveProfile(){
  profile.shopName = (shopNameInput.value || "").trim();
  profile.address = (addressInput.value || "").trim();
  profile.offer = (offerInput.value || "").trim();
  profile.phones = (phoneInput.value || "").split(",").map(s=>s.trim()).filter(Boolean);
  saveData();
  renderHeader();
  alert("Profile saved.");
}
function clearProfileField(key){
  if (!confirm("Clear this field?")) return;
  if (key === "shop") shopNameInput.value = "";
  if (key === "address") addressInput.value = "";
  if (key === "offer") offerInput.value = "";
  if (key === "phones") phoneInput.value = "";
  // persist
  profile.shopName = shopNameInput.value;
  profile.address = addressInput.value;
  profile.offer = offerInput.value;
  profile.phones = phoneInput.value.split(",").map(s=>s.trim()).filter(Boolean);
  saveData();
  renderHeader();
}

// ---------- Small utilities ----------
function downloadHistoryJson(){
  const blob = new Blob([JSON.stringify(bills, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "bill-history.json"; a.click(); URL.revokeObjectURL(url);
}
function clearHistory(){
  if (!confirm("Clear bill history?")) return;
  bills = [];
  saveData();
  renderHistory();
}

// ---------- Navigation & UI wiring ----------
document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=> {
    document.querySelectorAll(".nav-btn").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    document.querySelectorAll(".view").forEach(v=> v.style.display = "none");
    const el = document.getElementById("view-" + view);
    if (el) el.style.display = "block";
  });
});

// Dark mode toggle + persistence
const toggleDarkBtn = document.getElementById("toggle-dark");
if (localStorage.getItem(DARK_KEY) === "enabled") document.body.classList.add("dark-mode");
if (toggleDarkBtn) toggleDarkBtn.addEventListener("click", ()=>{
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(DARK_KEY, document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
});

// event wiring
if (addProductBtn) addProductBtn.addEventListener("click", addProduct);
if (generateBillBtn) generateBillBtn.addEventListener("click", generateBill);
if (printLastBillBtn) printLastBillBtn.addEventListener("click", ()=> {
  if (!billList.innerHTML) return alert("No bill to print.");
  printHtmlForPrint(billList.innerHTML);
});
if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);
if (clearCartBtnBottom) clearCartBtnBottom.addEventListener("click", clearCart);



if (saveProfileBtn) saveProfileBtn.addEventListener("click", saveProfile);
if (clearShopBtn) clearShopBtn.addEventListener("click", ()=> clearProfileField("shop"));
if (clearAddressBtn) clearAddressBtn.addEventListener("click", ()=> clearProfileField("address"));
if (clearOfferBtn) clearOfferBtn.addEventListener("click", ()=> clearProfileField("offer"));
if (clearPhoneBtn) clearPhoneBtn.addEventListener("click", ()=> clearProfileField("phones"));
if (downloadHistoryPdfBtn) downloadHistoryPdfBtn.addEventListener("click", downloadHistoryPdf);
if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);

// search input
if (searchInput) searchInput.addEventListener("input", ()=> renderProducts(searchInput.value));

// emoji triggers file input
if (emojiUpload && productImgInput) emojiUpload.addEventListener("click", ()=> productImgInput.click());

// optional: allow pressing Enter in product price/name to add quickly
[productNameInput, productPriceInput].forEach(inp => {
  if (!inp) return;
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProduct();
    }
  });
});

// ✅ Common Print Function (used by reprint & history download)
function printHtmlForPrint(html) {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          @page { margin: 10mm; }
          body {
            font-family: Arial, sans-serif;
            background: #fff;
            color: #000;
            margin: 0;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px;
            font-size: 14px;
          }
          th {
            background: #f5f5f5;
          }
          h2 { text-align: center; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
}





// ---------- Initial render ----------
renderProducts();
renderCart();
renderHistory();
loadProfileToForm();
