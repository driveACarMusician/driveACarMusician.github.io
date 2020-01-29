'use strict';

let domScore, domAvatar, domNaam;

// #region display
const displayScorebord = function(score) {
  // console.log(score);

  for (let i = 0; i < 5; i++) {
    domAvatar[i].src = score[i].avatar;
    // console.log(domAvatar);
    domNaam[i].innerHTML = score[i].naam;
    // console.log(domNaam);
    domScore[i].innerHTML = score[i].maxScore;
    // console.log(domScore);
  }
  document.getElementById('loader').style.display = 'none';
};

// #endregion

// #region Get

const getScorebord = function() {
  handleData(`https://driveacarmusiciangroep2.azurewebsites.net/api/leaderboard`, displayScorebord);
};
// #endregion

// #region DomContenLoaded and init
const init = function() {
  domAvatar = document.querySelectorAll('.c-avatar');
  domNaam = document.querySelectorAll('.naam');
  domScore = document.querySelectorAll('.score');
  getScorebord();
};

document.addEventListener('DOMContentLoaded', function() {
  console.info('DOM geladen');
  init();
});

// #endregion
