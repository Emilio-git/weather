'use strict';

const key = 'ba6f03d1879b2a0ed10ce1afbb8d3c5a';

window.addEventListener('DOMContentLoaded', () => {
   const form = document.querySelector('.form__city');
   const btn = document.querySelector('.form__submit');
   const cityName = document.querySelector('.form__input');

   const loading = document.createElement('img');
   loading.src = `./icons/loading.gif`;
   loading.classList.add('loading');

   const failureMessage = {
      badRequestName: 'Ошибка, введите корректное название города',
      serverTroubles: 'Ошибка, сервер не отвечает',
      exists: 'Данный прогноз уже найден'
   }; 

   initializeItems(localStorage);

   btn.addEventListener('click', (e) => {
      e.preventDefault();
      getFullResult(cityName.value);
      
   });

   function getFullResult(name) {
      let lat, lon;
      fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${name}&limit=1&appid=${key}`, {
         method: "GET",
      }) 
         .then(response => {
            return response.json();
         })
         .then(json => {
            lat = json[0].lat;
            lon = json[0].lon;
            let data = {
               name: json[0].local_names.ru,
            };

            const cityNames = document.querySelectorAll('.item__title');

            let counter = 0;
            cityNames.forEach(item => {
               if (item.lastChild.innerHTML === data.name) {
                  counter++;
               }
            });

            if (counter) {
               showError(failureMessage.exists);
            } else {
               cityName.parentNode.append(loading);
               getResult(lat, lon, data);
            }
         })
         .catch(() => {
            showError(failureMessage.badRequestName);
            loading.remove();
         });
   }

   function getResult(lat, lon, data) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=ru`)
         .then(response => response.json())
         .then(json => {
            loading.remove();
            writeToLocal(data.name);
            cityName.value = '';

            data.tempMax = json.main.temp_max;
            data.tempMin = json.main.temp_min;
            data.tempCurrent = json.main.temp;
            data.humidity = json.main.humidity;
            data.shortDescr = json.weather[0].description;
            data.iconName = json.weather[0].icon;
            data.iconDescr = json.weather[0].main;
            
            return data;   
         })
         .then(data => createCard(data.name, data.tempMax, data.tempMin, data.tempCurrent, data.humidity, data.shortDescr, data.iconName, data.iconDescr))
         .catch(() => {
            showError(failureMessage.serverTroubles);
         });
   }

   let counterName = 0;
   function writeToLocal(name) {
      localStorage.setItem(name, counterName);
      counterName++;
   }

   function deleteFromLocal(name) {
      delete localStorage[name];
   }

   function initializeItems(storage) {
      console.log(storage);
      for (let i = 0; i < storage.length; i++) {
         getFullResult(storage.key(i));
      }
   }

   
   const parent = document.querySelector('.weather__container');

   function createCard(name, tempMax, tempMin, tempCurrent, humidity, shortDescr, iconName, iconDescr) {
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

      shortDescr = `${shortDescr}`.slice(0, 1).toUpperCase() + `${shortDescr}`.slice(1);

      elem.innerHTML = `
         <h2 class="item__title">Погода в городе <br><span id="city">${name}</span></h2>
         <div class="item__current-temp current-temp">Текущая температура: 
            <div class="current-temp__wrapper">
               <img src="http://openweathermap.org/img/wn/${iconName}@2x.png" alt="${iconDescr}">
               <span>${tempCurrent}</span>
            </div>
         </div>
         <div class="item__description">
            <span>${shortDescr}</span>
            <span>Влажность: ${humidity}%</span>
            <span>Макс. температура: ${tempMax}</span>
            <span>Мин. температура: ${tempMin}</span>
         </div>
         <div class="item__delete">
            <span></span>
            <span></span>
         </div>
      `;

      if (iconName.slice(-1) == 'n') {
         elem.style.backgroundImage = `url(./img/bg/night.jpg)`;
      }

      parent.append(elem);
      hoverItem(elem);
   }

   function showError(failureMessage) {
      const failure = document.createElement('span');
      failure.classList.add('failure');
      failure.innerText = failureMessage;

      showErrorAnimation(failure);
      
      if (!(form.lastElementChild.classList.contains('failure'))) {
         form.append(failure);
      } else {
         showErrorAnimation(form.lastElementChild);
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
            failure.style.left = `0px`;
         }
      }, 40);
   }

   function hoverItem(elem) {
      elem.addEventListener('mouseover', (e) => {
         activateItem(elem);

      });

      elem.addEventListener('mouseout', (e) => {
         deactivateItem(elem);
      });

      elem.lastElementChild.addEventListener('click', () => {
         deleteFromLocal(elem.querySelector('#city').innerText);
         elem.remove();
      });
   }

   function activateItem(elem) {
      elem.classList.add('activate');
      elem.lastElementChild.classList.add('active-cross');
      elem.style.boxShadow = `0px 5px 20px 6px rgba(34, 60, 80, 0.3)`;
   }

   function deactivateItem(elem) {
      elem.classList.remove('activate');
      elem.lastElementChild.classList.remove('active-cross');
      elem.style.boxShadow = `0px 0px 30px 4px rgba(34, 60, 80, 0.2)`;
   }

   const infoDeleteIcon = document.querySelector('.form__info-delete');

   infoDeleteIcon.parentNode.addEventListener('mouseover', () => {
      infoDeleteIcon.style.opacity = 1;
   });
   infoDeleteIcon.parentNode.addEventListener('mouseout', () => {
      infoDeleteIcon.style.opacity = 0;
   });

   infoDeleteIcon.addEventListener('click', () => {
      infoDeleteIcon.parentNode.remove();
   });
});