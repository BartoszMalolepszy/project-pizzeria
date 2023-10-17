import { settings, select, templates } from './settings';
import utils from './utils.js';
import CartProduct from './CartProduct';
import app from '../app';


class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      // console.log('new Cart:', thisCart);

    }

    add(menuProduct) {
      const thisCart = this;

      console.log('adding product:', menuProduct);
      const generateHTML = templates.cartProduct(menuProduct);
      const element = utils.createDOMFromHTML(generateHTML);
      thisCart.dom.productList.appendChild(element);
      thisCart.products.push(new CartProduct(menuProduct, element));
      console.log('thisCart.products:', thisCart.products);
      thisCart.update();
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
      thisCart.dom.productList = this.dom.wrapper.querySelector(
        select.cart.productList
      );
      // console.log(thisCart.dom.toggleTrigger);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
     
      thisCart.dom.subtotalPrice = element.querySelector(
        select.cart.subtotalPrice
      );
      thisCart.dom.totalPrice = element.querySelectorAll(
        select.cart.totalPrice
      );
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.address = element.querySelector(select.cart.address);
      
      thisCart.dom.phone = element.querySelector(select.cart.phone);

    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle('active');
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function (event){
        event.preventDefault();
        thisCart.sendOrder();
      })
    }

    update() {
      const thisCart = this;
      console.log(thisCart);
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      
        

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      
     
      for (const product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      console.log(thisCart.dom.deliveryFee);

      
      if (thisCart.totalNumber == 0) {
      thisCart.deliveryFee = 0;
      }

      //thisCart.deliveryFee; 

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      console.log(thisCart.dom.totalNumber);
      
      thisCart.dom.totalPrice.forEach(function (element) {
        element.innerHTML = thisCart.totalPrice;
      });
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    }

    remove(product) {
      const thisCart = this;
      product.dom.wrapper.remove();
      const indexOfRemovedProduct = thisCart.products.indexOf(product);
      thisCart.products.splice(indexOfRemovedProduct, 1);
      thisCart.update();
    }

    sendOrder (){
      
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {

        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [] ,
      }
      
      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      
      console.log(payload);

      /*fetch(url, {
        metod: 'POST', 
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });*/  //wyciągamy teraz opcje do osobnej stałej , dla ładniejszego kodu
      //czyli to jest dokładnie to samo 

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch (url, options);

    }
  }
  app.initCart()

  export default Cart; 