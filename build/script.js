import View from './view.js';
import Model from './model.js';

let view = null;
let model = view;

function initialize() {
    view = new View();
    model = new Model(view);
    model.initialize();

    document.addEventListener("keyup", (e) => {
        view.keyHandler(e, model);
    });
}

window.addEventListener('load', () => {
    initialize();
});
