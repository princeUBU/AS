/* jshint esversion: 6 */

// important parameters
//==================================================

// char/word for end of text (multiple texts on a file)
const endOfText = '|';

// connection to the ui
//==================================================

const openInputButton = document.querySelector('#openInput-button');
const inputText = document.querySelector('#input-text');
const addButton = document.querySelector('#add-button');
const openCollectionButton = document.querySelector('#openCollection-button');
const clearCollectionButton = document.querySelector('#clearCollection-button');
const collectionText = document.querySelector('#collection-text');
const saveButton = document.querySelector('#save-button');
const filenameInput = document.querySelector('#filename-input');

// reading files
//================================================

// reading files and putting text in a textarea
function readFiles(textarea,files){
        textarea.value = '';
        let currentFileNumber = 0;
        const fileReader = new FileReader();

        fileReader.onload = function() {
            textarea.value = textarea.value + fileReader.result;
            currentFileNumber += 1;
            if (currentFileNumber < files.length) {
                textarea.value = textarea.value + '\n';
                fileReader.readAsText(files[currentFileNumber]);
            }
        };
        fileReader.readAsText(files[0]);
}

// adding drag and drop to a textarea
function addDragAndDrop(textarea) {
    // we need dragover to prevent default loading of image, even if dragover does nothing else
    textarea.ondragover = function(event) {
        event.preventDefault();
    };
    textarea.ondrop = function(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        readFiles(textarea,files);
    };
}

addDragAndDrop(inputText);
addDragAndDrop(collectionText);

// the open file buttons
openInputButton.onChange=function(){};