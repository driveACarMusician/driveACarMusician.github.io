'use strict';

let domHeaderIcon, domVerwijderAccount, domDarkTransparentDiv, domClose, domButtonCancel, domButtonConfirm, domWachtwoordInput, domWachtwoordLabel, domWachtwoordError, domPasswordToggleButton;
let leerkrachtNaam;
let hidePassword = false;

let url = 'https://driveacarmusiciangroep2.azurewebsites.net/api/vragen?leerkrachtNaam=';

// #region delete

const deleteAccount = function() {
  const wachtwoord = domWachtwoordInput.value;
  if (wachtwoord === '') domWachtwoordError.innerHTML = 'Geef uw wachtwoord in';
  if (wachtwoord !== '') {
    const encrypted = CryptoJS.SHA3(wachtwoord).toString();
    const json = `{ "Naam": "${leerkrachtNaam}", "Wachtwoord": "${encrypted}" }`;
    handleData(
      'https://driveacarmusiciangroep2.azurewebsites.net/api/gebruikers',
      function(data) {
        if (data === 'Het opgegeven wachtwoord is niet juist') domWachtwoordError.innerHTML = data;
        else if (data === 'De leerkracht is verwijderd') {
          deleteCookie('leerkracht');
          location.assign('index.html');
        } else domWachtwoordError.innerHTML = 'Er is een probleem opgetreden';
      },
      null,
      'DELETE',
      json
    );
  }
};

const deleteCookie = function(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const deleteQuestion = function(questions) {
  let array = '[';
  for (let i = 0; i < questions.length; i++) {
    array += '"' + document.getElementById(`vraagid${questions[i]}`).textContent + '",';
  }

  array += ']';
  //todo
  // console.log(array);
  handleData(url, hallo, null, 'DELETE', array, {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  });
};

//#endregion

// #region other

const checkFilled = function(formData) {
  let filled = true,
    i = 0;

  for (i; i < formData.length; i++) {
    if (formData[i] === '') filled = false;
  }

  // console.log(filled);

  return filled;
};

const hallo = function(data) {
  // console.log(data);
  location.reload(true);
};

const andereHallo = function(data) {
  // console.log(data);
};

//#endregion

// #region display

const displayQuestions = async function(questions) {
  let i = 0;
  let html = '';
  console.log(questions);
  for (i; i < questions.length; i++) {
    html = `<form class="c-form">
            <div class="c-form__header" id="form${i}">
                <h6 id="vraagid${i}" style="display: none;">${questions[i].id}</h6>
                <div class="c-form__header__title"><input class="c-input__question js-vraaginhoud${i}" value="${questions[i].vraagInhoud}" id="title${i}" readonly></div>
                    <div class="c-form__header__icons">
                        <svg class="c-form__header__edit" id="edit${i}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        <label class="pure-material-checkbox">
                            <input class="js-checkbox" type="checkbox" id="check${i}">
                            <span></span>
                        </label>  
                    </div>
                </div>
            </div>
            <div class="c-form__content" style="display:none" id="hide${i}">
                <h3> Selecteer het correcte antwoord </h3>
                <div class="c-form__content__item">
                  <label class="pure-material-radio">
                    <input class="js-input-antwoord-checkbox${i}" type="radio" checked name="Voorbeeldvraag ${i}" id="vraag${i}Radio1" for="antwoord1">
                    <span></span>
                  </label>
                    <input class="c-input js-input-antwoord-input${i}" name="antwoord1" id="vraag${i}Input1" value="${questions[i].antwoorden[0]}" required>
                </div>
                <div class="c-form__content__item">
                  <label class="pure-material-radio">
                    <input class="js-input-antwoord-checkbox${i}" type="radio" name="Voorbeeldvraag ${i}" id="vraag${i}Radio2" for="antwoord2">
                    <span></span>
                  </label>
                    <input class="c-input js-input-antwoord-input${i}" name="antwoord2" id="vraag${i}Input2" value="${questions[i].antwoorden[1]}" required>
                </div>
                <div class="c-form__content__item">
                  <label class="pure-material-radio">
                    <input class="js-input-antwoord-checkbox${i}" type="radio" name="Voorbeeldvraag ${i}" id="vraag${i}Radio3" for="antwoord3">
                    <span></span>
                  </label>
                    <input class="c-input js-input-antwoord-input${i}" name="antwoord3" id="vraag${i}Input3" value="${questions[i].antwoorden[2]}" required>
                </div>
                <div class="c-form__content__item">
                  <label class="pure-material-radio">
                    <input class="js-input-antwoord-checkbox${i}" type="radio" name="Voorbeeldvraag ${i}" id="vraag${i}Radio4" for="antwoord4">
                    <span></span>
                  </label>
                    <input class="c-input js-input-antwoord-input${i}" name="antwoord 4" id="vraag${i}Input4" value="${questions[i].antwoorden[3]}" required>
                </div>
                <p class="c-form-field--button" id="addBtn${i}" >
                    <input type="button" class="o-button-reset c-button c-button__confirm js-login" value="Opslaan" />
                </p>
            </div>
        </form>`;
    document.getElementById('questions').insertAdjacentHTML('beforeend', html);
    // console.log(document.getElementById(`form${i}`).addEventListener())
    let number = i;
    document.getElementById(`edit${i}`).addEventListener('click', () => {
      if (document.getElementById(`hide${number}`).style.display === 'none') {
        document.getElementById(`hide${number}`).style.display = 'block';
        document.querySelector(`.js-vraaginhoud${number}`).readOnly = false;
        // console.log(document.getElementById(`hide${number}`).style.display);
      } else {
        document.getElementById(`hide${number}`).style.display = 'none';
        document.querySelector(`.js-vraaginhoud${number}`).readOnly = true;
        // console.log(document.getElementById(`hide${number}`).style.display);
      }
    });
    document.getElementById(`addBtn${i}`).addEventListener('click', async () => {
      const domInputAntwoordCheckboxAll = document.querySelectorAll(`.js-input-antwoord-checkbox${number}`);
      let antwoord1Index;
      for (let j = 0; j < domInputAntwoordCheckboxAll.length; j++) {
        if (domInputAntwoordCheckboxAll[j].checked === true) {
          antwoord1Index = j;
          break;
        }
      }
      const domInputAntwoordInputAll = document.querySelectorAll(`.js-input-antwoord-input${number}`);
      let antwoorden = [domInputAntwoordInputAll[antwoord1Index].value];
      for (let j = 0; j < domInputAntwoordCheckboxAll.length; j++) if (j !== antwoord1Index) antwoorden.push(domInputAntwoordInputAll[j].value);
      const antwoord1 = antwoorden[0];
      const antwoord2 = antwoorden[1];
      const antwoord3 = antwoorden[2];
      const antwoord4 = antwoorden[3];
      const vraagInhoud = document.querySelector(`.js-vraaginhoud${number}`).value;

      const data = `{ "Id": "${questions[number].id}", "VraagInhoud": "${vraagInhoud}", "Antwoorden": [ "${antwoord1}", "${antwoord2}", "${antwoord3}", "${antwoord4}" ], "LeerkrachtNaam": "${leerkrachtNaam}" }`;
      console.log(data);
      const putVragenUrl = 'https://driveacarmusiciangroep2.azurewebsites.net/api/vragen';
      handleData(putVragenUrl, andereHallo, null, 'PUT', data, {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      });
      document.getElementById(`hide${number}`).style.display = 'none';
    });
    console.log(document.getElementById(`vraagid${i}`).innerHTML);

  }
};

//#endregion

// #region get

const getCookie = function(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return '';
};

const getQuestions = async function() {
  const response = await fetch(url);
  const data = await response.json();
  document.getElementById('loader').style.display = 'none';
  await displayQuestions(data);
};

//#endregion

// #region listenTo

const listenToPasswordToggleButton = function() {
  domPasswordToggleButton.addEventListener('click', function() {
    // console.log('password toggle button pressed');
    if (hidePassword === true) {
      hidePassword = false;
      domWachtwoordInput.type = 'password';
    } else if (hidePassword === false) {
      hidePassword = true;
      domWachtwoordInput.type = 'text';
    }
  });
};

const listenToWachtwoordInput = function() {
  domWachtwoordInput.addEventListener('input', function() {
    // console.log('wachtwoord input');
    if (domWachtwoordInput.value === '') domWachtwoordLabel.classList.remove('js-keep-floating');
    else if (domWachtwoordInput.value !== '') domWachtwoordLabel.classList.add('js-keep-floating');
  });
  domWachtwoordInput.addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      deleteAccount();
    }
  });
};

const listenToButtonConfirm = function() {
  domButtonConfirm.addEventListener('click', deleteAccount);
};

const listenToButtonCancel = function() {
  domButtonCancel.addEventListener('click', function() {
    domDarkTransparentDiv.classList.add('u-hidden');
  });
};

const listenToClose = function() {
  domClose.addEventListener('click', function() {
    domDarkTransparentDiv.classList.add('u-hidden');
  });
};

const listenToVerwijderAccount = function() {
  domVerwijderAccount.addEventListener('click', function() {
    domDarkTransparentDiv.classList.remove('u-hidden');
  });
};

const listenToDelete = function() {
  document.getElementById('delete').addEventListener('click', function() {
    let toDelete = [], tens;
    const checkboxes = document.querySelectorAll('.js-checkbox');
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked === true && checkboxes[i].id !== 'selectAll') {
        if(Number.isInteger(parseInt(checkboxes[i].id.charAt(checkboxes[i].id.length - 2)))){
          tens = checkboxes[i].id.charAt(checkboxes[i].id.length - 2);
          tens += checkboxes[i].id.charAt(checkboxes[i].id.length - 1);
          toDelete.push(parseInt(tens))
        } else toDelete.push(parseInt(checkboxes[i].id.charAt(checkboxes[i].id.length - 1)));
      } 
    }
    console.log(toDelete);
    deleteQuestion(toDelete);
  });
};

const listenToSelectAll = function() {
  document.getElementById('selectAll').addEventListener('click', function() {
    let state = document.getElementById('selectAll').checked;
    console.log(state);
    if (state === true) {
      let checkboxes = document.querySelectorAll('.js-checkbox');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
      }
    } else {
      let checkboxes = document.querySelectorAll('.js-checkbox');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
    }
  });
};

const listenToHeaderIcon = function() {
  domHeaderIcon.addEventListener('click', function() {
    location.assign('index.html');
  });
};

const listenToAddBtn = function() {
  document.getElementById('addBtnNew').addEventListener('click', function() {
    let vraag = document.getElementById('vraag').value;
    let antwoord1 = document.getElementById(`addInput1`).value;
    let antwoord2 = document.getElementById(`addInput2`).value;
    let antwoord3 = document.getElementById(`addInput3`).value;
    let antwoord4 = document.getElementById(`addInput4`).value;

    let inputValues = [vraag, antwoord1, antwoord2, antwoord3, antwoord4];

    if (checkFilled(inputValues)) {
      const data = `{ "VraagInhoud": "${vraag}", "Antwoorden": [ "${antwoord1}", "${antwoord2}", "${antwoord3}", "${antwoord4}" ], "LeerkrachtNaam": "${leerkrachtNaam}" }`;
      handleData(url, hallo, null, 'POST', data, {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      });
      // location.reload(true);
    }
  });
};

const listenToAdd = function() {
  document.getElementById('add_circle-24px').addEventListener('click', function() {
    let display = document.getElementById('hideNew').style.display;
    if (display === 'none') {
      document.getElementById('hideNew').style.display = 'block';
      document.getElementById('header').style.borderBottom = 'none';
      document.getElementById('newQuestion').style.borderBottom = '2px solid #728497';
    } else {
      document.getElementById('hideNew').style.display = 'none';
      document.getElementById('newQuestion').style.borderBottom = 'none';
      document.getElementById('header').style.borderBottom = '2px solid #728497';
    }
  });
};

const listenToForm = function(index) {
  if (document.getElementById(`hide${index}`).style.display === 'none') {
    document.getElementById(`hide${index}`).style.display = 'block';
    console.log(document.getElementById(`hide${index}`).style.display);
  } else {
    document.getElementById(`hide${index}`).style.display = 'none';
    console.log(document.getElementById(`hide${index}`).style.display);
  }
  console.log('listener');
};

//#endregion

// #region init and domContenLoaded

const init = function() {
  domHeaderIcon = document.querySelector('.c-header__icon');
  domVerwijderAccount = document.querySelector('.js-verwijder-account-link');
  domDarkTransparentDiv = document.querySelector('.c-dark-transparent-div');
  domClose = document.querySelector('.c-icon--close');
  domButtonCancel = document.querySelector('.js-button-cancel');
  domButtonConfirm = document.querySelector('.js-button-confirm');
  domWachtwoordInput = document.querySelector('#wachtwoord');
  domWachtwoordLabel = document.querySelector('.js-wachtwoord-label');
  domWachtwoordError = document.querySelector('.js-wachtwoord-error');
  domPasswordToggleButton = document.querySelector('#passwordtoggle');

  leerkrachtNaam = getCookie('leerkracht');
  if (leerkrachtNaam === 'leerkracht') domVerwijderAccount.classList.add('u-hidden');
  url = `${url}${leerkrachtNaam}`;
  console.log(url);

  getQuestions();
  listenToAdd();
  listenToAddBtn();
  listenToSelectAll();
  listenToDelete();
  listenToHeaderIcon();
  listenToVerwijderAccount();
  listenToClose();
  listenToButtonCancel();
  listenToButtonConfirm();
  listenToWachtwoordInput();
  listenToPasswordToggleButton();
};

document.addEventListener('DOMContentLoaded', function() {
  console.info('DOM geladen');
  init();
});

//#endregion
