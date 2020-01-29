'use strict';

let domInstellingen, domStart, domButtonBevestig, domLeerkrachtLabel, domLeerkrachtError, domPopup1, domPopup2, domClose, domClose2, domLeerkrachtInput, domLogin, domFormFieldLink, domConfirmPassword, domNaamError, domWachtwoordError, domNaamInput, domWachtwoordInput, domDarkTransparentDiv, domWachtwoordBevestigingError, domRegistrerenLink, domWachtwoordBevestigingInput, domPasswordToggleButton, domPasswordConfirmToggleButton, domNaamLabel, domWachtwoordLabel, domWachtwoordBevestigingLabel;
let registrerenVisible = false;
let hidePassword = false;
let hidePasswordConfirm = false;
let leerkrachtNaam;

const backendUrl = 'https://driveacarmusiciangroep2.azurewebsites.net/api/';

// #region other
const goToLogingLeerling = function(data) {
	if (data === true) {
		document.cookie = `leerkracht=${domLeerkrachtInput.value}`;
		location.assign('./start.html');
	} else {
		domLeerkrachtError.innerHTML = 'Geef een juiste leerkracht op!';
	}
};
// #endregion

// #region Display begin

const displayInloggen = function() {
	registrerenVisible = false;
	domConfirmPassword.classList.add('u-hidden');
	domWachtwoordBevestigingError.classList.add('u-hidden');
	domLogin.value = 'Inloggen';
	domRegistrerenLink.value = 'Registreren';
	if (domNaamInput.value === '') domNaamInput.focus();
	else if (domWachtwoordInput.value === '') domWachtwoordInput.focus();
};

const displayRegistreren = function() {
	registrerenVisible = true;
	domConfirmPassword.classList.remove('u-hidden');
	domWachtwoordBevestigingError.classList.remove('u-hidden');
	domLogin.value = 'Registreren';
	domRegistrerenLink.value = 'Inloggen';
	if (domNaamInput.value === '') domNaamInput.focus();
	else if (domWachtwoordInput.value === '') domWachtwoordInput.focus();
	else if (domWachtwoordBevestigingInput.value === '') domWachtwoordBevestigingInput.focus();
};

const displayLeerkracht = function(status) {
	if (status === true) {
		domPopup2.classList.remove('u-hidden');
		domLeerkrachtInput.focus();
	} else if (status === false) domPopup2.classList.add('u-hidden');
};

const displayLogin = function(status) {
	if (status === true) {
		domPopup1.classList.remove('u-hidden');
		domNaamInput.focus();
	} else if (status === false) domPopup1.classList.add('u-hidden');
};

const displayNextPage = function(data) {
	// console.log(data);
	if (data === true || (data.id && data.naam && data.typeGebruiker)) {
		//'data === true': for logging in
		//'data.id && data.naam && data.typeGebruiker': for registering
		document.cookie = `leerkracht=${domNaamInput.value}`; //key=value
		location.assign('./settings.html');
	} else if (data === false) {
		//wachtwoord is niet juist
		domWachtwoordError.innerHTML = 'Wachtwoord is niet juist!';
	} else if (data === 'Deze gebruiker bestaat niet' || data === 'Gebruikersnaam is al in gebruik') domNaamError.innerHTML = data;
};

//	#endregion

// #region Controle begin

const controleRegistreren = function() {
	domNaamError.innerHTML = '';
	domWachtwoordError.innerHTML = '';
	domWachtwoordBevestigingError.innerHTML = '';

	const naam = domNaamInput.value;
	const wachtwoord = domWachtwoordInput.value;

	if (naam === '') domNaamError.innerHTML = 'Geef uw naam in';
	if (wachtwoord === '') domWachtwoordError.innerHTML = 'Geef uw wachtwoord in';
	if (naam !== '' && wachtwoord !== '') {
		const checkPasswordStrength = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
		const passwordIsStrong = checkPasswordStrength.test(wachtwoord);
		if (passwordIsStrong === false) domWachtwoordError.innerHTML = 'Uw wachtwoord moet minstens 8 karakters lang zijn en het<br>moet letters en cijfers bevatten';

		const passwordsMatch = domWachtwoordBevestigingInput.value === wachtwoord;
		if (passwordsMatch === false) domWachtwoordBevestigingError.innerHTML = 'Dit komt niet overeen met uw gekozen wachtwoord';

		const nameAndPasswordMatch = naam === wachtwoord;
		if (nameAndPasswordMatch === true) domWachtwoordError.innerHTML = 'Uw wachtwoord mag niet gelijk zijn aan uw naam';

		if (passwordIsStrong === true && passwordsMatch === true && nameAndPasswordMatch === false) {
			const encrypted = CryptoJS.SHA3(wachtwoord).toString();
			let json = `{ "Naam": "${naam}", "Wachtwoord": "${encrypted}", "TypeGebruiker": "Leerkracht" }`;
			// console.log(json);
			handleData(`${backendUrl}gebruikers`, displayNextPage, null, 'POST', json);
		}
	}
};

const controleLogin = function() {
	const naam = domNaamInput.value.replace(/ /g, '');
	const wachtwoord = domWachtwoordInput.value;

	domNaamError.innerHTML = '';
	domWachtwoordError.innerHTML = '';

	if (naam === '') domNaamError.innerHTML = 'Geef uw naam in';
	if (wachtwoord === '') domWachtwoordError.innerHTML = 'Geef uw wachtwoord in';

	if (naam !== '' && wachtwoord !== '') {
		const encrypted = CryptoJS.SHA3(wachtwoord).toString();
		let json = `{ "Naam": "${naam}", "Wachtwoord": "${encrypted}" }`;
		// console.log(json);
		handleData(`${backendUrl}login/leerkracht`, displayNextPage, null, 'POST', json);
	}
};

const controleLoginLeerkracht = function() {
	const leerkracht = domLeerkrachtInput.value;

	if (leerkracht === '') {
		return (domLeerkrachtError.innerHTML = 'Gelieve een leerkracht op te geven!');
	}

	handleData(`${backendUrl}gebruikers/check?naam=${leerkracht}`, goToLogingLeerling, null, 'POST');
};

// #endregion

// #region Get
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
// #endregion

// #region Listen begin

const listenToNaamInput = function() {
	domNaamInput.addEventListener('input', function() {
		// console.log('naam input');
		if (domNaamInput.value === '') domNaamLabel.classList.remove('js-keep-floating');
		else if (domNaamInput.value !== '') domNaamLabel.classList.add('js-keep-floating');
	});
	domNaamInput.addEventListener('keypress', function(e) {
		if (e.keyCode === 13) {
			if (registrerenVisible === true) controleRegistreren();
			else if (registrerenVisible === false) controleLogin();
		}
	});
};

const listenToLeerkracht = function() {
	domLeerkrachtInput.addEventListener('input', function() {
		// console.log('naam input');
		if (domLeerkrachtInput.value === '') domLeerkrachtLabel.classList.remove('js-keep-floating');
		else if (domLeerkrachtInput.value !== '') domLeerkrachtLabel.classList.add('js-keep-floating');
	});
	domLeerkrachtInput.addEventListener('keypress', function(e) {
		if (e.keyCode === 13) {
			controleLoginLeerkracht();
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
			if (registrerenVisible === true) controleRegistreren();
			else if (registrerenVisible === false) controleLogin();
		}
	});
};

const listenToWachtwoordBevestigingInput = function() {
	domWachtwoordBevestigingInput.addEventListener('input', function() {
		// console.log('wachtwoord bevestiging input');
		if (domWachtwoordBevestigingInput.value === '') domWachtwoordBevestigingLabel.classList.remove('js-keep-floating');
		else if (domWachtwoordBevestigingInput.value !== '') domWachtwoordBevestigingLabel.classList.add('js-keep-floating');
	});
	domWachtwoordBevestigingInput.addEventListener('keypress', function(e) {
		if (e.keyCode === 13) {
			if (registrerenVisible === true) controleRegistreren();
			else if (registrerenVisible === false) controleLogin();
		}
	});
};

const listenToPasswordConfirmToggleButton = function() {
	domPasswordConfirmToggleButton.addEventListener('click', function() {
		// console.log('password confirm toggle button pressed');
		if (hidePasswordConfirm === true) {
			hidePasswordConfirm = false;
			domWachtwoordBevestigingInput.type = 'password';
		} else if (hidePasswordConfirm === false) {
			hidePasswordConfirm = true;
			domWachtwoordBevestigingInput.type = 'text';
		}
	});
};

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

const listenToStart = function() {
	domStart.addEventListener('click', function() {
		displayLeerkracht(true);
	});
};

const listenToInstellingen = function() {
	domInstellingen.addEventListener('click', function() {
		displayLogin(true);
	});
};

const listenToCloseButton = function() {
	domClose.addEventListener('click', function() {
		registrerenVisible = false;
		domNaamInput.value = '';
		domWachtwoordInput.value = '';
		domWachtwoordBevestigingInput.value = '';
		domNaamError.innerHTML = '';
		domWachtwoordError.innerHTML = '';
		domWachtwoordBevestigingError.innerHTML = '';
		displayInloggen();
		displayLogin(false);
	});
};

const listenToCloseButton2 = function() {
	domClose2.addEventListener('click', function() {
		displayLeerkracht(false);
		domLeerkrachtInput.value = '';
	});
};

const listenToLogin = function() {
	domLogin.addEventListener('click', function() {
		if (registrerenVisible === true) controleRegistreren();
		else if (registrerenVisible === false) controleLogin();
	});
	domLogin.addEventListener('keypress', function(e) {
		if (e.keyCode === 13) {
			if (registrerenVisible === true) controleRegistreren();
			else if (registrerenVisible === false) controleLogin();
		}
	});
};

const listenToButtonBevestig = function() {
	domButtonBevestig.addEventListener('click', function() {
		controleLoginLeerkracht();
	});
};

const listenToFormFieldLink = function() {
	domFormFieldLink.addEventListener('click', function() {
		if (registrerenVisible === true) displayInloggen();
		else if (registrerenVisible === false) displayRegistreren();
	});
};

// --------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------
// #endregion

// #region init and domContenLoaded

const init = function() {
	//queryselectors
	domInstellingen = document.querySelector('.js-instellingen');
	domStart = document.querySelector('.js-start');
	domPopup1 = document.querySelector('.js-popup1');
	domPopup2 = document.querySelector('.js-popup2');
	domClose = document.querySelector('.js-close');
	domClose2 = document.querySelector('.js-close2');
	domLogin = document.querySelector('.js-login');
	domFormFieldLink = document.querySelector('.c-form-field--link');
	domConfirmPassword = document.querySelector('.js-confirm-password');
	domNaamError = document.querySelector('.js-naam-error');
	domLeerkrachtError = document.querySelector('.js-leerkracht-error');
	domWachtwoordError = document.querySelector('.js-wachtwoord-error');
	domNaamInput = document.querySelector('#naam');
	domLeerkrachtInput = document.querySelector('#leerkracht');
	domWachtwoordInput = document.querySelector('#wachtwoord');
	domDarkTransparentDiv = document.querySelector('.c-dark-transparent-div');
	domWachtwoordBevestigingError = document.querySelector('.js-wachtwoord-bevestiging-error');
	domRegistrerenLink = document.querySelector('.js-registreren-link');
	domWachtwoordBevestigingInput = document.querySelector('#wachtwoord-bevestiging');
	domPasswordToggleButton = document.querySelector('#passwordtoggle');
	domPasswordConfirmToggleButton = document.querySelector('#passwordconfirmtoggle');
	domNaamLabel = document.querySelector('.js-naam-label');
	domLeerkrachtLabel = document.querySelector('.js-leerkracht-label');
	domWachtwoordLabel = document.querySelector('.js-wachtwoord-label');
	domWachtwoordBevestigingLabel = document.querySelector('.js-wachtwoord-bevestiging-label');
	domButtonBevestig = document.querySelector('.c-button__bevestig');

	leerkrachtNaam = getCookie('leerkracht');
	if (leerkrachtNaam !== '') {
		domLeerkrachtLabel.classList.add('js-keep-floating');
		domLeerkrachtInput.value = leerkrachtNaam;
	}

	listenToStart();
	listenToInstellingen();
	listenToCloseButton();
	listenToCloseButton2();
	listenToLogin();
	listenToPasswordToggleButton();
	listenToPasswordConfirmToggleButton();
	listenToNaamInput();
	listenToLeerkracht();
	listenToWachtwoordInput();
	listenToWachtwoordBevestigingInput();
	listenToButtonBevestig();
	listenToFormFieldLink();
};

document.addEventListener('DOMContentLoaded', function() {
	console.info('DOM geladen');
	init();
});

// #endregion
