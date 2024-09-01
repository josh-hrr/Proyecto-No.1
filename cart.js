document.addEventListener("DOMContentLoaded", function() {
    let db;
    const request = indexedDB.open("CarritoDB", 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const store = db.createObjectStore("Carrito", { keyPath: "name" });
        store.createIndex("price", "price", { unique: false });
        store.createIndex("quantity", "quantity", { unique: false });
        store.createIndex("imgSrc", "imgSrc", { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadCartFromDB();
    };

    request.onerror = function(event) {
        console.error("Error opening IndexedDB:", event.target.errorCode);
    };

    const cartItems = {};
    const cartList = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    document.querySelectorAll(".producto").forEach(product => {
        product.addEventListener("dragstart", function(event) {
            event.dataTransfer.setData("text/plain", JSON.stringify({
                name: this.getAttribute("data-name"),
                price: this.getAttribute("data-price"),
                imgSrc: this.querySelector("img").src
            }));
        });
    });

    window.allowDrop = function(event) {
        event.preventDefault();
    };

    window.drop = function(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData("text/plain");
        const removeItemName = event.dataTransfer.getData("remove-item");

        if (data) {
            addProductToCart(JSON.parse(data));
        } else if (removeItemName) {
            removeProductFromCart(removeItemName);
        }
    };

    function addProductToCart(product) {
        const transaction = db.transaction(["Carrito"], "readwrite");
        const store = transaction.objectStore("Carrito");
    
        store.get(product.name).onsuccess = function(event) {
            const item = event.target.result;
    
            if (item) {
                item.quantity += 1;
                store.put(item);
                cartItems[product.name] = item;
            } else {
                product.quantity = 1;
                store.add(product);
                cartItems[product.name] = product;
            }
    
            // Forzar actualización del carrito después de la transacción
            updateCart();
            setTimeout(loadCartFromDB, 100); // Agrega un pequeño retraso para asegurarse de que la DB se sincroniza
        };
    }
    

    function removeProductFromCart(productName) {
        const transaction = db.transaction(["Carrito"], "readwrite");
        const store = transaction.objectStore("Carrito");

        store.delete(productName).onsuccess = function() {
            delete cartItems[productName];
            updateCart();
        };
    }

    function updateCart() {
        cartList.innerHTML = "";
        let total = 0;
    
        Object.values(cartItems).forEach(item => {
            const li = document.createElement("li");
            li.dataset.name = item.name;
            li.draggable = true;
            const price = parseFloat(item.price); 
            const quantity = item.quantity; 
    
            li.innerHTML = `<img src="${item.imgSrc}" alt="${item.name}" width="50" draggable="false">
                            ${item.name} - $${price.toFixed(2)} x ${quantity} = $${(price * quantity).toFixed(2)}`;
            cartList.appendChild(li);
    
            total += price * quantity;
        });
    
        totalPriceElement.textContent = total.toFixed(2);
    }

    function loadCartFromDB() {
        const transaction = db.transaction(["Carrito"], "readonly");
        const store = transaction.objectStore("Carrito");

        store.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                cartItems[cursor.value.name] = cursor.value;
                cursor.continue();
            }
            updateCart();
        };
    }

    document.getElementById("confirm-purchase").addEventListener("click", function() {
        window.location.href = "ConfirmarCompra.html";
    });
});
