/* jshint esversion: 6 */

const openButton = document.querySelector('#open-button');

    const aElement = document.createElement("a");
    aElement.style.display = "none";
    document.body.appendChild(aElement);
    aElement.target="_blank";
    aElement.rel="noreferrer noopener";
aElement.href='https://twitter.com/search?q=enemy of the%20people%20(from%3Arealdonaldtrump)&src=typed_query&f=live'

openButton.onclick=function(){
	console.log('open')
	aElement.click();
}
