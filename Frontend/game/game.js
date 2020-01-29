'use strict';

let DomScore, DomVragen, DomAvatar, DomBackground, DomVraag, DomButtons, DomCanvas, DomHome, DomNext, DomVragenProgressText, DomVragenProgressBarBackground, DomVragenProgressBar, DomVragenTitle, DomLevel;
let DomVragenAntwoordAll, DomSvgArrowAllJs, DomSvgArrowAllC, DomOverzichtItemAntwoordenAll;
let shuffledQuestions = null;
let questions;
let correctAnswers = [];
let currentQuestion = 0;
let currentQuestionAll = 0;
let questionsAmount = 3;
let questionAnswersPicked = [];
let level = 0; //when the level is paused it will call getVragen which does +1
let overzichtIsVisible = false;
let answerChecked = false;
let goingToScoreboard = false;
let gebruikerNaam, gebruikerAvatar, gebruikerAuto;
const apiUrl = 'https://driveacarmusiciangroep2.azurewebsites.net/api/';

// #region display

const displayAvatar = function() {
    DomAvatar.innerHTML = `<img class="c-avatar__image" src="${gebruikerAvatar}" alt="avatar" />`;
};

const displayProgressBar = function() {
    DomVragenProgressText.innerHTML = `${currentQuestion}/${questionsAmount}`;
    let progressBarWidth = (currentQuestion / questionsAmount) * DomVragenProgressBarBackground.offsetWidth;
    if (progressBarWidth !== 0) progressBarWidth -= 4; //-4px because of the borders
    if (currentQuestion === questionsAmount) {
        DomVragenProgressBar.style['border-top-right-radius'] = '10px';
        DomVragenProgressBar.style['border-bottom-right-radius'] = '10px';
    } else {
        DomVragenProgressBar.style['border-top-right-radius'] = 0;
        DomVragenProgressBar.style['border-bottom-right-radius'] = 0;
    }
    DomVragenProgressBar.style.width = `${progressBarWidth}px`;
};

const displayOverzicht = function() {
    overzichtIsVisible = true;
    DomVragenTitle.innerHTML = 'Overzicht';
    if (level !== 3) DomNext.innerHTML = `Level ${level + 1}`;
    else {
        goingToScoreboard = true;
        DomNext.innerHTML = 'Scorebord';
    }
    DomVraag.classList.add('u-hidden');
    DomVragenProgressText.classList.add('u-hidden');
    DomVragenProgressBarBackground.classList.add('u-hidden');
    let htmlButtons = '';
    for (let i = 0; i < questionsAmount; i++) {
        htmlButtons += `<div class="c-vragen-antwoord `;
        const correctAnswer = correctAnswers[i];
        const answerPicked = questionAnswersPicked[i];
        const question = questions[i]
        if (answerPicked === correctAnswer) htmlButtons += 'c-vragen-antwoord__correct';
        else {
            goingToScoreboard = true;
            DomNext.innerHTML = 'Scorebord';
            htmlButtons += 'c-vragen-antwoord__fout';
        }
        htmlButtons += ` js-keuze">${question.vraagInhoud}
			<div class="js-svg-arrow">
				<svg class="c-svg__arrow js-svg-arrow-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
			</div>
		</div>
        <div class="c-overzicht__item-antwoorden u-hidden">
			<div class="c-overzicht__item-antwoorden__item">
				<span class="c-overzicht__item-antwoorden__item__header">Uw antwoord:</span>
				<span class="c-overzicht__item-antwoorden__item__body">${answerPicked}</span>
			</div>
			<div class="c-overzicht__item-antwoorden__item">
				<span class="c-overzicht__item-antwoorden__item__header">Juiste antwoord:</span>
				<span class="c-overzicht__item-antwoorden__item__body">${correctAnswer}</span>
			</div>
		</div>`;
    }
    DomButtons.innerHTML = htmlButtons;

    DomVragenAntwoordAll = document.querySelectorAll('.c-vragen-antwoord');
    DomSvgArrowAllJs = document.querySelectorAll('.js-svg-arrow');
    DomOverzichtItemAntwoordenAll = document.querySelectorAll('.c-overzicht__item-antwoorden');
    for (let i = 0; i < DomVragenAntwoordAll.length; i++) {
        DomVragenAntwoordAll[i].addEventListener('click', function() {
            DomSvgArrowAllC = document.querySelectorAll('.c-svg__arrow'); //this must be placed in the event listener because DomSvgArrowAllC must be updated
            if (DomSvgArrowAllC[i].classList.contains('js-svg-arrow-down')) {
                DomOverzichtItemAntwoordenAll[i].classList.remove('u-hidden');
                DomSvgArrowAllJs[i].innerHTML = '<svg class="c-svg__arrow js-svg-arrow-up" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
            } else if (DomSvgArrowAllC[i].classList.contains('js-svg-arrow-up')) {
                DomOverzichtItemAntwoordenAll[i].classList.add('u-hidden');
                DomSvgArrowAllJs[i].innerHTML = '<svg class="c-svg__arrow js-svg-arrow-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
            }
        });
    }
};

const displayVragen = function() {
    currentQuestionAll++;
    currentQuestion++;
    DomVragenTitle.innerHTML = `Vraag ${currentQuestion}`;
    DomNext.classList.add('u-hidden');
    let juisteAntwoord = questions[currentQuestion - 1].antwoorden[0];
    correctAnswers.push(juisteAntwoord);
    let antwoorden = shuffle(questions[currentQuestion - 1].antwoorden);

    let htmlButtons = ``;
    for (let i = 0; i < antwoorden.length; i++) htmlButtons += `<div class="c-vragen-antwoord js-keuze">${i + 1}. ${antwoorden[i]}</div>`; //1. antwoord 1
    DomButtons.innerHTML = htmlButtons;
    DomVragenProgressBarBackground.classList.remove('u-hidden');
    DomVraag.classList.remove('u-hidden');
    DomVraag.innerHTML = `${questions[currentQuestion - 1].vraagInhoud}`;

    listenToKeuzes(juisteAntwoord);
};

//#endregion

// #region other
const saveVragenData = function(data) {
    shuffledQuestions = shuffle(data);
    // console.log('data has been saved for later use');
};

const processVragenData = function() {
    if (shuffledQuestions.length < questionsAmount) questionsAmount = shuffledQuestions.length; //if there are less than 3 questions
    let endIndex = currentQuestionAll + 4; //4 = 3 questions + 1
    if (endIndex > shuffledQuestions.length) endIndex = shuffledQuestions.length;
    questions = shuffledQuestions.slice(currentQuestionAll, endIndex - 1);
    DomBackground.classList.remove('u-hidden');
    questionAnswersPicked = [];
    correctAnswers = [];
    currentQuestion = 0;
};

const GoToNextLevel = function() {
    overzichtIsVisible = false;
    DomBackground.classList.add('u-hidden');
    DomLevel.innerHTML = `Level ${level + 1}`;

    game.scene.stop(`Level${level}`);
    game.scene.start('CountdownHUD');
    game.scene.start(`Level${level + 1}`);
};

const GoToScoreboard = function(data, json) {
    postGebruikerAndScore(json);
    putAvatarAuto();
    location.assign('../scoreboard.html');
};

const GoToHome = function(data, json) {
    if (data === 'Deze gebruiker bestaat niet') {
        postGebruikerAndScore(json);
        putAvatarAuto();
    } else location.assign('../Index.html');
};

const shuffle = function(array) {
    var m = array.length,
        t,
        i;
    while (m > 0) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
};

const checkIfCorrect = function(data, element, juisteAntwoord) {
    if (answerChecked === false) {
        element = element.slice(3); //get rid of '1. '
        questionAnswersPicked.push(element);
        if (element === juisteAntwoord) {
            data.classList.add('c-vragen-antwoord__correct');

            data.innerHTML += `<svg class="c-svg__check-mark" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 78.369 78.369" style="enable-background:new 0 0 78.369 78.369;" xml:space="preserve"><g><path d="M78.049,19.015L29.458,67.606c-0.428,0.428-1.121,0.428-1.548,0L0.32,40.015c-0.427-0.426-0.427-1.119,0-1.547l6.704-6.704c0.428-0.427,1.121-0.427,1.548,0l20.113,20.112l41.113-41.113c0.429-0.427,1.12-0.427,1.548,0l6.703,6.704C78.477,17.894,78.477,18.586,78.049,19.015z" /></g></svg>`;
            points += 30;
            DomScore.innerHTML = `Score: ${points}`;
        } else if (element !== juisteAntwoord) {
            data.classList.add('c-vragen-antwoord__fout');
            data.innerHTML += `<svg class="c-svg__cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
        }
        if (currentQuestion === questionsAmount) DomNext.innerHTML = 'Overzicht';
        else DomNext.innerHTML = 'Volgende';
        DomNext.classList.remove('u-hidden');
    }
    answerChecked = true;
};

//#endregion

// #region Put

const putAvatarAuto = function() {
    const json = `{ "Naam": "${gebruikerNaam}", "Avatar": "${gebruikerAvatar}", "Auto": "${gebruikerAuto}" }`;
    handleData(
        `${apiUrl}gebruikers`,
        function(data) {
            //done
            // console.log(data);
        },
        null,
        'PUT',
        json
    );
};

// #endregion

// #region Post

const postGebruikerAndScore = function(data) {
    const json = `{ "Naam": "${gebruikerNaam}", "Avatar": "${gebruikerAvatar}", "Auto": "${gebruikerAuto}", "TypeGebruiker": "Leerling" }`;
    handleData(
        `${apiUrl}gebruikers`,
        function(responseData) {
            const json = `{ "Naam": "${gebruikerNaam}", "Score": "${points}" }`;
            handleData(`${apiUrl}scores`, callback, data, 'POST', json);
        },
        null,
        'POST',
        json
    );
};

const postScoreAndName = function(callback) {
    const json = `{ "Naam": "${gebruikerNaam}", "Score": "${points}" }`;
    // console.log(json);
    handleData(`${apiUrl}scores`, callback, json, 'POST', json);
};

// #endregion

// #region get

const getCarColour = function() {
    let key = getCookie('car');
    // console.log(key);
    if (key === 'https://driveacarmusiciangroep2.blob.core.windows.net/autos/0189e357-086e-4bf3-ba0d-ff3bab620804.png') {
        return 'red';
    } else if (key === 'https://driveacarmusiciangroep2.blob.core.windows.net/autos/0d5bad76-a500-4aff-b8c5-ca7be4704345.png') {
        return 'orange';
    } else if (key === 'https://driveacarmusiciangroep2.blob.core.windows.net/autos/39659f2d-c0a1-4683-8d94-971dddacb347.png') {
        return 'purple';
    } else if (key === 'https://driveacarmusiciangroep2.blob.core.windows.net/autos/612fc52d-bf38-4187-bc9d-03026f0f55c8.png') {
        return 'yellow';
    } else if (key === 'https://driveacarmusiciangroep2.blob.core.windows.net/autos/c23d07a4-7980-4b4e-8e07-8e40fb7b6832.png') {
        return 'green';
    } else if (key === 'https://driveacarmusiciangroep2.blob.core.windows.net/autos/e81e28d2-eca3-469d-b084-84dd35595f52.png') {
        return 'blue';
    } else {
        return 'yellow';
    }
};

const getVragen = function() {
    level++;
    const checkVragenData = function() {
        if (shuffledQuestions !== null) {
            //data has been saved
            processVragenData();
            displayVragen();
            DomVragenProgressBar.classList.add('u-hidden');
            displayProgressBar();
            DomVragenProgressBar.style.width = '0px';
            DomVragenProgressBar.classList.remove('u-hidden');
            DomVragenProgressText.classList.remove('u-hidden');
        }
    };
    setTimeout(checkVragenData, 100);
};

const getVragenData = function(leerkrachtnaam = 'leerkracht') {
    let leerkrachtCookieValue = getCookie('leerkracht');
    if (leerkrachtCookieValue !== '' && leerkrachtCookieValue !== 'undefined') leerkrachtnaam = leerkrachtCookieValue;
    handleData(`${apiUrl}vragen?leerkrachtnaam=${leerkrachtnaam}`, saveVragenData);
};

const getCookie = function(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};
//#endregion

// #region listenTo
const listenToKeuzes = function(juisteAntwoord) {
    const btn = document.querySelectorAll('.js-keuze');
    for (const b of btn) {
        b.addEventListener('click', function() {
            displayProgressBar();
            checkIfCorrect(this, this.innerHTML, juisteAntwoord);
        });
    }
};

const listenToHome = function() {
    DomHome.addEventListener('click', function() {
        postScoreAndName(GoToHome);
    });
};

const listenToNext = function() {
    DomNext.addEventListener('click', function() {
        answerChecked = false;
        if (goingToScoreboard === true) {
            //all levels completed
            postScoreAndName(GoToScoreboard);
        } else if (overzichtIsVisible === true) GoToNextLevel();
        else if (currentQuestion === questionsAmount) displayOverzicht();
        else if (overzichtIsVisible === false) displayVragen();
    });
};

//#endregion

// #region game
var points = 0;

var config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 700,
    parent: 'game-canvas',
    id: 'canvas-id',
    carColor: getCarColour(),
    audio: {
        disableWebAudio: true
    },
    scale: {
        mode: Phaser.Scale.FIT
    },
    physics: {
        default: 'arcade'
    },
    scene: [Level1, Level2, Level3, CountdownHUD]
};

var game = new Phaser.Game(config);

//#endregion

// #region init / DomContenLoaded

const init = function() {
    DomAvatar = document.querySelector('.c-avatar');
    DomScore = document.querySelector('.c-score-text');
    DomVragen = document.querySelector('.js-vragen');
    DomBackground = document.querySelector('.js-background');
    DomVraag = document.querySelector('.c-vragen-vraaginhoud');
    DomButtons = document.querySelector('.c-vragen-antwoorden');
    DomHome = document.querySelector('.js-home');
    DomNext = document.querySelector('.js-next');
    DomVragenProgressText = document.querySelector('.c-vragen-progress-text');
    DomVragenProgressBarBackground = document.querySelector('.c-vragen-progress-bar__background');
    DomVragenProgressBar = document.querySelector('.c-vragen-progress-bar');
    DomVragenTitle = document.querySelector('.c-vragen-title');
    DomLevel = document.querySelector('.c-level');

    gebruikerNaam = getCookie('naam');
    gebruikerAvatar = getCookie('avatar');
    gebruikerAuto = getCookie('car');

    listenToHome();
    listenToNext();
    displayAvatar();
    getVragenData();
};

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');

    init();
});

//#endregion
