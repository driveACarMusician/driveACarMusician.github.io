'use strict';

class Position {
    constructor(awidth){
        this.width = awidth;
        this.maxWidth = 0;
    }
    get width(){
        return this._width;
    }
    set width(value){
        this._width = value;
    }
    get maxWidth(){
        return this._maxWidth;
    }
    set maxWidth(value){
        this._maxWidth = value;
    }
    moveRight(){
        if(this.width != 0){
            this.width -= 96;
            console.log(this.width);
            document.getElementById('avatars').style.marginLeft = `-${this.width}px`;
            document.getElementById('avatars').style.marginRight = `${this.width}px`;
        }
    }
    moveLeft(){
        if(this.width < this.maxWidth){
            this.width += 96;
            document.getElementById('avatars').style.marginLeft = `-${this.width}px`;
            document.getElementById('avatars').style.marginRight = `${this.width}px`;
            console.log(this.width)
        }
    }
}

let position = new Position(0);


const getCars = async function(){
    let response = await fetch('https://driveacarmusiciangroep2.azurewebsites.net/api/autos');
    let data = await response.json()
    console.log(data);
    displayGallery(data);
}

// const getAvatars = async function(){
//     let response = await fetch('https://driveacarmusiciangroep2.azurewebsites.net/api/avatars');
//     let data = await response.json()
//     console.log(data);
//     displayGallery(data);
// }

const galleryMove = function(gallery){
    document.getElementById('right').addEventListener('click', () => position.moveLeft());
    document.getElementById('left').addEventListener('click', () => position.moveRight());
    console.log(position.width);
}

const displayGallery = function(data){
    let i = 0;
    let html = '';
    for (i; i < data.length; i++){
        html += `<img src="${data[i]}" alt="avatar" class="c-carousel__item" />`;
    }
    i=0;
    for (i; i < data.length; i++){
        html += `<img src="${data[i]}" alt="avatar" class="c-carousel__item" />`;
    }
    document.getElementById('avatars').innerHTML = html;
    let maxWidth = data.length * 96;
    console.log(maxWidth);
    position.maxWidth = maxWidth;
}

const init = function() {
//    getAvatars();
   getCars();
   galleryMove();
}

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');
    init();
});