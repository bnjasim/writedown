var disp = document.getElementById('text-disp-div');
var tarea = document.getElementById('textarea-div');
var icon_group = document.getElementById('textarea-icon-group');

function re_render() {
	disp.innerHTML = window.marked(tarea.value);
    window.renderMathInElement(disp);
}

tarea.addEventListener('input', function (evt) {
    re_render();
});


// Button click handlers
icon_group.addEventListener('click', function(event) {
    // we care about two targets. Either on the button or on the span inside button
    // Otherwise we don't take any action
    var target_node = event.target; 
    if (target_node.tagName !== 'BUTTON') 
        target_node = target_node.parentElement;
    
    if (target_node.id) { // insert markdown only for valid buttons with an id
		
		tarea.focus();
		var content = tarea.value;
		var start = tarea.selectionStart;
		var end = tarea.selectionEnd;
		var selected_text = 'Text';
		
		if (start < end) // something is selected
			selected_text = content.substring(start, end);
				
		switch(target_node.id) {
			case 'bold':
				tarea.value = content.substring(0, start) + '**'+ selected_text + '**' + content.substring(end);
				tarea.selectionStart = start + 2;
				tarea.selectionEnd = end + 2;
				break;
			case 'italic':
				tarea.value = content.substring(0, start) + '*'+ selected_text + '*' + content.substring(end);
				tarea.selectionStart = start + 1;
				tarea.selectionEnd = end + 1;
				break;
		}
		
		// Finally call the event handler for input change
		re_render();
	}
})



