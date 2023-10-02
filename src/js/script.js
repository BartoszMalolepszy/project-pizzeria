/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  //deklarujemy tutaj klasę czyli przepis na tworzenie instacji
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements(); // wywołania metod do późniejszego użytku
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.getElements(this.element);

      //console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */

      const generateHTML = templates.menuProduct(thisProduct.data);
      //console.log(generateHTML);

      /*create element using utils.createElemenetFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      ); // used in initAccordion
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );

      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
        select.cart.productList
      );

      //console.log(this.getElements);
    }

    initAccordion() {
      const thisProduct = this;
      //console.log(thisProduct.element);

      /* find the clickable trigger (the element that should react to clicking) */
      /*const clickableTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );*/ //zmienna jest już nie potrzebna poniewąż pobierane jest z getElements (powyżej)

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */

        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );

        //console.log(activeProduct);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove('active');
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }
    initOrderForm() {
      const thisProduct = this;
      //console.log('method initOrderForm: ', thisProduct);

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;
      //console.log(price);

      // for every category (param)
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable (actual)

              price += option.price;
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
          // Images starting
          const optionImage = thisProduct.imageWrapper.querySelector(
            '.' + paramId + '-' + optionId
          ); // '.' we are looking after class
          //console.log(optionImage);

          // check if the option exists
          if (optionImage) {
            if (optionSelected) {
              // if the option exists add class active
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              // remove class active
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          // Images end
        }
      }

      // multiply price by amount
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;

      /*console.log(
        'added price single after check option:',
        thisProduct.priceSingle
      );*/

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;
      console.log(thisProduct);

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * this.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };

      console.log(productSummary);
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      console.log(thisProduct);

      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      console.log(params);

      //for evry category (param)

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        //create category param in params const eg.  params = {ingredients: {name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };

        //for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          //console.log(option);
          if (optionSelected) {
            // option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      console.log(params);
      return params;
    }
  }

  // Module 9

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);

      // console.log('AmountWidget:', thisWidget);
      // console.log('construktor arguments:', element);

      thisWidget.setValue(
        thisWidget.input.value || settings.amountWidget.defaultValue
      );

      //thisWidget.setValue(thisWidget.input.value ? thisWidget.input.value : settings.amountWidget.defaultValue);

      //Linia powyżej to jest to samo co kod poniżej:
      /*if (thisWidget.input.value) {
        thisWidget.setValue(thisWidget.input.value);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }*/
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      //console.log(thisWidget);

      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const thisWidget = this;

      //console.log(thisWidget);

      let newValue = parseInt(value); // parseInt pilnuje konwersj ze stringa '10' do postaci liczby 10 czyli intiger

      /* Dodanie sprawdzania wartości na widget'cie */

      if (
        newValue <= settings.amountWidget.defaultMax &&
        newValue >= settings.amountWidget.defaultMin &&
        thisWidget.value !== newValue &&
        !isNaN(newValue)
      ) {
        // Sprawdź, czy newValue nie jest mniejsze od minimalnej wartości, max wartości, jest liczbą etc.
        thisWidget.value = newValue;
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      console.log('new Cart:', thisCart);
    }

    add(menuProduct) {
      const thisCart = this;

      console.log('adding product:', menuProduct);
      const generateHTML = templates.cartProduct(menuProduct);
      const element = utils.createDOMFromHTML(generateHTML);
      thisCart.dom.productList.appendChild(element);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
      console.log(thisCart.dom.toggleTrigger);
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle('active');
      });
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;

      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      //następuje dostęp do danych z data source
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
  app.initCart();
}
