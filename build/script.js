import View from './view.js';
import Model from './model.js';

try {
    console.log(`QQQ: >> script.js`);

    let view = null;
    let model = view;

    function initialize() {
        console.log(`ready are we initing`);
        view = new View();
        model = new Model(view);
        model.initialize();
        view.setModel(model);

        document.addEventListener("keyup", (e) => {
            if (view) view.keyHandler(e);
            else console.log(`Not handling key ${ e.key }`);
        });
    }
    console.log(`QQQ: << script.js`);

    window.addEventListener('load', () => {
        initialize();
    });
    console.log(`QQQ: << script.js`);
} catch(e) {
    console.log(`QQQ: error reading script.js: ${ e }`, e);
}
