'use strict';

const key = 'ba6f03d1879b2a0ed10ce1afbb8d3c5a';

window.addEventListener('DOMContentLoaded', () => {
   const city = document.querySelector('.city');

   city.addEventListener('change', () => {
      console.log(city.value);

      let lat, lon;
      fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city.value}&limit=1&appid=${key}`, {
         method: "GET",
      }) 
         .then(response => response.json())
         .then(json => {
            lat = json[0].lat;
            lon = json[0].lon;
         })
         .then(data => {
            getResult(lat, lon);
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

   function createCard(name, tempMax, tempMin, tempCurrent, humidity, shortDescr) {
      console.log(`Город:${name}, Максимальная:${tempMax}, Минимальная:${tempMin}, Текущая:${tempCurrent}, Влажность:${humidity}, Краткое описание: ${shortDescr}`);
      const parent = document.querySelector('.weather__container');
      const elem = document.createElement('div');
      elem.classList.add('weather__item', 'item');

      elem.innerHTML = `
         <div class="weather__item item">
            <h2 class="item__title">Погода в городе ${name}</h2>
            <div class="item__current-temp">Текущая температура: +${tempCurrent}</div>
            <p class="item__short-decr">${shortDescr}</p>
            <div class="item__description">
               <span>Влажность: ${humidity}%</span>
               <span>Максимальная температура: ${tempMax}</span>
               <span>Минимальная температура: ${tempMin}</span>
            </div>
            <div class="item__delete">Удалить</div>
         </div>
      `;

      parent.append(elem);
   }
});