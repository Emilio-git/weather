'use strict';

const key = 'ba6f03d1879b2a0ed10ce1afbb8d3c5a';

window.addEventListener('DOMContentLoaded', () => {
   const btn = document.querySelector('.form__submit');
   const cityName = document.querySelector('.form__input');

   btn.addEventListener('click', (e) => {
      e.preventDefault();
      let lat, lon;
      fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName.value}&limit=1&appid=${key}`, {
         method: "GET",
      }) 
         .then(response => response.json())
         .then(json => {
            lat = json[0].lat;
            lon = json[0].lon;
            getResult(lat, lon);
         })
         .catch(() => {
            showError();
         });
   });

   function getResult(lat, lon) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=ru`)
         .then(response => response.json())
         .then(json => {
            let data = {
               name: json.name,
               tempMax: json.main.temp_max,
               tempMin: json.main.temp_min,
               tempCurrent: json.main.temp,
               humidity: json.main.humidity,
               shortDescr: json.weather[0].description,
            };
            return data;
               
         })
         .then(data => createCard(data.name, data.tempMax, data.tempMin, data.tempCurrent, data.humidity, data.shortDescr));
   }

   const parent = document.querySelector('.weather__container');

   function createCard(name, tempMax, tempMin, tempCurrent, humidity, shortDescr) {
      const elem = document.createElement('div');
      elem.classList.add('weather__item', 'item');

      tempCurrent = Math.round(tempCurrent);
      tempMax = tempMax.toFixed(1);
      tempMin = tempMin.toFixed(1);
      if (tempCurrent > 0) {
         tempCurrent = `+${tempCurrent}`;
      } 
      if (tempMax > 0) {
         tempMax = `+${tempMax}`;
      } 
      if (tempMin > 0) {
         tempMin = `+${tempMin}`;
      } 



      shortDescr = `${shortDescr}`.toLocaleUpperCase();

      elem.innerHTML = `
         <h2 class="item__title">Погода в городе ${name}</h2>
         <div class="item__current-temp">Текущая температура: <span>${tempCurrent}</span></div>
         <p class="item__short-decr">${shortDescr}</p>
         <div class="item__description">
            <span>Влажность: ${humidity}%</span>
            <span>Макс. температура: ${tempMax}</span>
            <span>Мин. температура: ${tempMin}</span>
         </div>
         <div class="item__delete">
            <span></span>
            <span></span>
         </div>
      `;

      parent.append(elem);

      hoverItem(elem);
   }

   function showError() {
      const failure = document.createElement('span');
      failure.classList.add('failure');
      failure.innerText = `Ошибка, введите корректное название города`;

      
      showErrorAnimation(failure);
      
      if (!(cityName.parentNode.lastElementChild.classList.contains('failure'))) {
         cityName.parentNode.append(failure);
      } else {
         showErrorAnimation(cityName.parentNode.lastElementChild);
      }

      cityName.addEventListener('input', () => {
         failure.remove();
      });

   }
   
   function showErrorAnimation(failure) {
      let counter = 0, x = -1, y = 1;
      const errorAnimation = setInterval(() => {
         y *= x;
         failure.style.left = `${y * 2.7}px`;
         counter += 1;
         if(counter === 7) {
            clearInterval(errorAnimation);
         }
      }, 40);
   }

   function hoverItem(elem) {
      elem.addEventListener('mouseover', (e) => {
         activateItem(elem);
         elem.lastElementChild.addEventListener('click', () => {
            elem.remove();
         });
      });

      elem.addEventListener('mouseout', (e) => {
         deactivateItem(elem);
      });
   }

   function activateItem(elem) {
      elem.classList.add('activate');
      elem.lastElementChild.classList.add('active-cross');
   }

   function deactivateItem(elem, cross) {
      elem.classList.remove('activate');
      elem.lastElementChild.classList.remove('active-cross');
   }
});