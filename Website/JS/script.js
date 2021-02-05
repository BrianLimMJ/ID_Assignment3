const client = contentful.createClient({
    space: "2imdgvtwfj4o",
    accessToken:
      "p8CzPxkV--xG2FT22ceTx6Myeflq9wiqUzdrmmjlGqU"
 });
 console.log(client);
 
 // variables
 const cartBtn = document.querySelector(".cart-btn");
 const closeCartBtn = document.querySelector(".close-cart");
 const clearCartBtn = document.querySelector(".clear-cart");
 const cartDOM = document.querySelector(".cart");
 const cartOverlay = document.querySelector(".cart-overlay");
 const cartItems = document.querySelector(".cart-items");
 const cartTotal = document.querySelector(".cart-total");
 const cartContent = document.querySelector(".cart-content");
 const productsDOM = document.querySelector(".products-center");
 let cart = [];
 
 