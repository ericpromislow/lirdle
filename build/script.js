// Copyright (C) 2023 Bovination Productions, MIT License

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
        const keyboard = document.getElementById("keyboard-cont");
        document.addEventListener("keyup", (e) => {
            if (view) view.keyHandler(e);
            else console.log(`Not handling key ${e.key}`);
        });
        keyboard.addEventListener("click", (e) => {
            if (!view) {
                console.log(`Not handling click event on ${ e.target.nodeName }`);
            } else if (e.target.nodeName === "BUTTON") {
                const command = e.target.textContent;
                if (command) {
                    e.key = command;
                    view.keyHandler(e);
                } else {
                    console.log(`Clicked button has no textContent`);
                }
            }
            console.log(`Ignoring click on non-button ${ e.target.nodeName }`);
        });
        keyboard.addEventListener('dblclick', (e) => {
            e.stopPropagation();
        });
    }
    document.getElementById('shareResults').addEventListener('click', (e) => {
        const shareText = model.getShareText();
        try {
            copyTextToClipboard(shareText);
        } catch(e) {
            console.log(`Trying to share failed: ${ err }`);
        }
    })
}
window.addEventListener('load', () => {
    initialize();
});

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('navigator.clipboard.writeText worked');
    }, function(err) {
        console.error(`navigator.clipboard.writeText failed: ${ e }`);
        fallbackCopyTextToClipboard(text);
    });
}