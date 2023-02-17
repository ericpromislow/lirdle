import View from './view.js';
import Model from './model.js';

let view = null;
let model = view;

function initialize() {
    view = new View();
    model = new Model(view);
    model.initialize();
    view.setModel(model);

    document.addEventListener("keyup", (e) => {
        view.keyHandler(e);
    });
}

window.addEventListener('load', () => {
    initialize();
});
