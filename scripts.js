const products = [
    { id: 1, name: "Product 1", price: 10, stock: 5, description: "Description of product 1", image: "https://via.placeholder.com/150", sku: "SKU1" },
    { id: 2, name: "Product 2", price: 20, stock: 3, description: "Description of product 2", image: "https://via.placeholder.com/150", sku: "SKU2" },
    { id: 3, name: "Product 3", price: 30, stock: 7, description: "Description of product 3", image: "https://via.placeholder.com/150", sku: "SKU3" },
];

let cart = [];

function renderProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = products
        .map(
            (product) => `
    <div class="card">
      <img src="${product.image}" class="card-img-top" alt="${product.name}">
      <div class="card-body">
        <h5 class="card-title">${product.name}</h5>
        <p class="card-text">${product.description}</p>
        <p class="card-text">Price: $${product.price}</p>
        <p class="card-text">Stock: ${product.stock}</p>
        <p class="card-text">SKU: ${product.sku}</p>
        <button class="btn btn-primary add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
      </div>
    </div>
  `
        )
        .join("");

    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", (event) => {
            const productId = parseInt(event.target.getAttribute("data-id"));
            addToCart(productId);
        });
    });
}

function renderCart() {
    const cartList = document.getElementById("cart-list");
    cartList.innerHTML = cart
        .map(
            (item) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <img src="${item.image}" alt="${item.name}" width="50">
      ${item.name} - $${item.price} (x${item.quantity})
      <button class="btn btn-danger btn-sm remove-from-cart" data-id="${item.id}">Remove</button>
    </li>
  `
        )
        .join("");

    document.querySelectorAll(".remove-from-cart").forEach((button) => {
        button.addEventListener("click", (event) => {
            const productId = parseInt(event.target.getAttribute("data-id"));
            removeFromCart(productId);
        });
    });

    updateTotalAmount();
    updateCartCount();
    renderCheckoutCart();
}

function renderCheckoutCart() {
    const checkoutCartList = document.getElementById("checkout-cart-list");
    checkoutCartList.innerHTML = cart
        .map(
            (item) => `
    <li class="list-group-item">
      <img src="${item.image}" alt="${item.name}" width="50">
      ${item.name} - $${item.price} (x${item.quantity})
      <button class="btn btn-danger btn-sm remove-all-from-cart" data-id="${item.id}">Remove All</button>
      <button class="btn btn-secondary btn-sm decrease-quantity" data-id="${item.id}">-</button>
      <button class="btn btn-secondary btn-sm increase-quantity" data-id="${item.id}">+</button>
    </li>
  `
        )
        .join("");

    document.querySelectorAll(".remove-all-from-cart").forEach((button) => {
        button.addEventListener("click", (event) => {
            const productId = parseInt(event.target.getAttribute("data-id"));
            removeAllFromCart(productId);
        });
    });

    document.querySelectorAll(".decrease-quantity").forEach((button) => {
        button.addEventListener("click", (event) => {
            const productId = parseInt(event.target.getAttribute("data-id"));
            updateCartQuantity(productId, -1);
        });
    });

    document.querySelectorAll(".increase-quantity").forEach((button) => {
        button.addEventListener("click", (event) => {
            const productId = parseInt(event.target.getAttribute("data-id"));
            updateCartQuantity(productId, 1);
        });
    });
}

function addToCart(productId) {
    const product = products.find((p) => p.id === productId);
    const cartItem = cart.find((item) => item.id === productId);

    if (product.stock > 0) {
        if (cartItem) {
            if (cartItem.quantity < product.stock + cartItem.quantity) {
                cartItem.quantity += 1;
                product.stock -= 1;
            } else {
                alert("No more stock available");
            }
        } else {
            cart.push({ ...product, quantity: 1 });
            product.stock -= 1;
        }
    } else {
        alert("No more stock available");
    }

    renderProducts();
    renderCart();
}

function removeFromCart(productId) {
    const cartItem = cart.find((item) => item.id === productId);
    const product = products.find((p) => p.id === productId);

    if (cartItem) {
        product.stock += cartItem.quantity;
        cart = cart.filter((item) => item.id !== productId);
    }

    renderProducts();
    renderCart();
}

function removeAllFromCart(productId) {
    removeFromCart(productId);
}

function updateCartQuantity(productId, amount) {
    const cartItem = cart.find((item) => item.id === productId);
    const product = products.find((p) => p.id === productId);

    if (cartItem && product) {
        if (amount > 0) {
            if (product.stock >= amount) {
                cartItem.quantity += amount;
                product.stock -= amount;
            } else {
                alert("No more stock available");
            }
        } else if (amount < 0) {
            if (cartItem.quantity > 1) {
                cartItem.quantity += amount;
                product.stock -= amount;
            } else if (cartItem.quantity === 1) {
                removeFromCart(productId);
            }
        }
    }

    renderProducts();
    renderCart();
}

function updateTotalAmount() {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("total-amount").textContent = totalAmount ? `Total: $${totalAmount}` : '';
}

function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`Your total is $${total}. Thank you for your purchase!`);

    cart = [];
    renderProducts();
    renderCart();
}

document.getElementById("checkout-btn").addEventListener("click", () => {
    const checkoutModal = new bootstrap.Modal(document.getElementById("checkout-modal"));
    checkoutModal.show();
});

document.getElementById("complete-order-btn").addEventListener("click", () => {
    checkout();
    const checkoutModal = bootstrap.Modal.getInstance(document.getElementById("checkout-modal"));
    checkoutModal.hide();
});

document.getElementById("empty-cart-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to empty the cart?")) {
        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            product.stock += cartItem.quantity;
        });
        cart = [];
        renderProducts();
        renderCart();
    }
});

document.getElementById("modal-checkout-btn").addEventListener("click", () => {
    const checkoutModal = new bootstrap.Modal(document.getElementById("checkout-modal"));
    checkoutModal.show();
});

renderProducts();
renderCart();
