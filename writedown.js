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
				
			case 'heading':
				// We don't operate based on selection here, rather we care about the whole line where the caret is.
				// The code is buggy from one view point, but that can be thought of as a feature as well as described below;
				// We only count how many hashes are before the cursor start position and add one more to it.
				
				// linear search backwards for # and \n
				var pos_hash = -1;
				var pos_newl = -1;
				var count_hash = 0;
				for (var i=start-1; i>=0; i--) {
					if (content[i] === '\n') {
						pos_newl = i;
						break;
					}
					
					if (content[i] === '#') {
						pos_hash = i;
						// if there are multiple #'s, we get the pos of the first one
						count_hash += 1;	
					}
					
					// If # is between some text, ignore it
					if (content[i]!=='#' && count_hash>0) {
						count_hash = 0;
						pos_hash = -1;
					}
				}
				
				// Onclick insert # and keep on adding new # until 6 hashes. Then go back to one
				if (count_hash === 0)
					pos_hash = pos_newl; // -1
				
				if (count_hash >= 6) 
					tarea.value = content.slice(0, pos_newl+1) + content.substring(pos_hash+count_hash+1); // +1 is for space
				else 
					tarea.value = content.slice(0, pos_newl+1) + '#'.repeat(count_hash+1) + ' ' + content.substring(pos_hash+count_hash+1); //+1 is for space
				
				// Select the heading. If no heading insert a placeholder text
				tarea.selectionStart = pos_newl + (count_hash>=6?1:count_hash+3); // +1 extra for space
				
				// linear search forward for \n
				start = tarea.selectionStart;
				content = tarea.value;
				var pos_lastl = -1;
				for (var i=start; i<content.length; i++) {
					if (content[i] === '\n') {
						pos_lastl = i;
						break;
					}
				}
				
				if (start === pos_lastl || start ===content.length) {
					// insert placeholder text if no user defined heading after ## 
					var placeholder = 'Heading';
					count_hash = (count_hash>=6 ? 0 : count_hash+1);
					tarea.value = content.slice(0, start) + placeholder + content.substring(start);
					tarea.selectionEnd = start + placeholder.length;
				}
				else 
					// Dangerous! If only one line, then pos_lastl will be -1
					tarea.selectionEnd = (pos_lastl>0 ? pos_lastl : content.length);
				
				break;
				
				
				
			case 'bold':
				// Check to un-bold
				if (start >=2 && content.slice(start-2, start)==='**' && content.slice(end, end+2)==='**') {
					tarea.value = content.substring(0, start-2) + selected_text + content.substring(end+2);
					tarea.selectionStart = start - 2;
					tarea.selectionEnd = start + selected_text.length - 2;
				}
				else {	
					tarea.value = content.substring(0, start) + '**'+ selected_text + '**' + content.substring(end);
					tarea.selectionStart = start + 2;
					tarea.selectionEnd = start + selected_text.length + 2;
				}
				
				break;
				
			case 'italic':
				// Un italic - Check if already not bold **
				//if (start >=1 && content[start-1]==='*' && content[end]==='*' && content.slice(start-2, start)!=='**' && content.slice(end, end+2)!=='**')
				// Above if checks only for **Text**, but what about ***Text***?
				// Logic is we need *Text* but not exactly **Text**. Exactly two * is checked by **Text** and then not ***Text***
				if ( (start >=1 && content[start-1]==='*' && content[end]==='*') && !(start>=2 && content.slice(start-2, start)==='**' && content.slice(end, end+2)==='**' && !(start>=3 && content.slice(start-3, start)==='***' && content.slice(end, end+3)==='***') ))
				{
					tarea.value = content.substring(0, start-1) + selected_text + content.substring(end+1);
					tarea.selectionStart = start - 1;
					tarea.selectionEnd = start + selected_text.length - 1;
				}
				else {	
					tarea.value = content.substring(0, start) + '*'+ selected_text + '*' + content.substring(end);
					tarea.selectionStart = start + 1;
					tarea.selectionEnd = start + selected_text.length + 1;
				}
				
				break;
			
			case 'link':
				// If something is selected
				//selected_text = "www.example.com";
				
				break;
				
			case 'quote':
				if (start === end)
					selected_text = 'Blockquote';
				// Just to make sure that there is exactly one '\n' before and after our quote
				var added_text = (content[start-1]==='\n'?'\n':'\n\n') + '> ' + selected_text + (content[end]==='\n'?'\n':'\n\n');
				tarea.value = content.substring(0, start) + added_text + content.substring(end);

				// Select the text 
				tarea.selectionStart = start + 3 + (content[start-1]==='\n'?0:1);
				tarea.selectionEnd = tarea.selectionStart + selected_text.length;
				
				// No Un-quote at this moment
				break;
				
			case 'br':
				// Just insert a <br/> tag
				var linebreak = '<br/>\n';
				tarea.value = content.substring(0, end) + linebreak + content.substring(end);
				// The cursor moves to the end. That should be avoided
				tarea.selectionStart = end + linebreak.length;
				tarea.selectionEnd = tarea.selectionStart;
				
				break;
				
			case 'rule':
				// Just insert a <br/> tag
				var linebreak = (content[end-1]==='\n'?'\n':'\n\n') + '-----\n';
				tarea.value = content.substring(0, end) + linebreak + content.substring(end);
				// The cursor moves to the end. That should be avoided
				tarea.selectionStart = end + linebreak.length;
				tarea.selectionEnd = tarea.selectionStart;
				
				
				break;
				
		} // End of Switch
		
		
		
		// Finally call the event handler for input change
		re_render();
	} // End of if (target.id)
	
	else {
		console.log('Oops!');
		console.log(event.target);
	}
})



