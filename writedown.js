var disp = document.getElementById('text-disp-div');
var tarea = document.getElementById('textarea-div');

tarea.addEventListener('input', function (evt) {
    disp.innerHTML = marked(tarea.innerText);
    renderMathInElement(disp);
});

