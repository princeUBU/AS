/* jshint esversion: 6 */

// important parameters
//==================================================

// make it possible to use word pair transitions ?
const usePairs = true;

// char/word for end of text (multiple texts on a file)
const endOfText = '|'; // a very special character/word

// collection of whitespace characters
const whitespaces = ' \n';

// limit for the length of texts
const maxTextLength = 200;

// connection to the ui
//==================================================

const fileInput = document.querySelector('#file-input');
const generateSingles = document.querySelector('#generate-singles');
const generatePairs = document.querySelector('#generate-pairs');
if (!usePairs) {
    generatePairs.style.display = 'none';
}
const textOutput = document.querySelector('#text-output');

const copyButton = document.querySelector('#copy-button');
copyButton.onclick = function() {
    textOutput.select();
    document.execCommand("copy");
};

// data structures (see dataStructure.txt)
//===================================================

// words and characters
//--------------------------------------------

// an array of strings, 
// each string is a word of the text the words are nodes of a tree
// the collection of words has initially only an empty word (string) as root node
const words = [''];

// an array of strings, 
// each character of the strings characterizes a branch to a longer word
// the first word has no branches yet, thus the empty string
const wordsMoreChars = [''];

// an array of arrays of integers. 
// each integer is the index to the new word node reached by the branch.
// the first word has no branches yet. thus an array with an empty array as element
const wordsMoreWords = [
    []
];

// transitions from a single word to a new word
//--------------------------------------------------

// an array of arrays of integers, 
// each integer is the weight of the transition from a first word to a second one (corresponds to order of indices)
// the first word has not yet any transition, thus an array with an empty array element
const wordsTransitionWeights = [
    []
];

// an array of integers, 
// each integer is the sum of the transition weights to a second word
// plus the weight of the transition to the end of text
// no transition for the first word, the sum is thus zero
const wordsTransitionSums = [0];

// an array of integer arrays
// each integer is the index for the word reached by the transition
// this array defines all word pairs of the text
// the first word has not yet any transition, thus an array with an empty array element
const wordsTransitionIndices = [
    []
];

// pairs of words
//------------------------------------------------

// an array of integer arrays
// each integer is the index of the second word of the word pair
// the first word index selects the integer array
// this is the same as the transition indices from a first word to a second word
const wordsSecondWords = wordsTransitionIndices;

// an array of integer arrays
// each integer is an index to the (first word, second word) pair
// the first word is not yet part of any pair, thus an array with an empty array as element
const wordsPairIndices = [
    []
];

// an array of integers
// each integer defines a word pair
// it is the sum of 100'000 times the first word index plus the second word index
// this gives a safe integeer, assuming that there are not more than 100'000 words
// there is only one root word pair, made of two empty words of index 0
// thus an array with zero as only element
const pairs = [0];

// transition from pairs to single words 
//------------------------------------------------------
// (essentially the same as transitions from a single word to a new word)

// an array of arrays of integers, 
// each integer is the weight of the transition from a word pair to a new word (corresponds to order of indices)
// the first pair has not yet any transition, thus an array with an empty array element
const pairsTransitionWeights = [
    []
];

// an array of integers, 
// each integer is the sum of the transition weights to a new word
// plus the weight of the transition to the end of text
// no transition yet for the first pair, the sum is thus zero
const pairsTransitionSums = [0];

// an array of integer arrays
// each integer is the index for the word reached by the transition
// the first pair has not yet any transition, thus an array with an empty array element
const pairsTransitionIndices = [
    []
];