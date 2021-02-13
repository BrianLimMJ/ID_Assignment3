const client = contentful.createClient({
    space: "2imdgvtwfj4o",
    accessToken: "p8CzPxkV--xG2FT22ceTx6Myeflq9wiqUzdrmmjlGqU"
});

console.log(client);

// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const checkoutCartBtn = document.querySelector(".checkout-cart");
const userPoints = document.querySelector(".cart-totalpoint");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartPoint = document.querySelector(".cart-point");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const redeemsDOM = document.querySelector(".redeems-center");

let cart = [];
let totalPoints = 0;

if (parseFloat(localStorage['points']) > 0) {
    totalPoints = parseFloat(localStorage['points']);
}
let pointEarned = 0;

//* ---------------------- product.html JS ---------------------- *//
class Products {
    async getProducts() {
        try {
            let contentful = await client.getEntries({
                content_type: "shopificationProducts"
            });

            let products = contentful.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                };
            });
            console.log(products);

            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// ui
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
<!-- single product -->
     <article class="product">
       <div class="img-container">
         <img
           src=${product.image}
           alt="product"
           class="product-img"
         />
         <button class="bag-btn" data-id=${product.id}>
           <i class="fa fa-shopping-cart"></i>
           add to bag
         </button>
       </div>
       <h3>${product.title}</h3>
       <h4>$${product.price}</h4>
     </article>
     <!-- end of single product -->
`;
        });
        try {
            productsDOM.innerHTML = result;
        } catch {
            console.log("This page isn't the product page, product script will not be executed.");
        }

    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
            let id = button.dataset.id;

            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            } else {
                button.addEventListener("click", event => {
                    // disable button
                    event.target.innerText = "In Bag";
                    event.target.disabled = true;
                    // add to cart
                    let cartItem = {
                        ...Storage.getProduct(id),
                        amount: 1
                    };
                    cart = [...cart, cartItem];
                    Storage.saveCart(cart);
                    // add to DOM
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                });
            }
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        let pointTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
            pointTotal += tempTotal * 0.15;
            pointEarned = pointTotal;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartPoint.innerHTML = parseFloat(pointTotal.toFixed(0));
        if (isNaN(parseFloat(localStorage['points']))) {
            userPoints.innerHTML = 0;
        } else {
            userPoints.innerHTML = parseFloat(localStorage['points']);
        }

        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<!-- cart item -->
         <!-- item image -->
         <img src=${item.image} alt="product" />
         <!-- item info -->
         <div>
           <h4>${item.title}</h4>
           <h5>$${item.price}</h5>
           <span class="remove-item" data-id=${item.id}>remove</span>
         </div>
         <!-- item functionality -->
         <div>
             <i class="fa fa-chevron-up" data-id=${item.id}></i>
           <p class="item-amount">
             ${item.amount}
           </p>
             <i class="fa fa-chevron-down" data-id=${item.id}></i>
         </div>
       <!-- cart item -->
 `;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        checkoutCartBtn.addEventListener("click", () => {
            this.checkOutCart();
        });
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cart = cart.filter(item => item.id !== id);
                console.log(cart);

                this.setCartValues(cart);
                Storage.saveCart(cart);
                cartContent.removeChild(removeItem.parentElement.parentElement);
                const buttons = [...document.querySelectorAll(".bag-btn")];
                buttons.forEach(button => {
                    if (parseInt(button.dataset.id) === id) {
                        button.disabled = false;
                        button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to bag`;
                    }
                });
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cart = cart.filter(item => item.id !== id);
                    // console.log(cart);

                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    const buttons = [...document.querySelectorAll(".bag-btn")];
                    buttons.forEach(button => {
                        if (parseInt(button.dataset.id) === id) {
                            button.disabled = false;
                            button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to bag`;
                        }
                    });
                }
            }
        });
    }
    checkOutCart() {
        // console.log(this);
        cart = [];
        this.setCartValues(cart);
        Storage.saveCart(cart);
        if (cartContent.children.length < 1 || cartContent.children.length == undefined) {
            alert("There are no item in cart.")
        } else {
            alert("Order has been placed! You've earned " + pointEarned.toFixed(0) + " points.");
            totalPoints += pointEarned;
            userPoints.innerHTML = parseFloat(totalPoints.toFixed(0));
            Storage.savePoint(totalPoints.toFixed(0));
        }
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
            button.disabled = false;
            button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to bag`;
        });
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }
    static savePoint(totalPoints) {
        localStorage.setItem("points", totalPoints)
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    ui.setupAPP();

    // get all products
    products
        .getProducts()
        .then(products => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        });
});
//* ---------------------- end of product.html JS ---------------------- *//


//* ---------------------- Redeem.html JS ---------------------- *//
// redeems
class Redeems {
    async getredeems() {
        try {
            let contentful = await client.getEntries({
                content_type: "shopificationRewards"
            });

            let redeems = contentful.items;
            redeems = redeems.map(item => {
                const {
                    title,
                    point
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    point,
                    id,
                    image
                };
            });
            console.log(redeems);

            return redeems;
        } catch (error) {
            console.log(error);
        }
    }
}
let s = 0;

// rewards ui
class RewardUI {
    displayredeems(redeems) {
        let result = "";
        redeems.forEach(redeem => {
            result += `
            <!-- single redeem -->
                <article class="redeem">
                    <div class="img-container">
                    <img
                        src=${redeem.image}
                        alt="redeem"
                        class="redeem-img"
                    />
                    <button class="redeemBag-btn" onclick="redeemItem(${redeem.point})" data-id=${redeem.id}>
                        <i class="fa fa-gift"></i>
                        Redeem this
                    </button>
                    </div>
                    <h3>${redeem.title}</h3>
                    <h4>${redeem.point} Points</h4>
                </article>
                <script>
                </script>
                <!-- end of single redeem -->
            `;
        });
        try {
            redeemsDOM.innerHTML = result;
        } catch {
            console.log("This page isn't the redeem page, redeem script will not be executed.");
        }

    }
}

function redeemItem(redeemPoints){
    if(redeemPoints > totalPoints)
    {
        alert("not enough points");
    }
    else{
        alert("enough points");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const rewardUI = new RewardUI();
    const redeems = new Redeems();

    // get all redeems
    redeems
        .getredeems()
        .then(redeems => {
            rewardUI.displayredeems(redeems);
        })
});
//* ---------------------- end of Redeem.html JS ---------------------- *//

//* ---------------------- end of quiz.html JS ---------------------- *//
//selecting all required elements
try {
    const start_btn = document.querySelector(".start_btn button");
    const info_box = document.querySelector(".info_box");
    const exit_btn = info_box.querySelector(".buttons .quit");
    const continue_btn = info_box.querySelector(".buttons .restart");
    const quiz_box = document.querySelector(".quiz_box");
    const result_box = document.querySelector(".result_box");
    const option_list = document.querySelector(".option_list");
    const time_line = document.querySelector("header .time_line");
    const timeText = document.querySelector(".timer .time_left_txt");
    const timeCount = document.querySelector(".timer .timer_sec");



    // if startQuiz button clicked
    start_btn.onclick = () => {
        info_box.classList.add("activeInfo"); //show info box
    }

    // if exitQuiz button clicked
    exit_btn.onclick = () => {
        info_box.classList.remove("activeInfo"); //hide info box
    }

    // if continueQuiz button clicked
    continue_btn.onclick = () => {
        info_box.classList.remove("activeInfo"); //hide info box
        quiz_box.classList.add("activeQuiz"); //show quiz box
        showQuetions(0); //calling showQestions function
        queCounter(1); //passing 1 parameter to queCounter
        startTimer(15); //calling startTimer function
        startTimerLine(0); //calling startTimerLine function
    }

    let timeValue = 15;
    let que_count = 0;
    let que_numb = 1;
    let userScore = 0;
    let counter;
    let counterLine;
    let widthValue = 0;

    const restart_quiz = result_box.querySelector(".buttons .restart");
    const quit_quiz = result_box.querySelector(".buttons .quit");

    // if restartQuiz button clicked
    restart_quiz.onclick = () => {
        quiz_box.classList.add("activeQuiz"); //show quiz box
        result_box.classList.remove("activeResult"); //hide result box
        timeValue = 15;
        que_count = 0;
        que_numb = 1;
        userScore = 0;
        widthValue = 0;
        showQuetions(que_count); //calling showQestions function
        queCounter(que_numb); //passing que_numb value to queCounter
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        startTimer(timeValue); //calling startTimer function
        startTimerLine(widthValue); //calling startTimerLine function
        timeText.textContent = "Time Left"; //change the text of timeText to Time Left
        next_btn.classList.remove("show"); //hide the next button
    }

    // if quitQuiz button clicked
    quit_quiz.onclick = () => {
        window.location.reload(); //reload the current window
    }

    const next_btn = document.querySelector("footer .next_btn");
    const bottom_ques_counter = document.querySelector("footer .total_que");

    // if Next Que button clicked
    next_btn.onclick = () => {
        if (que_count < questions.length - 1) { //if question count is less than total question length
            que_count++; //increment the que_count value
            que_numb++; //increment the que_numb value
            showQuetions(que_count); //calling show questions function
            queCounter(que_numb); //passing que_numb value to queCounter
            clearInterval(counter); //clear counter
            clearInterval(counterLine); //clear counterLine
            startTimer(timeValue); //calling startTimer function
            startTimerLine(widthValue); //calling startTimerLine function
            timeText.textContent = "Time Left"; //change the timeText to Time Left
            next_btn.classList.remove("show"); //hide the next button
        } else {
            clearInterval(counter); //clear counter
            clearInterval(counterLine); //clear counterLine
            showResult(); //calling showResult function
        }
    }

    // getting questions and options from array
    function showQuetions(index) {
        const que_text = document.querySelector(".que_text");

        //creating a new span and div tag for question and option and passing the value using array index
        let que_tag = '<span>' + questions[index].numb + ". " + questions[index].question + '</span>';
        let option_tag = '<div class="option"><span>' + questions[index].options[0] + '</span></div>' +
            '<div class="option"><span>' + questions[index].options[1] + '</span></div>' +
            '<div class="option"><span>' + questions[index].options[2] + '</span></div>' +
            '<div class="option"><span>' + questions[index].options[3] + '</span></div>';
        que_text.innerHTML = que_tag; //adding new span tag inside que_tag
        option_list.innerHTML = option_tag; //adding new div tag inside option_tag

        const option = option_list.querySelectorAll(".option");

        // set onclick attribute to all available options
        for (i = 0; i < option.length; i++) {
            option[i].setAttribute("onclick", "optionSelected(this)");
        }
    }
    // creating the new div tags which for icons
    let tickIconTag = '<div class="icon tick"><i class="fa fa-check"></i></div>';
    let crossIconTag = '<div class="icon cross"><i class="fa fa-times"></i></div>';

    //if user clicked on option
    function optionSelected(answer) {
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        let userAns = answer.textContent; //getting user selected option
        let correcAns = questions[que_count].answer; //getting correct answer from array
        const allOptions = option_list.children.length; //getting all option items

        if (userAns == correcAns) { //if user selected option is equal to array's correct answer
            userScore += 1; //upgrading score value with 1
            answer.classList.add("correct"); //adding green color to correct selected option
            answer.insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to correct selected option
            console.log("Correct Answer");
            console.log("Your correct answers = " + userScore);
        } else {
            answer.classList.add("incorrect"); //adding red color to correct selected option
            answer.insertAdjacentHTML("beforeend", crossIconTag); //adding cross icon to correct selected option
            console.log("Wrong Answer");

            for (i = 0; i < allOptions; i++) {
                if (option_list.children[i].textContent == correcAns) { //if there is an option which is matched to an array answer 
                    option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                    option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
                    console.log("Auto selected correct answer.");
                }
            }
        }
        for (i = 0; i < allOptions; i++) {
            option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
        }
        next_btn.classList.add("show"); //show the next button if user selected any option
    }

    function showResult() {
        info_box.classList.remove("activeInfo"); //hide info box
        quiz_box.classList.remove("activeQuiz"); //hide quiz box
        result_box.classList.add("activeResult"); //show result box
        const scoreText = result_box.querySelector(".score_text");
		if (userScore > 3) { // if user scored more than 3
            //creating a new span tag and passing the user score number and total question number
            let scoreTag = '<span>and congrats! 🎉, You got <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;You have earned ' + userScore + ' reward points!</p>';
            scoreText.innerHTML = scoreTag; //adding new span tag inside score_Text
			totalPoints += userScore;
            userPoints.innerHTML = parseFloat(totalPoints.toFixed(0));
            Storage.savePoint(totalPoints.toFixed(0));
        } else if (userScore > 1) { // if user scored more than 1
            let scoreTag = '<span>and nice 😎, You got <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
            scoreText.innerHTML = scoreTag;
        } else { // if user scored less than 1
            let scoreTag = '<span>and sorry 😐, You got only <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
            scoreText.innerHTML = scoreTag;
        }
    }

    function startTimer(time) {
        counter = setInterval(timer, 1000);

        function timer() {
            timeCount.textContent = time; //changing the value of timeCount with time value
            time--; //decrement the time value
            if (time < 9) { //if timer is less than 9
                let addZero = timeCount.textContent;
                timeCount.textContent = "0" + addZero; //add a 0 before time value
            }
            if (time < 0) { //if timer is less than 0
                clearInterval(counter); //clear counter
                timeText.textContent = "Time Off"; //change the time text to time off
                const allOptions = option_list.children.length; //getting all option items
                let correcAns = questions[que_count].answer; //getting correct answer from array
                for (i = 0; i < allOptions; i++) {
                    if (option_list.children[i].textContent == correcAns) { //if there is an option which is matched to an array answer
                        option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                        option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
                        console.log("Time Off: Auto selected correct answer.");
                    }
                }
                for (i = 0; i < allOptions; i++) {
                    option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
                }
                next_btn.classList.add("show"); //show the next button if user selected any option
            }
        }
    }

    function startTimerLine(time) {
        counterLine = setInterval(timer, 29);

        function timer() {
            time += 1; //upgrading time value with 1
            time_line.style.width = time + "px"; //increasing width of time_line with px by time value
            if (time > 549) { //if time value is greater than 549
                clearInterval(counterLine); //clear counterLine
            }
        }
    }

    function queCounter(index) {
        //creating a new span tag and passing the question number and total question
        let totalQueCounTag = '<span><p>' + index + '</p> of <p>' + questions.length + '</p> Questions</span>';
        bottom_ques_counter.innerHTML = totalQueCounTag; //adding new span tag inside bottom_ques_counter
    }
} catch {
    console.log("This page isn't the quiz page, quiz script will not be executed.")
}
//* ---------------------- quiz questions JS ---------------------- *//
// creating an array and passing the number, questions, options, and answers
let questions = [{
        numb: 1,
        question: "What does HTML stand for?",
        answer: "Hyper Text Markup Language",
        options: [
            "Hyper Text Preprocessor",
            "Hyper Text Markup Language",
            "Hyper Text Multiple Language",
            "Hyper Tool Multi Language"
        ]
    },
    {
        numb: 2,
        question: "What does CSS stand for?",
        answer: "Cascading Style Sheet",
        options: [
            "Common Style Sheet",
            "Colorful Style Sheet",
            "Computer Style Sheet",
            "Cascading Style Sheet"
        ]
    },
    {
        numb: 3,
        question: "What does PHP stand for?",
        answer: "Hypertext Preprocessor",
        options: [
            "Hypertext Preprocessor",
            "Hypertext Programming",
            "Hypertext Preprogramming",
            "Hometext Preprocessor"
        ]
    },
    {
        numb: 4,
        question: "What does SQL stand for?",
        answer: "Structured Query Language",
        options: [
            "Stylish Question Language",
            "Stylesheet Query Language",
            "Statement Question Language",
            "Structured Query Language"
        ]
    },
    {
        numb: 5,
        question: "What does XML stand for?",
        answer: "eXtensible Markup Language",
        options: [
            "eXtensible Markup Language",
            "eXecutable Multiple Language",
            "eXTra Multi-Program Language",
            "eXamine Multiple Language"
        ]
    }
];
//* ---------------------- end of quiz.html JS ---------------------- *//




//* ---------------------- social panel JS ---------------------- *//
const floating_btn = document.querySelector('.floating-btn');
const close_btn = document.querySelector('.close-btn');
const social_panel_container = document.querySelector('.social-panel-container');

floating_btn.addEventListener('click', () => {
    social_panel_container.classList.toggle('visible')
});

close_btn.addEventListener('click', () => {
    social_panel_container.classList.remove('visible');
});
//* ---------------------- end of social panel JS ---------------------- *//

//* ---------------------- navigation bar panel JS ---------------------- *//
function openMenu() {
    document.getElementById("menu").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.btn-menu')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
//* ---------------------- end of navigation bar panel JS ---------------------- *//

