'use strict';
let domNaam, domPlay, domNaamError, domAvatar, domCar, domNaamLabel, domHerlaadFotosLink, domHerlaadFotosError, domAvatarImage, domCarImage;
let domCloseAll;
let gebruikerNaam, gebruikerAvatar, gebruikerAuto;
let domLeerkracht, leerkrachtCookie;

const apiUrl = 'https://driveacarmusiciangroep2.azurewebsites.net/api/';

// #region avatars, cars classes and functions

class PositionAvatar {
	constructor(awidth) {
		this.width = awidth;
		this.maxWidth = 0;
	}
	get width() {
		return this._width;
	}
	set width(value) {
		this._width = value;
	}
	get maxWidth() {
		return this._maxWidth;
	}
	set maxWidth(value) {
		this._maxWidth = value;
	}
	moveRight() {
		if (this.width != 0) {
			this.width -= 96;
			// console.log(this.width);
			document.getElementById('avatars').style.marginLeft = `-${this.width}px`;
			document.getElementById('avatars').style.marginRight = `${this.width}px`;
		}
	}
	moveLeft() {
		if (this.width < this.maxWidth - 288) {
			this.width += 96;
			document.getElementById('avatars').style.marginLeft = `-${this.width}px`;
			document.getElementById('avatars').style.marginRight = `${this.width}px`;
			// console.log(this.width);
		}
	}
}

class PositionCar {
	constructor(awidth) {
		this.width = awidth;
		this.maxWidth = 0;
	}
	get width() {
		return this._width;
	}
	set width(value) {
		this._width = value;
	}
	get maxWidth() {
		return this._maxWidth;
	}
	set maxWidth(value) {
		this._maxWidth = value;
	}
	moveRight() {
		if (this.width != 0) {
			this.width -= 96;
			// console.log(this.width);
			document.getElementById('cars').style.marginLeft = `-${this.width}px`;
			document.getElementById('cars').style.marginRight = `${this.width}px`;
		}
	}
	moveLeft() {
		if (this.width < this.maxWidth - 288) {
			this.width += 96;
			document.getElementById('cars').style.marginLeft = `-${this.width}px`;
			document.getElementById('cars').style.marginRight = `${this.width}px`;
			// console.log(this.width);
		}
	}
}

let positionAvatar = new PositionAvatar(0);
let positionCar = new PositionCar(0);

const galleryAvatarMove = function(gallery) {
	document.getElementById('leftAvatar').addEventListener('click', () => positionAvatar.moveLeft());
	document.getElementById('rightAvatar').addEventListener('click', () => positionAvatar.moveRight());
};

const galleryCarMove = function(gallery) {
	document.getElementById('leftCar').addEventListener('click', () => positionCar.moveLeft());
	document.getElementById('rightCar').addEventListener('click', () => positionCar.moveRight());
};

// #endregion

// #region display

const displayCars = function(data) {
	//doe iets met de data
	domCar.src = data[0];
	let i = 0;
	let html = '';
	for (i; i < data.length; i++) {
		html += `<img src="${data[i]}" alt="car" tabindex="0" class="c-carousel__item__car" />`;
	}
	document.getElementById('cars').insertAdjacentHTML('beforeend', html);
	listenToDisplayCars();
	let maxWidth = data.length * 96;
	// console.log(maxWidth);
	positionCar.maxWidth = maxWidth;
};

const displayAvatars = function(data) {
	// console.log('avatars geladen');
	//doe iets met de data
	domAvatar.src = data[0];
	let i = 0;
	let html = '';
	for (i; i < data.length; i++) {
		html += `<img src="${data[i]}" alt="avatar" tabindex="0" class="c-carousel__item" />`;
	}
	document.getElementById('avatars').insertAdjacentHTML('beforeend', html);
	listenToDisplayAvatars();
	let maxWidth = data.length * 96;
	// console.log(maxWidth);
	positionAvatar.maxWidth = maxWidth;
};

// #endregion

// #region other
const controleLogin = function() {
	const naam = domNaam.value;
	domNaamError.innerHTML = '';
	if (naam === '') domNaamError.innerHTML = 'Geef uw naam in!';
	else if (naam !== '') postGebruiker();
};

const GoToGame = function(json) {
	if (json === 'Gebruikersnaam is al in gebruik') {
		PutGebruiker();
	} else if (json === 'De gegevens van de gebruiker zijn aangepast') {
		location.assign('./game/game.html');
	} else {
		location.assign('./game/game.html');
	}
};

// #endregion

// #region Get, Post and PUT

const PutGebruiker = function() {
	let avatar = domAvatarImage.src;
	let car = domCarImage.src;
	let naam = domNaam.value;
	let json = `{ "Naam": "${naam}", "Avatar": "${avatar}", "Auto": "${car}"}`;
	handleData(`${apiUrl}gebruikers`, GoToGame, null, 'PUT', json);
};

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

const postGebruiker = function() {
	let avatar = domAvatarImage.src;
	let car = domCarImage.src;
	let naam = domNaam.value;
	document.cookie = `naam=${naam}`;
	document.cookie = `avatar=${avatar}`;
	document.cookie = `car=${car}`;
	let json = `{ "Naam": "${naam}", "Avatar": "${avatar}", "Auto": "${car}", "TypeGebruiker": "Leerling" }`;
	// console.log(json);
	handleData(`${apiUrl}gebruikers`, GoToGame, null, 'POST', json);
};

const getGebruikerAvatarAuto = function(n = "") {
	// console.log(n)
	// console.log('getting user info');
	let naam = gebruikerNaam;
	if (n !== ""){ naam = n;
	handleData(`${apiUrl}gebruikers?naam=${naam}`, function(data) {
		if (data === 'Deze gebruiker bestaat niet') domHerlaadFotosError.innerHTML = data;
		else if (data !== 'Deze gebruiker bestaat niet') {
			domHerlaadFotosError.innerHTML = '';
			document.cookie = `naam=${naam}`;
			gebruikerNaam = naam;
			domAvatarImage.src = data.avatar;
			domCarImage.src = data.auto;
		}
	});}
};

const getCars = function() {
	handleData(`${apiUrl}autos`, displayCars);
};

const getAvatars = function() {
	handleData(`${apiUrl}avatars`, displayAvatars);
};

//#endregion

// #region listenTo

const listenToCloseAll = function() {
	for (let i = 0; i < domCloseAll.length; i++) {
		domCloseAll[i].addEventListener('click', function() {
			document.getElementById('overlayCar').style.display = 'none';
			document.getElementById('overlayAvatar').style.display = 'none';
		});
	}
};

const listenToSelectCar = function(car = null) {
	if (car !== null) {
		document.getElementById('selectCar').addEventListener('click', function() {
			const carSrc = car;
			document.getElementById('overlayCar').style.display = 'none';
			domCarImage.src = carSrc;
		});
	} else {
		document.getElementById('selectCar').addEventListener('click', function() {
			document.getElementById('overlayCar').style.display = 'none';
		});
	}
};

const listenToSelectAvatar = function(avatar = null) {
	if (avatar !== null) {
		document.getElementById('selectAvatar').addEventListener('click', function() {
			const avatarSrc = avatar;
			document.getElementById('overlayAvatar').style.display = 'none';
			domAvatarImage.src = avatarSrc;
		});
	} else {
		document.getElementById('selectAvatar').addEventListener('click', function() {
			document.getElementById('overlayAvatar').style.display = 'none';
		});
	}
};

const listenToDisplayCars = function() {
	let cars = document.querySelectorAll('.c-carousel__item__car');
	for (const car of cars) {
		car.addEventListener('click', function() {
			let car = this.src;
			listenToSelectCar(car);
		});
	}
};

const listenToDisplayAvatars = function() {
	let avatars = document.querySelectorAll('.c-carousel__item');
	for (const avatar of avatars) {
		avatar.addEventListener('click', function() {
			let avatar = this.src;
			listenToSelectAvatar(avatar);
		});
	}
};

const listenToAvatar = function() {
	domAvatar.addEventListener('click', function() {
		document.getElementById('overlayAvatar').style.display = 'block';
	});
};

const listenToCar = function() {
	domCar.addEventListener('click', function() {
		document.getElementById('overlayCar').style.display = 'block';
	});
};

const listenToNaamInput = function() {
	domNaam.addEventListener('input', function() {
		if (domNaam.value === '') domNaamLabel.classList.remove('js-keep-floating');
		else if (domNaam.value !== '') domNaamLabel.classList.add('js-keep-floating');
	});
	domNaam.addEventListener('keypress', function(e) {
		if (e.keyCode === 13) controleLogin();
	});
};

const listenToPlay = function() {
	domPlay.addEventListener('click', controleLogin);
};

const listenToHerlaadFotosLink = function() {
	domHerlaadFotosLink.addEventListener('click', function() {
		getGebruikerAvatarAuto(domNaam.value);
	});
};

//#endregion

// #region init / DomContenLoaded

const init = function() {
	domNaam = document.querySelector('#naam');
	domNaamError = document.querySelector('.js-naam-error');
	domAvatar = document.querySelector('.js-avatar');
	domCar = document.querySelector('.js-car');
	domPlay = document.querySelector('.js-play');
	domNaamLabel = document.querySelector('.js-naam-label');
	domCloseAll = document.querySelectorAll('.js-close');
	domLeerkracht = document.querySelector('#leerkracht');
	domHerlaadFotosLink = document.querySelector('.js-herlaad-fotos-link');
	domHerlaadFotosError = document.querySelector('.js-herlaad-fotos-error');
	domAvatarImage = document.querySelector('#avatar');
	domCarImage = document.querySelector('#car');

	gebruikerNaam = getCookie('naam');
	gebruikerAvatar = getCookie('avatar');
	gebruikerAuto = getCookie('car');
	leerkrachtCookie = getCookie('leerkracht');
	domLeerkracht.innerHTML = leerkrachtCookie;
	if (gebruikerNaam !== '') {
		domNaamLabel.classList.add('js-keep-floating');
		domNaam.value = gebruikerNaam;
		domNaam.focus();
		getGebruikerAvatarAuto(domNaam.value);
	} else {
		if (gebruikerAvatar !== '') domAvatar.src = gebruikerAvatar;
		else getAvatars();
		if (gebruikerAuto !== '') domCar.src = gebruikerAuto;
		else getCars();
	}
	getCars();
	getAvatars();
	listenToPlay();
	galleryAvatarMove();
	galleryCarMove();
	listenToAvatar();
	listenToCar();
	listenToSelectAvatar();
	listenToSelectCar();
	listenToCloseAll();
	listenToNaamInput();
	listenToHerlaadFotosLink();
};

document.addEventListener('DOMContentLoaded', function() {
	console.info('DOM geladen');
	init();
});

//#endregion
