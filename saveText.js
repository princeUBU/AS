/* jshint esversion: 6 */

const textOutput = document.querySelector('#text-output');

const saveButton = document.querySelector('#save-button');

const filenameInput = document.querySelector('#filename-input');

filenameInput.value='result';


// input with drag and drop

    // we need dragover to prevent default loading of image, even if dragover does nothing else
   textOutput.ondragover = function(event) {
        event.preventDefault();
    };

    textOutput.ondrop = function(event) {
        event.preventDefault();
        textOutput.textContent='';
        const files = event.dataTransfer.files;
        // 
         let currentFileNumber = 0;
    const fileReader = new FileReader();

    fileReader.onload = function() {
    	console.log(currentFileNumber)
textOutput.textContent=textOutput.textContent+fileReader.result;
       currentFileNumber += 1;
        if (currentFileNumber < files.length) {
        	textOutput.textContent=textOutput.textContent+'\n';

            fileReader.readAsText(files[currentFileNumber]);
        }

    }

        fileReader.readAsText(files[0]);


        }

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
