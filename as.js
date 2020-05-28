/* jshint esversion: 6 */

// data for representing the texts
//=============================================

// char/word for end of text (multiple texts on a file)
const endOfText = '|'; // a very special character/word

// other special chars
const whitespaces = ' \n';
const wordEnds = ',.;:)'; // punctuation at end of word
const wordBegins = '(#$'; // special chars for beginning a word

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
        console.log('eof', inputText.length);

    } else {
        console.log(word);
        const wordIndex = findIndex(word);
        console.log(wordIndex, inputText.length);
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
        if (isUndefined(node[wordIndex])) {
            // add the connection to this word, initialize frequency
            node[wordIndex] = 0;
        }
        // update node
        node[wordIndex] += 1;
        node.sum += 1;
        // advance to next node
        node = textNodes[wordIndex];
    }
    // the text is finished, increment sum of last node to account for termination
    node.sum += 1;
}