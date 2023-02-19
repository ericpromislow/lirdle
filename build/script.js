import View from './view.js';
import Model from './model.js';

let view = null;
let model = view;

function initialize() {
    console.log(`ready are we initing`);
    view = new View();
    model = new Model(view);
    model.initialize();
    view.setModel(model);
    if (!model.allDone) {
        document.addEventListener("keyup", (e) => {
            if (view) view.keyHandler(e);
            else console.log(`Not handling key ${e.key}`);
        });
    }
}
window.addEventListener('load', () => {
    initialize();
});
