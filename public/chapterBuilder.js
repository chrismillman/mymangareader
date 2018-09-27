let myData = null;
let user_id = "chris";
// Send a request to the server with your google id
const requestURL = '/user/' + user_id;
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();

request.onload = function() {
  myData = request.response;
  buildPage(myData);
}

async function buildPage(myData){
  //appendSeriesList(myData);
  appendChapters(myData);
  await initAccordion(document.getElementById("accordion"));
}

function initAccordion(accordionElem) {

  function handlePanelClick(event) {
    showPanel(event.currentTarget);
  }

  function showPanel(panel) {
    let expandedPanels = accordionElem.querySelectorAll(".active");
    let found = false;

    for (let i=0; i < expandedPanels.length; i++) {
      if (expandedPanels[i] === panel) {
        expandedPanels[i].classList.remove("active");
        found = true;
      }
    }
    if (found === false) {
      panel.classList.add("active");
    }

    panel.scrollIntoView({ block: 'start', behavior: 'smooth'});
  }

  let allPanelElems = accordionElem.querySelectorAll(".panel");
  for (let i=0; i < allPanelElems.length; i++) {
    allPanelElems[i].addEventListener("click", handlePanelClick);
  }
}

async function appendSeriesList(myData) {
  if (myData === []) {
    return;
  }
  let seriesArea = document.getElementById('series-display');
  let seriesString = "My Series: ";
  for (const series of myData) {
    seriesString += series.name;
    if (myData.indexOf(series) !== myData.length -1) {
      seriesString += ", "
    }
  }
  // Adding Series List
  let h4 = document.createElement("h4");
  let seriesText = document.createTextNode(seriesString);
  h4.appendChild(seriesText);

  seriesArea.appendChild(h4);
}

function handleRemoveClick(event) {
  event.stopPropagation();

  let panel = event.currentTarget.parentElement.parentElement;

  console.log("trying to remove....");
  const removeURL = "/remove/" + user_id + '/' + panel.id;
  let request = new XMLHttpRequest();
  request.open('GET', removeURL);
  request.send();

  request.onload = function() {
  }
  let accordion = document.getElementById("accordion");
  accordion.removeChild(panel);
  console.log("removing " + panel.id + "...");
  panel.scrollIntoView({ block: 'start', behavior: 'instant'});
}

function handlePreviousClick(event) {
  event.stopPropagation();

  let panel = event.currentTarget.parentElement.parentElement;
  panel.scrollIntoView({ block: 'start', behavior: 'instant'});

  // todo - send series to server, decrement user's chapter number of series
  const previousURL = "/previous/" + user_id + '/' + panel.id;
  let request = new XMLHttpRequest();
  request.open('GET', previousURL);
  request.responseType = 'json';
  request.send();

  request.onload = function() {
    removeSeriesFromPage(panel.id);
    addSeriesToPage(panel.id, request.response[0]);
  }
}

async function handleNextClick(event) {
  event.stopPropagation();

  let panel = event.currentTarget.parentElement.parentElement;
  panel.scrollIntoView({ block: 'start', behavior: 'instant'});

  // todo - send series to server, increment user's chapter number of series
  const nextURL = "/next/" + user_id + '/' + panel.id;
  let request = new XMLHttpRequest();
  request.open('GET', nextURL);
  request.responseType = 'json';
  request.send();

  request.onload = function() {
    removeSeriesFromPage(panel.id);
    addSeriesToPage(panel.id, request.response[0]);
  }
}

async function appendChapters(myData) {
  if (myData === []) {
    return;
  }
  let chapterArea = document.getElementById('chapter-area');
  let accordion = document.createElement('div');
  accordion.id = "accordion";
  chapterArea.appendChild(accordion);
  for (const series of myData) {
    // Adding Chapter Pages
    let div1 = document.createElement("div");
    div1.classList.add("panel");
    div1.id = series.name;

    // Top Buttons
    let buttonsTop = document.createElement("div");
    buttonsTop.classList.add("buttons");

    let removeTop = document.createElement("div");
    removeTop.classList.add("remove");
    let xTop = document.createTextNode("x");
    removeTop.appendChild(xTop);
    removeTop.addEventListener("click", handleRemoveClick);

    let previousTop = document.createElement("div");
    previousTop.classList.add("previous");
    let leftTop = document.createTextNode("<");
    previousTop.appendChild(leftTop);
    previousTop.addEventListener("click", handlePreviousClick);

    let nextTop = document.createElement("div");
    nextTop.classList.add("next");
    let rightTop = document.createTextNode(">");
    nextTop.appendChild(rightTop);
    nextTop.addEventListener("click", handleNextClick);

    // Bottom Buttons
    let buttonsBottom = document.createElement("div");
    buttonsBottom.classList.add("buttons");

    let removeBottom = document.createElement("div");
    removeBottom.classList.add("remove");
    let xBottom = document.createTextNode("x");
    removeBottom.appendChild(xBottom);
    removeBottom.addEventListener("click", handleRemoveClick);

    let previousBottom = document.createElement("div");
    previousBottom.classList.add("previous");
    let leftBottom = document.createTextNode("<");
    previousBottom.appendChild(leftBottom);
    previousBottom.addEventListener("click", handlePreviousClick);

    let nextBottom = document.createElement("div");
    nextBottom.classList.add("next");
    let rightBottom = document.createTextNode(">");
    nextBottom.appendChild(rightBottom);
    nextBottom.addEventListener("click", handleNextClick);

    let h3 = document.createElement("h3");
    let chapterText = document.createTextNode(series.name);
    h3.appendChild(chapterText);
    div1.appendChild(h3);

    // Add Images
    let images = document.createElement("div");
    images.id = "images";
    buttonsTop.appendChild(previousTop);
    buttonsTop.appendChild(nextTop);
    buttonsTop.appendChild(removeTop);
    div1.appendChild(buttonsTop);
    for (let i=0; i < series.images.length; i++) {
      let src = series.images[i];
      img = document.createElement('img');
      img.src = src;

      images.appendChild(img);
    }
    buttonsBottom.appendChild(previousBottom);
    buttonsBottom.appendChild(nextBottom);
    buttonsBottom.appendChild(removeBottom);
    div1.appendChild(images);
    div1.appendChild(buttonsBottom)
    accordion.appendChild(div1);
  }
}

function removeSeriesFromPage(series) {
  let chapterArea = document.getElementById(series);
  let childNodes = document.getElementById(series).childNodes;


  chapterArea.removeChild(childNodes[2]);
  chapterArea.removeChild(childNodes[2]);
}

function addSeriesToPage(series, list) {
  // todo - add images div to the series on the current page with the given list of images
  let chapterArea = document.getElementById(series);

  let images = document.createElement("div");
  images.id = "images";

  for (let i=0; i < list.images.length; i++) {
    let src = list.images[i];
    img = document.createElement('img');
    img.src = src;

    images.appendChild(img);
  }

  let buttonsBottom = document.createElement("div");
  buttonsBottom.classList.add("buttons");

  let removeBottom = document.createElement("div");
  removeBottom.classList.add("remove");
  let xBottom = document.createTextNode("x");
  removeBottom.appendChild(xBottom);
  removeBottom.addEventListener("click", handleRemoveClick);

  let previousBottom = document.createElement("div");
  previousBottom.classList.add("previous");
  let leftBottom = document.createTextNode("<");
  previousBottom.appendChild(leftBottom);
  previousBottom.addEventListener("click", handlePreviousClick);

  let nextBottom = document.createElement("div");
  nextBottom.classList.add("next");
  let rightBottom = document.createTextNode(">");
  nextBottom.appendChild(rightBottom);
  nextBottom.addEventListener("click", handleNextClick);

  buttonsBottom.appendChild(previousBottom);
  buttonsBottom.appendChild(nextBottom);
  buttonsBottom.appendChild(removeBottom);

  chapterArea.appendChild(images);
  chapterArea.appendChild(buttonsBottom);
}
