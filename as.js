/* jshint esversion: 6 */
console.log('hello');

// setting up the file input
//======================================================
const fileInput = document.querySelector('#file-input');

// reading multiple files, make a stream of chars

fileInput.onchange = function() {
    console.log('got things');
    const files = fileInput.files;
    console.log(files.length);
    let currentFileNumber = 0;
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const result=fileReader.result;
        for (i=0;i<result.length;i++){
        	doChar(result.charAt(i));
        }
        currentFileNumber += 1;
        if (currentFileNumber < files.length) {
            fileReader.readAsText(files[currentFileNumber]);
        }
    };

    fileReader.readAsText(files[0]);
};

// working with the char stream
//============================================


// making words


function doChar(char){


	console.log(char);
}