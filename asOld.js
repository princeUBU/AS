/* jshint esversion: 6 */

// data for representing the texts
//=============================================

// encoding:
// a number takes 8 bytes
// a string takes 2 bytes per character (UTF-16)
// the object keys are always strings, integer get converted into strings
// we can save space doing the conversion explicit in base 32

// an integer base 32 string takes 6 bytes or less if integer is smaller than 32768=2**15

// char/word for end of text (multiple texts on a file)
const endOfText = '|'; // a very special character/word

// other special chars
const whitespaces = ' \n';
const wordEnds = ',.;:)'; // punctuation at end of word
const wordBegins = '(#$'; // special chars for beginning a word

// limit for the length of texts
const maxTextLength=200;

// list of all words as text, for conversion to integer indices
let words = [];

// textNode gives for a given word all words that can follow with their frequencies
// key is the index to words, value the frequency
// textNode.sum is the sum of all frequencies, including the possibility that the text ends

let textStartNode = {};
textStartNode.sum = 0;

// further textnodes are tied to words
let textNodes = [];


// utilities
//========================================
function isDefined(thing) {
    return ((typeof thing) !== "undefined") && (thing !== null);
}

function isUndefined(thing) {
    return ((typeof thing) === "undefined") || (thing === null);
}

// setting up the file input
//======================================================
const fileInput = document.querySelector('#file-input');

// reading multiple files, make a stream of chars

fileInput.onchange = function() {
    const files = fileInput.files;
    console.log(files.length);
    let currentFileNumber = 0;
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const result = fileReader.result;
        for (i = 0; i < result.length; i++) {
            doChar(result.charAt(i));
        }
        // end of file is same as end of text
        doChar(endOfText);
        currentFileNumber += 1;
        if (currentFileNumber < files.length) {
            fileReader.readAsText(files[currentFileNumber]);
        } else {
            console.log(words);
            console.log(textNodes);
        }
    };

    fileReader.readAsText(files[0]);
};

// working with the char stream
//============================================

let doingWhitespace = true;
let word = '';

// making a stream of words

function doChar(char) {
    if (char === endOfText) {
        // end of text as a special word
        if (!doingWhitespace) {
            // end of text directly after a word, use this word
            doWord(word);
            doingWhitespace = true;
        }
        doWord(endOfText);
    } else if (doingWhitespace) {
        if (whitespaces.indexOf(char) < 0) {
            // no whitespace, begin a new word
            doingWhitespace = false;
            word = char;
        }
        // else char is a whitespace, skip, do nothing
    } else if (whitespaces.indexOf(char) >= 0) {
        // char is a first whitespace, end the word
        doWord(word);
        doingWhitespace = true;
    } else if (wordEnds.indexOf(char) >= 0) {
        // word ends with this char, do it, start whitespace
        word += char;
        doWord(word);
        doingWhitespace = true;
    } else if (wordBegins.indexOf(char) >= 0) {
        // word begins with this char, end current word, do it, begin new word
        doWord(word);
        word = char;
    } else {
        // no special chars, add to the current word
        word += char;
    }
}

// working with the word stream
//=========================================

// find rapidly the index of a word from a tree, add word to list of words if not there, add a textNode
//----------------------------------------

const rootWordTree = {};

function findIndex(word) {
    let node = rootWordTree;
    for (var i = 0; i < word.length; i++) {
        const char = word.charAt(i);
        // if the current node has not a link to a next tree node we have to create one
        if (isUndefined(node[char])) {
            node[char] = {};
        }
        // now we can always go along this branch
        node = node[char];
    }
    // we are at the end of the word, if the node does not have an index we create one
    if (isUndefined(node.index)) {
        node.index = words.length;
        words.push(word);
        const textNode = {};
        textNode.sum = 0;
        textNodes.push(textNode);
    }
    const index = node.index;
    // safety check
    if (words[index] !== word) {
        console.error('findIndex: word = "' + word + '", index= ' + index + ' but words[index]= "' + words[index]);
    }
    return index;
}

// put together words of one text into an array of word indices representing the text
//-------------------------------------------------------------------------------------

let inputText = [];

function doWord(word) {
    if (word === endOfText) {
        // text is complete, analyze if not empty
        if (inputText.length > 0) {
            doText(inputText);
            inputText.length = 0;
        }
    } else {
        const wordIndex = findIndex(word);
        inputText.push(wordIndex);
    }
}

// work with text as array of indices: make transition table
//==================================================================

function doText(inputText) {
    console.log(inputText);
    let node = textStartNode;
    for (var i = 0; i < inputText.length; i++) {
        const wordIndex = inputText[i];
        const wordIndexString = wordIndex.toString(32);
        if (isUndefined(node[wordIndexString])) {
            // add the connection to this word, initialize frequency
            node[wordIndexString] = 0;
        }
        // update node
        node[wordIndexString] += 1;
        node.sum += 1;
        // advance to next node
        node = textNodes[wordIndexString];
    }
    // the text is finished, increment sum of last node to account for termination
    node.sum += 1;
}

// generate with transitions between single words
//===================================================================

const generateSingles = document.querySelector('#generate-singles');
const textOutput = document.querySelector('#text-output');
//pOutput.style.border='solid grey';
//pOutput.style.padding='5px';

const copyButton = document.querySelector('#copy-button');
copyButton.onclick = function() {
    textOutput.select();
    document.execCommand("copy");
};

generateSingles.onclick = function() {
    console.log('genera');
    pOutput.innerText = "neues";
};