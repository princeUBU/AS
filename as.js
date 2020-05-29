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
const maxTextLength = 200;

// list of all words as text, for conversion to integer indices, and output
let allWords = [];

// lists of all word transition indizes and weights
// for each word its transitions have an index and a weight, in two arrays
// and a sum of all transition weights plus transition to end of text
const allWordTransitionIndices = [];
const allWordTransitionWeights = [];
const allWordSumOfWeights = [];

const textStartTransitionIndices = [];
const textStartTransitionWeights = [];
let textStartSumOfWeights = 0;


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
            console.log(allWords);
            console.log(allWordTransitionIndices);
            console.log(allWordTransitionWeights);
            console.log(allWordSumOfWeights);

            console.log(textStartTransitionIndices);
            console.log(textStartTransitionWeights);
            console.log(textStartSumOfWeights);
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
        node.index = allWords.length;
        allWords.push(word);
        allWordTransitionWeights.push([]);
        allWordTransitionIndices.push([]);
        allWordSumOfWeights.push(0);
    }
    const index = node.index;
    // safety check
    if (allWords[index] !== word) {
        console.error('findIndex: word = "' + word + '", index= ' + index + ' but allWords[index]= "' + allWords[index]);
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

// input is array of word indizes

function doText(inputText) {
    console.log(inputText);
    // only texts of at least two words
    if (inputText.length >= 2) {
        // the first word is special, rooted in textStart, which is not treated as a word
        const wordIndex = inputText[0];
        textStartSumOfWeights += 1;
        let tableIndex = textStartTransitionIndices.indexOf(wordIndex);
        if (tableIndex < 0) {
            tableIndex = textStartTransitionIndices.length;
            textStartTransitionIndices.push(wordIndex);
            textStartTransitionWeights.push(0);
        }
        textStartTransitionWeights[tableIndex] += 1;
        // the other words
        for (var i = 1; i < inputText.length; i++) {
            // index to word table with transition from lastWord to newWord
            const lastWordIndex = inputText[i - 1];
            // index for the new word, that defines the transition
            const newWordIndex = inputText[i];
            // update the transition tables of the last word
            allWordSumOfWeights[lastWordIndex] += 1;
            const wordTransitionIndices = allWordTransitionIndices[lastWordIndex];
            const wordTransitionWeights = allWordTransitionWeights[lastWordIndex];
            let tableIndex = wordTransitionIndices.indexOf(newWordIndex);
            if (tableIndex < 0) {
                tableIndex = wordTransitionIndices.length;
                wordTransitionIndices.push(newWordIndex);
                wordTransitionWeights.push(0);
            }
            wordTransitionWeights[tableIndex] += 1;
        }
        // for the end we increase the sum of transitions of the last word
        allWordSumOfWeights[inputText[inputText.length - 1]] += 1;
    }
}

// for all choosing transitions

// selecting one transition, random, depening on total sum and weights
// returns index to transitionIndexTable if result>=0
// result=-1 means end of text
function randomTransitionIndex(sum, transitionWeights) {
    let selector = 1 + Math.floor(sum * Math.random());
    const length = transitionWeights.length;
    for (var i = 0; i < length; i++) {
        selector -= transitionWeights[i];
        if (selector <= 0) {
            return i;
        }
    }
    return -1;
}

// generate text with transitions between single words
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
    let text = '';
    while ((text.length === 0) || (text.length > maxTextLength)) {
        text = createTextSingleWords();
    }
    textOutput.innerText = text;
};

// actually generates the text
function createTextSingleWords() {
    if (textStartSumOfWeights === 0) {
        return 'First read something...';
    }
    let text = 'a new text';

    /*
        const allWordTransitionIndices = [];
    const allWordTransitionWeights = [];
    const allWordSumOfWeights = [];

    const textStartTransitionIndices = [];
    const textStartTransitionWeights = [];
    let textStartSumOfWeights = 0;
    */

    return text;
}