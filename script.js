
let cart = [];


document.addEventListener("DOMContentLoaded", function () {
  setupSearch();
  setupCartIcon();
  setupCartSidebar();
  addCartButtons();
});

// ─── 1. SEARCH FUNCTIONALITY ──────────────────
function setupSearch() {
  const searchInput = document.querySelector("input[type='text']");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const products = document.querySelectorAll(".rate1");

    products.forEach(function (product) {
      const title = product.querySelector("h1");
      if (!title) return;

      const name = title.textContent.toLowerCase();
      if (query === "" || name.includes(query)) {
        product.style.display = "block";
        // Highlight matching text
        if (query !== "") {
          const regex = new RegExp("(" + query + ")", "gi");
          title.innerHTML = title.textContent.replace(
            regex,
            '<mark style="background:#ff3f6c;color:white;border-radius:3px;">$1</mark>'
          );
        } else {
          title.innerHTML = title.textContent; // reset
        }
      } else {
        product.style.display = "none";
      }
    });
  });
}

// ─── 2. ADD "ADD TO CART" BUTTONS ─────────────
function addCartButtons() {
  const products = document.querySelectorAll(".rate1");

  products.forEach(function (product) {
    // Avoid adding duplicate buttons
    if (product.querySelector(".add-to-cart-btn")) return;

    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";
    btn.className = "add-to-cart-btn";
    btn.style.cssText = `
      margin-top: 10px;
      padding: 8px 16px;
      background-color: #9c27b0;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      transition: background 0.2s;
    `;

    btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "#7b1fa2");
    btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "#9c27b0");

    btn.addEventListener("click", function () {
      const title = product.querySelector("h1")?.textContent || "Product";
      const price = product.querySelector("p")?.textContent || "$0";
      const imgSrc = product.querySelector("img")?.src || "";

      addToCart({ title, price, imgSrc });
      showToast(`"${title}" added to cart!`);
    });

    product.appendChild(btn);
  });
}

// ─── 3. CART LOGIC ────────────────────────────
function addToCart(item) {
  const existing = cart.find((i) => i.title === item.title);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCartBadge();
  renderCartSidebar();
}

function removeFromCart(title) {
  cart = cart.filter((i) => i.title !== title);
  updateCartBadge();
  renderCartSidebar();
}

function updateCartBadge() {
  let badge = document.getElementById("cart-badge");
  const cartIcon = document.querySelector(".bi-cart-dash");
  if (!cartIcon) return;

  const total = cart.reduce((sum, i) => sum + i.qty, 0);

  if (!badge) {
    // Create badge if it doesn't exist
    const wrapper = cartIcon.parentElement;
    wrapper.style.position = "relative";
    badge = document.createElement("span");
    badge.id = "cart-badge";
    badge.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff3f6c;
      color: white;
      border-radius: 50%;
      font-size: 11px;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    `;
    wrapper.appendChild(badge);
  }

  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
}

// ─── 4. CART SIDEBAR ──────────────────────────
function setupCartSidebar() {
  // Create sidebar HTML
  const sidebar = document.createElement("div");
  sidebar.id = "cart-sidebar";
  sidebar.innerHTML = `
    <div id="cart-overlay" style="
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.4); z-index:999; display:none;
    "></div>
    <div id="cart-panel" style="
      position:fixed; top:0; right:-400px; width:360px; height:100%;
      background:white; z-index:1000; box-shadow:-4px 0 20px rgba(0,0,0,0.2);
      transition: right 0.3s ease; display:flex; flex-direction:column;
      font-family: Arial, sans-serif;
    ">
      <div style="display:flex; justify-content:space-between; align-items:center;
                  padding:20px; background:#6a0dad; color:white;">
        <h2 style="margin:0; font-size:20px;">🛒 My Cart</h2>
        <button id="close-cart" style="background:none; border:none; color:white;
                font-size:24px; cursor:pointer;">✕</button>
      </div>
      <div id="cart-items" style="flex:1; overflow-y:auto; padding:15px;"></div>
      <div id="cart-footer" style="padding:20px; border-top:1px solid #eee;">
        <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold; margin-bottom:15px;">
          <span>Total:</span>
          <span id="cart-total" style="color:#ff3f6c;">$0</span>
        </div>
        <button onclick="alert('Order placed! 🎉')" style="
          width:100%; padding:12px; background:#ff3f6c; color:white;
          border:none; border-radius:8px; font-size:16px; cursor:pointer;
          font-weight:bold;
        ">Checkout</button>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Close on overlay click
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("close-cart").addEventListener("click", closeCart);
}

function setupCartIcon() {
  const cartIcon = document.querySelector(".bi-cart-dash");
  if (!cartIcon) return;

  // Make the icon's parent a relative wrapper for the badge
  const wrapper = cartIcon.parentElement;
  wrapper.style.position = "relative";
  wrapper.style.cursor = "pointer";

  wrapper.addEventListener("click", toggleCart);
}

function toggleCart() {
  const panel = document.getElementById("cart-panel");
  const overlay = document.getElementById("cart-overlay");
  if (!panel) return;

  const isOpen = panel.style.right === "0px";
  panel.style.right = isOpen ? "-400px" : "0px";
  overlay.style.display = isOpen ? "none" : "block";
}

function closeCart() {
  const panel = document.getElementById("cart-panel");
  const overlay = document.getElementById("cart-overlay");
  if (panel) panel.style.right = "-400px";
  if (overlay) overlay.style.display = "none";
}

function renderCartSidebar() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; margin-top:60px; color:#999;">
        <div style="font-size:50px;">🛒</div>
        <p style="margin-top:10px;">Your cart is empty</p>
      </div>`;
    if (totalEl) totalEl.textContent = "$0";
    return;
  }

  container.innerHTML = cart.map((item) => `
    <div style="display:flex; align-items:center; gap:12px; padding:12px 0;
                border-bottom:1px solid #f0f0f0;">
      <img src="${item.imgSrc}" style="width:60px; height:70px; object-fit:cover; border-radius:8px;">
      <div style="flex:1;">
        <p style="margin:0; font-weight:bold; font-size:14px;">${item.title}</p>
        <p style="margin:4px 0; color:#ff3f6c; font-weight:bold;">${item.price}</p>
        <p style="margin:0; color:#666; font-size:13px;">Qty: ${item.qty}</p>
      </div>
      <button onclick="removeFromCart('${item.title}')" style="
        background:none; border:none; color:#ff3f6c;
        font-size:20px; cursor:pointer;">🗑️</button>
    </div>
  `).join("");

  // Calculate total (strip $ and sum)
  const total = cart.reduce((sum, item) => {
    const num = parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.qty;
    return sum + num;
  }, 0);

  if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
}

// ─── 5. TOAST NOTIFICATION ────────────────────
function showToast(message) {
  let toast = document.getElementById("toast-msg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-msg";
    toast.style.cssText = `
      position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
      background:#333; color:white; padding:12px 24px; border-radius:30px;
      font-size:14px; z-index:9999; opacity:0; transition:opacity 0.3s;
      white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}