var disp = document.getElementById('text-disp-div');
var tarea = document.getElementById('textarea-div');
var icon_group = document.getElementById('textarea-icon-group');

function re_render() {
	disp.innerHTML = window.marked(tarea.innerText);
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
		// create a new text node to insert at the caret position
		var node = document.createTextNode('');
		// Get the selected text
		tarea.focus();
		var sel = window.getSelection();
		var range = sel.getRangeAt(0);
		var selected_text = range.toLocaleString();
		if (!selected_text)
			selected_text = 'Text';
		// To replace the selected text, delete it first
		range.deleteContents();
		
		switch(target_node.id) {
			case 'bold':
				node.textContent = '**'+ selected_text +'**';
				break;
			case 'italic':
				node.textContent = '*'+ selected_text +'*';
		}
		
		// Then add the new content
		range.insertNode(node);
		// Select the new content
		var new_range = document.createRange();
		//new_range.selectNodeContents(node); // selcts all including ** **
		new_range.setStart(node, 1);
		new_range.setEnd(node, selected_text.length+1);
		sel.removeAllRanges();
		sel.addRange(new_range);
		
		// Finally call the event handler for input change
		re_render();
	}
})



