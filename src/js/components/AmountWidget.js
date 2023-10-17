import { settings, select } from './settings.js';

class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);

      // console.log('AmountWidget:', thisWidget);
       console.log('construktor arguments:', element);

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

      console.log(thisWidget);

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

      const event = new CustomEvent('updated', {
        bubbles: true,
      });

      thisWidget.element.dispatchEvent(event);
    }
  }
 export default AmountWidget; 