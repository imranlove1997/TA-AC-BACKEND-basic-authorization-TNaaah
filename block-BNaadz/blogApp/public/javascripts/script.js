var button = document.querySelector('.btn-comment');
var buttonHide = document.querySelector('.btn-hide');
var comments = document.querySelector('.comments');

button.addEventListener('click', () => {
    comments.classList.remove('hide');
    button.classList.add('hide');
    buttonHide.classList.remove('hide');
})
buttonHide.addEventListener('click', () => {
    comments.classList.add('hide');
    buttonHide.classList.add('hide');
    button.classList.remove('hide');
})