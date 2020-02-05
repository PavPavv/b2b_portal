//////////////////////поведение форм "Добавить магазин" и "Заявка на дилерство"///////////////////////////////////////////////

console.log('I am visible!');
//сохранять маленький шрифт при потере фокуса
const inputForm = document.querySelectorAll('.form-input');
const label = document.querySelectorAll('.label');

console.log(inputForm);
for (let i = 0; i < inputForm.length; i++) {
  inputForm[i].addEventListener('blur', function() {
      if (inputForm[i].value != '') {
        inputForm[i].nextElementSibling.style.fontSize = '0.675em';
      } else {
        return;
      }
  });
}

//Работа кнопки "Задать вручную" в форме "Добавление магазина"
const addBtn = document.querySelector('#addAddress');
const adding = document.querySelector('.adding');

addBtn.addEventListener('click', function() {
        adding.classList.toggle('addAddress1');
});
