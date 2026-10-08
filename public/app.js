/**
 * Royal Spice - Client-side JavaScript
 * Handles Menu filtering, Cart operations, API calls, Table Reservations, and Admin View
 */

// Application State
const state = {
  menu: [],
  cart: JSON.parse(localStorage.getItem('royal_spice_cart') || '[]'),
  currentCategory: 'all',
  searchQuery: '',
  vegOnly: false
};

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const categoryTabs = document.getElementById('category-tabs');
const menuSearch = document.getElementById('menu-search');
const vegOnlyFilter = document.getElementById('veg-only-filter');

const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartBody = document.getElementById('cart-body');

const billSubtotal = document.getElementById('bill-subtotal');
const billTax = document.getElementById('bill-tax');
const billDelivery = document.getElementById('bill-delivery');
const billTotal = document.getElementById('bill-total');

const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const cancelCheckoutBtn = document.getElementById('cancel-checkout-btn');

const reservationForm = document.getElementById('reservation-form');
const resDateInput = document.getElementById('res-date');

const contactForm = document.getElementById('contact-form');

const successModal = document.getElementById('success-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalDetails = document.getElementById('modal-details');
const modalCloseBtn = document.getElementById('modal-close-btn');

const openAdminBtn = document.getElementById('open-admin-btn');
const adminModal = document.getElementById('admin-modal');
const adminCloseBtn = document.getElementById('admin-close-btn');
const adminRefreshBtn = document.getElementById('admin-refresh-btn');
const tabOrdersBtn = document.getElementById('tab-orders-btn');
const tabReservationsBtn = document.getElementById('tab-reservations-btn');
const adminOrdersView = document.getElementById('admin-orders-view');
const adminReservationsView = document.getElementById('admin-reservations-view');
const adminOrdersTbody = document.getElementById('admin-orders-tbody');
const adminReservationsTbody = document.getElementById('admin-reservations-tbody');
const adminOrdersCount = document.getElementById('admin-orders-count');
const adminResCount = document.getElementById('admin-res-count');

const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');
const toastContainer = document.getElementById('toast-container');

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  setupDatePicker();
  fetchMenu();
  updateCartUI();
  setupEventListeners();
});

// Set minimum date for table reservation to today
function setupDatePicker() {
  if (resDateInput) {
    const today = new Date().toISOString().split('T')[0];
    resDateInput.min = today;
    resDateInput.value = today;
  }
}

// ================= TOAST NOTIFICATION =================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= API CALLS =================

// Fetch Menu Items from Backend
async function fetchMenu() {
  try {
    const res = await fetch('/api/menu');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      state.menu = result.data;
      renderMenu();
    } else {
      throw new Error('Menu load failed');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    menuGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
        <p>Could not connect to backend server. Make sure node server is running!</p>
      </div>
    `;
  }
}

// ================= MENU RENDERING =================
function renderMenu() {
  let filtered = state.menu.filter(item => {
    const matchesCategory = state.currentCategory === 'all' || item.category === state.currentCategory;
    const matchesSearch = item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesVeg = state.vegOnly ? item.type === 'veg' : true;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-bowl-food"></i>
        <p>No dishes found matching your criteria. Try another filter!</p>
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = filtered.map(item => {
    const isVeg = item.type === 'veg';
    const dietIcon = isVeg 
      ? '<i class="fa-solid fa-leaf text-veg"></i> <span class="text-veg">VEG</span>'
      : '<i class="fa-solid fa-drumstick-bite text-nonveg"></i> <span class="text-nonveg">NON-VEG</span>';

    return `
      <div class="food-card" data-id="${item.id}">
        <div class="food-img-wrapper">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="food-diet-badge">${dietIcon}</div>
          ${item.popular ? '<div class="food-popular-badge"><i class="fa-solid fa-star"></i> Bestseller</div>' : ''}
        </div>
        <div class="food-info">
          <div class="food-header">
            <h3 class="food-name">${item.name}</h3>
            <span class="food-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
          </div>
          <p class="food-desc">${item.description}</p>
          <div class="food-footer">
            <span class="food-price">₹${item.price}</span>
            <button class="add-cart-btn" onclick="addToCart(${item.id})">
              <i class="fa-solid fa-cart-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= CART LOGIC =================
window.addToCart = function(productId) {
  const item = state.menu.find(m => m.id === productId);
  if (!item) return;

  const existingIndex = state.cart.findIndex(c => c.id === productId);
  if (existingIndex > -1) {
    state.cart[existingIndex].qty += 1;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${item.name}" to cart!`, 'success');
};

function updateCartQty(productId, delta) {
  const itemIndex = state.cart.findIndex(c => c.id === productId);
  if (itemIndex === -1) return;

  state.cart[itemIndex].qty += delta;
  if (state.cart[itemIndex].qty <= 0) {
    state.cart.splice(itemIndex, 1);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(c => c.id !== productId);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart', 'error');
}

function saveCart() {
  localStorage.setItem('royal_spice_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadgeCount.textContent = totalCount;

  if (state.cart.length === 0) {
    cartBody.innerHTML = `
      <div class="empty-cart-view">
        <i class="fa-solid fa-bag-shopping"></i>
        <h3>Your Cart is Empty</h3>
        <p>Explore our menu and add your favourite delicacies!</p>
      </div>
    `;
    billSubtotal.textContent = '₹0';
    billTax.textContent = '₹0';
    billDelivery.textContent = '₹0';
    billTotal.textContent = '₹0';
    proceedCheckoutBtn.disabled = true;
    proceedCheckoutBtn.style.opacity = '0.5';
    checkoutForm.classList.add('hidden');
    return;
  }

  proceedCheckoutBtn.disabled = false;
  proceedCheckoutBtn.style.opacity = '1';

  // Render items
  cartBody.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
      </div>
      <button class="remove-item-btn" onclick="removeFromCart(${item.id})" aria-label="Remove item">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');

  // Calculate bill
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const delivery = subtotal >= 500 ? 0 : 40; // Free delivery over 500
  const grandTotal = subtotal + tax + delivery;

  billSubtotal.textContent = `₹${subtotal}`;
  billTax.textContent = `₹${tax}`;
  billDelivery.textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
  billTotal.textContent = `₹${grandTotal}`;
}

// Expose handlers to window for inline onclick attributes
window.updateCartQty = updateCartQty;
window.removeFromCart = removeFromCart;

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });

  // Cart open / close
  cartToggleBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
  });

  const closeCart = () => {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
    checkoutForm.classList.add('hidden');
    proceedCheckoutBtn.classList.remove('hidden');
  };

  cartCloseBtn.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  // Category filter tabs
  categoryTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      state.currentCategory = e.target.getAttribute('data-category');
      renderMenu();
    }
  });

  // Search input
  menuSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderMenu();
  });

  // Veg toggle
  vegOnlyFilter.addEventListener('change', (e) => {
    state.vegOnly = e.target.checked;
    renderMenu();
  });

  // Proceed to Checkout
  proceedCheckoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    checkoutForm.classList.remove('hidden');
    proceedCheckoutBtn.classList.add('hidden');
  });

  cancelCheckoutBtn.addEventListener('click', () => {
    checkoutForm.classList.add('hidden');
    proceedCheckoutBtn.classList.remove('hidden');
  });

  // Submit Order Form
  checkoutForm.addEventListener('submit', handlePlaceOrder);

  // Submit Table Reservation
  reservationForm.addEventListener('submit', handleTableReservation);

  // Contact form
  contactForm.addEventListener('submit', handleContactSubmit);

  // Modal close
  modalCloseBtn.addEventListener('click', () => {
    successModal.classList.remove('open');
  });

  // Admin Modal Controls
  openAdminBtn.addEventListener('click', openAdminDashboard);
  adminCloseBtn.addEventListener('click', () => adminModal.classList.remove('open'));
  adminRefreshBtn.addEventListener('click', loadAdminData);

  tabOrdersBtn.addEventListener('click', () => {
    tabOrdersBtn.classList.add('active');
    tabReservationsBtn.classList.remove('active');
    adminOrdersView.classList.remove('hidden');
    adminReservationsView.classList.add('hidden');
  });

  tabReservationsBtn.addEventListener('click', () => {
    tabReservationsBtn.classList.add('active');
    tabOrdersBtn.classList.remove('active');
    adminReservationsView.classList.remove('hidden');
    adminOrdersView.classList.add('hidden');
  });
}

// ================= PLACE ORDER =================
async function handlePlaceOrder(e) {
  e.preventDefault();
  if (state.cart.length === 0) return;

  const submitBtn = document.getElementById('place-order-submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...';

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const total = subtotal + tax + deliveryFee;

  const orderPayload = {
    customer: { name, phone, address, paymentMethod },
    items: state.cart,
    subtotal,
    tax,
    deliveryFee,
    total
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const result = await res.json();
    if (result.success) {
      // Clear Cart
      state.cart = [];
      saveCart();
      updateCartUI();
      checkoutForm.reset();
      checkoutForm.classList.add('hidden');
      proceedCheckoutBtn.classList.remove('hidden');
      cartDrawer.classList.remove('open');
      cartBackdrop.classList.remove('open');

      // Show confirmation
      modalTitle.textContent = '🎉 Order Placed Successfully!';
      modalMessage.textContent = `Thank you ${name}! Your order has been placed and is currently being prepared.`;
      modalDetails.innerHTML = `
        <p><strong>Order ID:</strong> ${result.order.id}</p>
        <p><strong>Total Amount:</strong> ₹${result.order.total}</p>
        <p><strong>Payment Mode:</strong> ${result.order.customer.paymentMethod}</p>
        <p><strong>Delivery Address:</strong> ${result.order.customer.address}</p>
        <p><strong>Status:</strong> <span class="status-badge status-preparing">${result.order.status}</span></p>
      `;
      successModal.classList.add('open');
      showToast('Order received! Thank you!', 'success');
    } else {
      showToast(result.message || 'Failed to place order', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Network error while placing order.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm & Place Order';
  }
}

// ================= TABLE RESERVATION =================
async function handleTableReservation(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('book-submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Booking...';

  const reservationData = {
    name: document.getElementById('res-name').value.trim(),
    phone: document.getElementById('res-phone').value.trim(),
    email: document.getElementById('res-email').value.trim(),
    guests: document.getElementById('res-guests').value,
    date: document.getElementById('res-date').value,
    time: document.getElementById('res-time').value,
    seatingType: document.getElementById('res-seating').value,
    specialRequest: document.getElementById('res-special').value.trim()
  };

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });

    const result = await res.json();
    if (result.success) {
      reservationForm.reset();
      setupDatePicker();

      modalTitle.textContent = '🍽️ Table Reserved Successfully!';
      modalMessage.textContent = `Greetings ${result.reservation.name}! We look forward to hosting you.`;
      modalDetails.innerHTML = `
        <p><strong>Booking ID:</strong> ${result.reservation.id}</p>
        <p><strong>Date & Time:</strong> ${result.reservation.date} at ${result.reservation.time}</p>
        <p><strong>Guests:</strong> ${result.reservation.guests} Persons</p>
        <p><strong>Seating Preference:</strong> ${result.reservation.seatingType}</p>
        <p><strong>Booking Status:</strong> <span class="status-badge status-confirmed">${result.reservation.status}</span></p>
      `;
      successModal.classList.add('open');
      showToast('Table booked successfully!', 'success');
    } else {
      showToast(result.message || 'Booking failed', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Server error while booking table.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm Table Reservation';
  }
}

// ================= CONTACT FORM =================
async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const result = await res.json();
    showToast(result.message || 'Message sent successfully!', 'success');
    contactForm.reset();
  } catch (err) {
    showToast('Failed to send message.', 'error');
  }
}

// ================= ADMIN DASHBOARD =================
function openAdminDashboard() {
  adminModal.classList.add('open');
  loadAdminData();
}

async function loadAdminData() {
  try {
    // 1. Fetch Orders
    const ordersRes = await fetch('/api/orders');
    const ordersData = await ordersRes.json();
    const orders = ordersData.data || [];
    adminOrdersCount.textContent = orders.length;

    if (orders.length === 0) {
      adminOrdersTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 30px;">No food orders placed yet. Place one from the menu!</td></tr>`;
    } else {
      adminOrdersTbody.innerHTML = orders.map(ord => {
        const itemsSummary = ord.items.map(i => `${i.name} (x${i.qty})`).join(', ');
        const dateStr = new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
          <tr>
            <td><strong>${ord.id}</strong></td>
            <td>${ord.customer.name}<br><small style="color:#64748b">${ord.customer.phone}</small></td>
            <td><small>${itemsSummary}</small></td>
            <td><strong>₹${ord.total}</strong></td>
            <td><span class="status-badge status-preparing">${ord.status}</span></td>
            <td>${dateStr}</td>
          </tr>
        `;
      }).join('');
    }

    // 2. Fetch Reservations
    const resRes = await fetch('/api/reservations');
    const resData = await resRes.json();
    const reservations = resData.data || [];
    adminResCount.textContent = reservations.length;

    if (reservations.length === 0) {
      adminReservationsTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 30px;">No table reservations booked yet. Book one from the table section!</td></tr>`;
    } else {
      adminReservationsTbody.innerHTML = reservations.map(r => `
        <tr>
          <td><strong>${r.id}</strong></td>
          <td>${r.name}</td>
          <td>${r.phone}</td>
          <td>${r.date} @ ${r.time}</td>
          <td>${r.guests} Pax</td>
          <td><small>${r.seatingType}</small></td>
          <td><span class="status-badge status-confirmed">${r.status}</span></td>
        </tr>
      `).join('');
    }

  } catch (err) {
    console.error('Error fetching admin data:', err);
  }
}
