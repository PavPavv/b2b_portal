'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var url = 'http://80.234.34.212:2000/-aleksa-/TopSports/test/',
    website = document.body.dataset.website,
    pageId = document.body.id,
    headerCart = document.getElementById('header-cart'),
    loader = document.getElementById('loader'),
    errorContainer = document.getElementById('error-container'),
    alertsContainer = document.getElementById('alerts-container'),
    upBtn = document.getElementById('up-btn');

// Динамически изменяемые переменные:

if (headerCart) {
  var cartId,
      cart = {},
      cartChanges = {},
      isSearch;
}

//=====================================================================================================
// При запуске страницы:
//=====================================================================================================

setPaddingToBody();

//=====================================================================================================
// Полифиллы:
//=====================================================================================================

(function() {
  // проверяем поддержку
  if (!Element.prototype.closest) {
    // реализуем
    Element.prototype.closest = function(css) {
      var node = this;
      while (node) {
        if (node.matches(css)) {
          return node;
        } else {
          node = node.parentElement;
        }
      }
      return null;
    };
  }
})();

//=====================================================================================================
// Создание данных для фильтров каталога:
//=====================================================================================================

// Создание фильтра каталога из данных options или discounts:

function createFilterData(curArray, optNumb) {
  var filter = {},
      name;
  curArray.forEach(item => {
    if (item.options && item.options != 0) {
      name = item.options[optNumb];
    }
    if (item.dtitle) {
      name = item.dtitle;
    }
    if (name != undefined && filter[name] == undefined) {
      filter[name] = 1;
    }
  });
  if (curArray === discounts) {
    filter.is_new = 'Новинка';
    filter.sale = 'Распродажа';
  }
  return filter;
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка запросов на сервер:

// type : 'multipart/form-data', 'application/json; charset=utf-8'
function sendRequest(url, data, type = 'application/json; charset=utf-8') {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.addEventListener('error', () => reject(new Error("Network Error")));
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
      resolve(request.responseText);
    });
    if (data) {
      request.open('POST', url);
      request.setRequestHeader('Content-type', type);
    } else {
      request.open('GET', url);
    }
    request.send();
  });
}

//=====================================================================================================
// Сортировка объектов:
//=====================================================================================================

// Сортировка по ключу:

function sortObjByKey(obj, type = 'string') {
  var arrayObj = Object.keys(obj),
      sortedObj = {};
  switch (type) {
    case 'string':
      arrayObj = arrayObj.sort();
    case 'number':
      arrayObj = arrayObj.sort((a,b) =>  a - b);
      break;
    case 'number from string':
      arrayObj = arrayObj.sort((a,b) => parseInt(a, 10) - parseInt(b, 10));
      break;
  }
  arrayObj.forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Сортировка по значению:

function sortObjByValue(obj, type = 'string') {
  var arrayObj = Object.keys(obj),
      sortedObj = {};
  switch (type) {
    case 'string':
      arrayObj = arrayObj.sort((a,b) => {
        if (obj[a] < obj[b]) {
          return -1;
        }
        if (obj[a] > obj[b]) {
          return 1;
        }
        return 0;
      });
    case 'number':
      arrayObj = arrayObj.sort((a,b) => obj[a] - obj[b]);
      break;
    case 'number from string':
      arrayObj = arrayObj.sort((a,b) => parseInt(obj[a], 10) - parseInt(obj[b], 10));
      break;
  }
  arrayObj.forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

//=====================================================================================================
// Сохранение и извлечение данных на компьютере пользователя:
//=====================================================================================================

// Проверка доступности storage:

function storageAvailable(type) {
  var storage, test;
	try {
		storage = window[type];
    test = '__storage_test__';
		storage.setItem(test, test);
		storage.removeItem(test);
		return true;
	}
	catch(error) {
		return false;
	}
}

// Сохранение данныx в storage или cookie:

function saveInLocal(data, type) {
  var stringData = JSON.stringify(data);
  if (storageAvailable(type)) {
    window[type][website] = stringData;
  }
  else {
    if (getCookie(website)) {
      deleteCookie(website);
    }
    setCookie(website, stringData, {expires: getDateExpires(30)});
  }
}

// Получение данных из storage или cookie:

function getFromLocal(key, type) {
  var info = {};
  if (storageAvailable(type)) {
    if (window[type][website]) {
      info = JSON.parse(window[type][website]);
    }
  }
  else {
    if (getCookie(website)) {
      info = JSON.parse(getCookie(website));
    }
  }
  if (!info[key]) {
    info[key] = {};
  }
  return info;
}

// Сохранение данных в cookie:

function setCookie(key, value, options) {
  options = options || {};
  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var date = new Date();
    date.setTime(date.getTime() + expires * 1000);
    expires = options.expires = date;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);
  var updatedCookie = key + '=' + value;

  for (let key in options) {
    updatedCookie += "; " + key;
    var propValue = options[key];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

// Функция для установки срока хранения cookie:

function getDateExpires(days) {
  var date = new Date;
  date.setDate(date.getDate() + days);
  return date;
}

// Получение данных из cookie:

function getCookie(key) {
  var matches = document.cookie.match(new RegExp(
    '(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Удаление данных из cookie:

function deleteCookie(key) {
  setCookie(key, '', {expires: -1});
}

// Получение данных о странице по ключу:

function getInfo(key, type = 'localStorage') {
  var info = getFromLocal(key, type);
  return info[key];
}

// Сохранение данных о странице по ключу:

function saveInfo(key, data, type = 'localStorage') {
  var info = getFromLocal(key, type);
  info[key] = data;
  saveInLocal(info, type);
}

// Удаление всех данных о странице по ключу:

function removeInfo(key, type = 'localStorage') {
  var info = getFromLocal(key, type);
  info[key] = {};
  saveInLocal(info, type);
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Установка отступов документа:

window.addEventListener('resize', setPaddingToBody);

function setPaddingToBody() {
  var headerHeight = document.querySelector('.header').clientHeight;
  var footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Вставка заглушки при ошибке загрузки изображения:

function replaceImg(img) {
  img.src = '../img/no_img.jpg';
}

// Показ элемента:

function showElement(el, style = 'block') {
  el.style.display = style;
}

// Скрытие элемента:

function hideElement(el) {
  el.style.display = 'none';
}

// Получение текущей прокрутки документа:

var scrollTop;

function getDocumentScroll() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

// Установка прокрутки документа:

function setDocumentScroll(top = scrollTop) {
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

// Открытие всплывающего окна:

function openPopUp(el, style = 'block') {
  getDocumentScroll();
  document.body.classList.add('no-scroll');
  showElement(el, style);
}

// Закрытие всплывающего окна:

function closePopUp(el, style = 'none') {
  hideElement(el, style);
  document.body.classList.remove('no-scroll');
  setDocumentScroll();
}

// Показ сообщения об ошибке:

function showError(text) {
  if (!text) {
    return;
  }
  document.getElementById('error').textContent = text;
  openPopUp(errorContainer, 'flex');
}

// Скрытие сообщения об ошибке:

function closeError() {
  closePopUp(errorContainer);
}

// Отображение количества знаков, оставшихся в поле комментариев:

function countSigns(textarea) {
  document.getElementById('textarea-counter').textContent = 300 - textarea.value.length;
}

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Возвращение значения в инпут при потере им фокуса:

function onBlurInput(input) {
  input.value = input.dataset.value;
}

// Запрет на ввод в инпут любого значения кроме цифр:

function checkValue(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  var chr = getChar(event);
  if (chr == null) {
    return;
  }
  if (chr < '0' || chr > '9') {
    return false;
  }
}

// Добавление всплывающих подсказок:

function addTooltips(key) {
  var elements = document.querySelectorAll(`[data-key=${key}]`);
  if (elements) {
    elements.forEach(el => {
      el.setAttribute('tooltip', el.textContent.trim());
    });
  }
}

//=====================================================================================================
// Вспомогательные функции:
//=====================================================================================================

// Кросс-браузерная функция для получения символа из события keypress:

function getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) {
      return null; // спец. символ
    }
    return String.fromCharCode(event.keyCode);
  }
  if (event.which != 0 && event.charCode != 0) { // все кроме IE
    if (event.which < 32) {
      return null; // спец. символ
    }
    return String.fromCharCode(event.which); // остальные
  }
  return null; // спец. символ
}

// Проверка пустой ли объект:

function isEmptyObj(obj) {
  if (Object.keys(obj).length > 0) {
    return false;
  }
  return true;
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}

// Функция преобразования строки с годами к укороченному формату:

function convertYears(stringYears) {
  var years = stringYears.split(',');
  var resultYears = [];
  var curYear, nextYear, prevYear;

  if (years.length <= 2) {
    return stringYears.replace(/\,/gi, ', ');
  }

  for (let i = 0; i < years.length; i++) {
    curYear = parseInt(years[i].trim(), 10);
    nextYear = parseInt(years[i + 1], 10);
    prevYear = parseInt(years[i - 1], 10);

    if (curYear + 1 != nextYear) {
      if (i === years.length -  1) {
        resultYears.push(curYear);
      } else {
        resultYears.push(curYear + ', ');
      }
    } else if (curYear - 1 !== prevYear) {
      resultYears.push(curYear);
    } else if (curYear + 1 === nextYear && resultYears[resultYears.length - 1] !== ' &ndash; ') {
      resultYears.push(' &ndash; ');
    }
  }
  return resultYears = resultYears.join('');
}

// Проверка актуальности даты в периоде:

function checkDate(start, end) {
  var curDate = new Date(),
      dateStart = start.split('.'),
      dateEnd = end.split('.');
  dateStart = new Date(dateStart[2], dateStart[1] - 1, dateStart[0], 0, 0, 0, 0);
  dateEnd = new Date(dateEnd[2], dateEnd[1] - 1, dateEnd[0], 23, 59, 59, 999);
  if (curDate > dateStart && curDate < dateEnd) {
    return true;
  } else {
    return false;
  }
}

//=====================================================================================================
// Работа кнопки "Наверх страницы":
//=====================================================================================================

// Отображение/скрытие кнопки "Наверх страницы":

if (upBtn) {
  window.addEventListener('scroll', toggleBtnGoTop);
}

function toggleBtnGoTop() {
  var scrolled = window.pageYOffset,
      coords = window.innerHeight / 2;

  if (scrolled > coords) {
    upBtn.classList.add('show');
  }
  if (scrolled < coords) {
    upBtn.classList.remove('show');
  }
}

// Вернуться наверх страницы:

function goToTop() {
  var scrolled = window.pageYOffset;
  if (scrolled > 0 && scrolled <= 5000) {
    window.scrollBy(0, -80);
    setTimeout(goToTop, 0);
  } else if (scrolled > 5000) {
    window.scrollTo(0, 5000);
    goToTop();
  }
}

//=====================================================================================================
// Работа с окном уведомлений:
//=====================================================================================================

// Открытие окна уведомлений:

function showMessages() {
  openPopUp(alertsContainer, 'flex');
}

// Закрытие окна уведомлений:

function closeMessages(event) {
  if (!event.target.closest('.close-btn') && event.target.closest('.alerts.pop-up')) {
    return;
  }
  closePopUp(alertsContainer);
}

//=====================================================================================================
// Работа выпадающих списков:
//=====================================================================================================

document.querySelectorAll('.activate.select').forEach(el => new DropDown(el));
document.querySelectorAll('.activate.checkbox').forEach(el => new DropDown(el));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.activate')) {
    document.querySelectorAll('.activate.open').forEach(el => el.classList.remove('open'));
  }
});

// type = 'sort' 'select' 'checkbox';

function DropDown(obj, type, curArray) {
  // Элементы для работы:
  this.filter = obj;
  this.type = type;
  this.curArray = curArray;
  this.head = obj.querySelector('.head');
  this.title = obj.querySelector('.title');
  this.items = obj.querySelectorAll('.item');
  this.closeBtn = obj.querySelector('.close-btn');

  // Константы:
  this.titleText = this.title.textContent;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.head) {
      this.head.addEventListener('click', event => this.toggleFilter(event));
    }
    this.items.forEach(el => el.addEventListener('click', event => this.checkItem(event)));
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', event => this.clearFilter(event));
    }
  }
  this.setEventListeners();

  // Открытие/закрытие выпадающего списка:
  this.toggleFilter = function() {
    if (this.filter.classList.contains('open')) {
      this.filter.classList.remove('open');
    } else {
      document.querySelectorAll('.activate.open').forEach(el => el.classList.remove('open'));
      this.filter.classList.add('open');
    }
  }

  // Выбор значения:
  this.checkItem = function (event) {
    var curItem = event.currentTarget;
    if (this.filter.classList.contains('select')) {
      curItem.classList.add('checked');
    }
    if (this.filter.classList.contains('checkbox')) {
      curItem.classList.toggle('checked');
    }

    var checked = this.filter.querySelectorAll('.item.checked');
    if (checked.length === 0) {
      this.clearFilter(event);
    } else {
      if (this.filter.classList.contains('select')) {
        this.title.textContent = curItem.textContent;
        this.filter.dataset.value = curItem.dataset.value;
        this.filter.classList.remove('open');
      }
      if (this.filter.classList.contains('checkbox')) {
        this.title.textContent = 'Выбрано: ' + checked.length;
        var value = [];
        checked.forEach(el => value.push(el.dataset.value));
        this.filter.dataset.value = value;
      }
    }
    var event = new Event("onchange");
    this.filter.dispatchEvent(event);
  }

  // Очистка фильтра:
  this.clearFilter = function () {
    this.title.textContent = this.titleText;
    this.filter.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
  }
}

//=====================================================================================================
// Работа с таблицами:
//=====================================================================================================

// openTable();

// Открытие таблицы:

function openTable(id) {
  document.querySelectorAll('.table-wrap').forEach(el => {
    hideElement(el);
    el.style.visibility = 'hidden';
  });
  var table;
  if (id) {
    table = new Table(document.getElementById(id), tableData);
  } else {
    table = new Table(document.querySelector('.table-wrap'), tableData);
  }
  table.init();
}

// Объект таблицы:

function Table(obj, data) {
  // Элементы для работы:
  this.table = obj;
  this.head = obj.querySelector('.table-head');
  this.results = this.head.querySelector('.results');
  this.body = obj.querySelector('.table-body');
  this.resizeBtns = this.head.querySelectorAll('.resize-btn');
  this.activates = obj.querySelectorAll

  // Константы:
  this.rowTemplate = this.body.innerHTML;
  this.data = data;

  // Динамические переменные:
  this.curColumn = null;
  this.startOffset = 0;
  this.countItems = 0;
  this.countItemsTo = 0;
  this.itemsToLoad,
  this.incr = 60;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.table.addEventListener('scroll', () => this.scrollTable());

    if (this.resizeBtns.length > 0) {
      this.resizeBtns.forEach(el => el.addEventListener('mousedown', (event) => this.startResize(event)));
      this.table.addEventListener('mouseleave', () => this.stopResize());
      document.addEventListener('mousemove', (event) => this.resize(event));
      document.addEventListener('mouseup', () => this.stopResize());
    }
  }
  this.setEventListeners();

  // Инициализация таблицы:

  this.init = function() {
    showElement(loader, 'flex');
    showElement(this.table);
    this.loadNext(this.data);
    this.alignColumns();
    this.table.style.visibility = 'visible';
    hideElement(loader);
  }

  // Загрузка данных в таблицу:

  this.loadNext = function(data) {
    if (data) {
      this.countItems = 0;
      this.itemsToLoad = data;
    } else {
      this.countItems = this.countItemsTo;
    }
    // console.log(this.countItemsTo);
    // console.log(this.itemsToLoad.length);
    if (this.countItemsTo == this.itemsToLoad.length) {
      return;
    }
    this.countItemsTo = this.countItems + this.incr;
    if (this.countItemsTo > this.itemsToLoad.length) {
      this.countItemsTo = this.itemsToLoad.length;
    }
    var list = '', newEl;
    for (let i = this.countItems; i < this.countItemsTo; i++) {
      newEl = this.rowTemplate;
      newEl = createElByTemplate(newEl, this.itemsToLoad[i]);
      list += newEl;
    }
    if (this.countItems === 0) {
      this.body.innerHTML = list;
    } else {
      this.body.insertAdjacentHTML('beforeend', list);
      console.log(this.body.children);
      // console.log(this.countItemsTo);
      // console.log(this.countItems);
      for (let i = 0; i <= this.countItemsTo - this.countItems; i++) {
        console.log(this.body.children[i]);
        this.body.removeChild(this.body.children[i]);
      }
      // console.log(this.body.children);
    }
  }

  // Подгрузка таблицы при скролле:

  // var tempScrollTop, currentScrollTop = 0;
  this.scrollTable = function() {
    // currentScrollTop = this.table.scrollTop;

    // if (tempScrollTop < currentScrollTop) {
    //   //scrolling down
    // } else if (tempScrollTop > currentScrollTop) {
    //   //scrolling up
    // }
    // tempScrollTop = currentScrollTop;
    if (this.table.scrollTop + this.table.clientHeight >= this.table.scrollHeight) {
      // console.log(this.table.scrollTop);
      // console.log(this.table.clientHeight);
      // console.log(this.table.scrollHeight);
      this.loadNext();
    }
    // if (this.table.scrollTop * 2 + this.table.clientHeight < this.table.scrollHeight) {
    //   this.loadPrev();
    // }
  }

  // Выравнивание столбцов таблицы при загрузке:
  this.alignColumns = function() {
    var headCells = this.head.querySelectorAll('tr:first-child > th');
    headCells.forEach(headCell => {
      var bodyCell = this.body.querySelector(`tr:first-child > td:nth-child(${headCell.id})`),
          bodyCellWidth = bodyCell.offsetWidth,
          newWidth = bodyCellWidth;
        headCell.style.width = newWidth + 'px';
        headCell.style.minWidth = newWidth + 'px';
        headCell.style.maxWidth = newWidth + 'px';
        bodyCell.style.width = newWidth + 'px';
        bodyCell.style.minWidth = newWidth + 'px';
        bodyCell.style.maxWidth = newWidth + 'px';
    });
  }

  // Подсчет итогов таблицы:

  this.countResults = function() {
    if (!this.results) {
      return;
    }

  }

  // Запуск перетаскивания столбца:
  this.startResize = function(event) {
    this.curColumn = event.currentTarget.parentElement;
    this.startOffset = this.curColumn.offsetWidth - event.pageX;
  }

  // Перетаскивание столбца:
  this.resize = function(event) {
    if (this.curColumn) {
      var newWidth = this.startOffset + event.pageX;
          newWidth = newWidth > 3 ? newWidth + 'px' : '3px';
      this.curColumn.style.width = newWidth;
      this.curColumn.style.minWidth = newWidth;
      this.curColumn.style.maxWidth = newWidth;
      this.head.querySelectorAll(`th:nth-child(${this.curColumn.id})`).forEach(el => {
        el.style.width = newWidth;
        el.style.minWidth = newWidth;
        el.style.maxWidth = newWidth;
      });
      this.body.querySelectorAll(`td:nth-child(${this.curColumn.id})`).forEach(el => {
        el.style.width = newWidth;
        el.style.minWidth = newWidth;
        el.style.maxWidth = newWidth;
      });
    }
  }

  // Остановка перетаскивания столбца:
  this.stopResize = function() {
    this.curColumn = null;
  }
}

//=====================================================================================================
// Заполенение контента по шаблону:
//=====================================================================================================

// Получение свойств "#...#" из шаблонов HTML:

function extractProps(template) {
  return template.match(/#[^#]+#/gi).map(prop => prop = prop.replace(/#/g, ''));
}

// Заполнение блока по шаблону:

function fillByTemplate(template, data, target) {
  var list = createListByTemplate(template, data);
  target.innerHTML = list;
}

// Создание списка элементов на основе шаблона:

function createListByTemplate(template, data) {
  var list = '', newEl;
  data.forEach(dataItem => {
    newEl = template;
    newEl = createElByTemplate(newEl, dataItem);
    list += newEl;
  });
  return list;
}

// Создание одного элемента на основе шаблона:

function createElByTemplate(newEl, data) {
  var props = extractProps(newEl),
      propRegExp,
      value;
  props.forEach(key => {
    propRegExp = new RegExp('#' + key + '#', 'gi');
    if (data[key]) {
      value = data[key];
    } else {
      value = '';
    }
    newEl = newEl.replace(propRegExp, value);
  });
  return newEl;
}
