/* jshint esversion: 6 */

// using word pairs - switch
//==========================
const usePairs=true;

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

// collection of whitespace characters
const whitespaces = ' \n';

// keep it simple: all other chars are equal, as people make things ...

// limit for the length of texts
const maxTextLength = 200;

// list of all words as text, for conversion to integer indices, and output
let words = [];

// lists of all word transition indizes and weights
// for each word its transitions have an index and a weight, in two arrays
// and a sum of all transition weights plus transition to end of text
const allTransitionIndices = [];
const allTransitionWeights = [];
const allSumOfWeights = [];

// a wordIndex gives the word as a string words[wordIndex]
// the transitions to the next word are determined by
// transitionIndices=allTransitionIndices[wordIndex] is an array of indices of words with a possible transition
// similarly
// transitionWeights=allTransitionWeights[wordIndex] is an array of weights for the above transitions
// sumOfWeights=allSumOfWeights[wordIndex] is the sum of these transition weights plus the weight for the end of word

// the beginning

// all texts begin at word index 0, which is simply the same word as the end of text marker
// note that end of text marker is never part of a text
words.push(endOfText);
allTransitionWeights.push([]);
allTransitionIndices.push([]);
allSumOfWeights.push(0);

// continue (with transition between single words)

// we know the index of the last word we have done, at start this index===0
// to do the newWord, we know its index: newWordIndex
// we have to find the tableIndex to the transition tables such that newWordIndex=transitionIndices[tableIndex]
// if it does not exist we create and push the necessary table items
// increase transitionFrequencies[tableIndex]
// increase sumOfFrequencies

// at the end only increase sumOfFrequencies for lastWord(Index)

// using pairs
// each possible transition between two words is a word pair
// we can use transitions from pairs to words similarly as before
// all pair transition data is now in
if (usePairs){
const allPairTransitionIndices=[];
const allPairTransitionWeights=[];
const allPairSumOfWeights=[];
allPairTransitionIndices.push([]);
allPairTransitionWeights.push([]);
allPairSumOfWeights.push([]);
}

// wordPairWhatever=allPairWhatever[wordIndex] gives the transition data for the pairs of words beginning with the word given by wordIndex
// pairWhatever=wordPairWhatever[nextWordIndex] gives all transitions from the (word, nextWord) pair

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
            console.log(allTransitionIndices);
            console.log(allTransitionWeights);
            console.log(allSumOfWeights);

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
            // doing whitespace in the beginning of next text
            doingWhitespace = true;
        }
        doWord(endOfText);
    } else if (doingWhitespace) {
        if (whitespaces.indexOf(char) < 0) {
            // end of whitespace, begin a new word
            doingWhitespace = false;
            word = char;
        }
        // else char is a whitespace, continue whitespace: do nothing with this char
    } else if (whitespaces.indexOf(char) >= 0) {
        // char is a first whitespace, end the word, begin whitespace
        doWord(word);
        doingWhitespace = true;
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
        allTransitionWeights.push([]);
        allTransitionIndices.push([]);
        allSumOfWeights.push(0);
        if (usePairs){
allPairTransitionIndices.push([]);
allPairTransitionWeights.push([]);
allPairSumOfWeights.push([]);
        }
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

// input is array of word indizes

function doText(inputText) {
    console.log(inputText);
    // only texts of at least two words
    if (inputText.length >= 2) {
        // begin of text data 
            // index for the new word, that defines the transition
        let newWordIndex = 0;
            // index to word table with transition from lastWord to newWord
        let lastWordIndex = 0;
        for (var i = 0; i < inputText.length; i++) {
            newWordIndex = inputText[i];
            // update the transition tables of the last word
            allSumOfWeights[lastWordIndex] += 1;
            const wordTransitionIndices = allTransitionIndices[lastWordIndex];
            const wordTransitionWeights = allTransitionWeights[lastWordIndex];
            // now we have to find the index of transition to the new word
            let tableIndex = wordTransitionIndices.indexOf(newWordIndex);
            if (tableIndex < 0) {
                // it is missing, create new one
                tableIndex = wordTransitionIndices.length;
                wordTransitionIndices.push(newWordIndex);
                wordTransitionWeights.push(0);
            }
            wordTransitionWeights[tableIndex] += 1;
            lastWordIndex = newWordIndex;
        }
        // for the end we increase the sum of transitions of the last word
        allSumOfWeights[lastWordIndex] += 1;
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
const generatePairs = document.querySelector('#generate-pairs');
if (! usePairs){
    generatePairs.style.display='none';
}
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
    if (allSumOfWeights[0] === 0) {
        return 'First read something...';
    }
    let text = '';
    let lastWordIndex = 0;
    let newWordIndex = 0;
    while (lastWordIndex >= 0) {
        const sumOfWeights = allSumOfWeights[lastWordIndex];
        const transitionWeights = allTransitionWeights[lastWordIndex];
        // make random transition to a new word
        // choose the transition
        const tableIndex = randomTransitionIndex(sumOfWeights, transitionWeights);
        if (tableIndex >= 0) {
            // transition to a new word, get its index from the tables
            const transitionIndices = allTransitionIndices[lastWordIndex];
            newWordIndex = transitionIndices[tableIndex];
            // and add to text, with space
            text += ' ' + words[newWordIndex];
        } else {
            // terminate, no new word
            newWordIndex = -1;
        }
        lastWordIndex = newWordIndex;
    }
    return text;
}