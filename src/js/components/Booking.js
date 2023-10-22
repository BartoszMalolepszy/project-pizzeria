class Booking{
    constructor(element){
      this.render(element);
      this.initWidgets();
    }

    render(elemenet){

    /* generate HTML based on temaplte */
    const generatedHTML = templates.bookingWidget();
    this.element = utils.createDOMFromHTML(generatedHTML);

    this.dom = {};
    this.dom.wrapper = elemenet;
    console.log(this.dom.wrapper);

    this.dom.peopleAmount = this.element.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.element.querySelector(select.booking.hoursAmount);
    this.dom.wrapper.appendChild(this.element);

    }
    initWidgets(){

        this.peopleWidget = new AmountWidget(this.dom.peopleAmount);
        this.hoursWidget = new AmountWidget(this.dom.hoursAmount);

        this.dom.peopleAmount.addEventListener('updated', function () {

        });
        this.dom.hoursAmount.addEventListener('updated', function () {

        });
    }
}

export default Booking