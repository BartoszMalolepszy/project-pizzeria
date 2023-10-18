import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
   // thisProduct.getElements(this.element);

    //console.log('new Product:', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */

    const generateHTML = templates.menuProduct(thisProduct.data);
   //console.log(generateHTML);

    /*create element using utils.createElemenetFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    console.log(thisProduct.element);

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

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;
