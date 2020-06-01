/* jshint esversion: 6 */

const textOutput = document.querySelector('#text-output');

const saveButton = document.querySelector('#save-button');

const filenameInput = document.querySelector('#filename-input');

filenameInput.value='result';

// save blob to a file using an off-screen a-tag element

function saveBlobAsFile(blob, filename) {
    const objURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = objURL;
    a.download = filename;
    a.click();
    a.remove();
    URL.revokeObjectURL(objURL);
}


saveButton.onclick = function() {
    console.log('save');
    const text=textOutput.value;
    console.log(text);
    const blob=new Blob([text],{type: 'text/plain'})

    const filename=filenameInput.value+'.txt';

      const objURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = objURL;
    a.download = filename;
    a.click();
    a.remove();
    URL.revokeObjectURL(objURL);

};
