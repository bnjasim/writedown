// TODO
// 1. Table align-center

var disp = document.getElementById('text-disp-div');
var tarea = document.getElementById('textarea-div');
var icon_group = document.getElementById('textarea-icon-group');
var draw_area = document.getElementById('draw-area');
var draw_input_area = document.getElementById('draw-input-area');
var copy_clipboard_btn = document.getElementById('clipboard-btn')

function re_render() {
	disp.innerHTML = window.marked(tarea.value);
	// console.log(disp.innerHTML)
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
    if (target_node.tagName !== 'BUTTON') {
        target_node = target_node.parentElement;
	}
    
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
				
				// insert placeholder text if no user defined heading after ##
				if (start === pos_lastl || start ===content.length) { 
					var placeholder = 'Heading';
					count_hash = (count_hash>=6 ? 0 : count_hash+1);
					tarea.value = content.slice(0, start) + placeholder + content.substring(start);
					tarea.selectionStart = start;
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
				
			case 'center':
				// Check to un-center
				if (start >=2 && content.slice(start-2, start)==='<<' && content.slice(end, end+2)==='>>') {
					tarea.value = content.substring(0, start-2) + selected_text + content.substring(end+2);
					tarea.selectionStart = start - 2;
					tarea.selectionEnd = start + selected_text.length - 2;
				}
				else {	
					tarea.value = content.substring(0, start) + '<<'+ selected_text + '>>' + content.substring(end);
					tarea.selectionStart = start + 2;
					tarea.selectionEnd = start + selected_text.length + 2;
				}
				
				break;	
			
			case 'link':
				//TODO - bootstrap input box for link address
				//var link_addr = window.prompt('Link Address');
				// If something is selected, set that as the link. Otherwise use example.com
				if (start === end) 
					selected_text = 'www.example.com';
				
				var padding_text = (end===0 || content[end-1]==='\n' || content[end-1]===' ' ? '' : ' ') + '[here](';
				var added_text =  padding_text + selected_text + ')' + (content[end]===' ' ? '' : ' ');
				
				tarea.value = content.substring(0, start) + added_text + content.substring(end);
				tarea.selectionStart = start + padding_text.length;
				tarea.selectionEnd = tarea.selectionStart + selected_text.length;

				
				break;
				
			case 'image':
				// If something is selected, set that as the image src. Otherwise use an example image
				if (start === end) 
					selected_text = 'http://media02.hongkiat.com/ww-flower-wallpapers/roundflower.jpg';
				
				var padding_text = (end===0 || content[end-1]==='\n' || content[end-1]===' ' ? '' : ' ') + '![Image](';
				var added_text =  padding_text + selected_text + ')' + (content[end]===' ' ? '' : ' ');
				
				tarea.value = content.substring(0, start) + added_text + content.substring(end);
				tarea.selectionStart = start + padding_text.length;
				tarea.selectionEnd = tarea.selectionStart + selected_text.length;

				
				break;
				
				
				break;
				
			case 'quote':
				// Unquote simply if the characters before start are '\n> '
				if (content.substring(start-3, start) === '\n> ') {
					tarea.value = content.substring(0, start-3) + content.substring(start);
					tarea.selectionStart = start - 3;
					tarea.selectionEnd = end - 3;
				}
				else {
					// Add quote
					if (start === end)
						selected_text = 'Blockquote';
					// Just to make sure that there is exactly one '\n' before and after our quote
					var added_text = (start===0 || content[start-1]==='\n'?'\n':'\n\n') + '> ' + selected_text + (content[end]==='\n'?'\n':'\n\n');
					tarea.value = content.substring(0, start) + added_text + content.substring(end);

					// Select the text 
					tarea.selectionStart = start + 3 + (start===0 || content[start-1]==='\n'?0:1); // +3 is for '> ' and '\n'
					tarea.selectionEnd = tarea.selectionStart + selected_text.length;
				}
				
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
				var linebreak = (content[end-1]==='\n'?'\n':'\n\n') + '-----\n';
				tarea.value = content.substring(0, end) + linebreak + content.substring(end);
				// The cursor moves to the end. That should be avoided
				tarea.selectionStart = end + linebreak.length;
				tarea.selectionEnd = tarea.selectionStart;
				
				break;
				
			case 'code':
				var padding_text = (end===0 || content[end-1]==='\n'?'\n':'\n\n')  + '    '; // 4 spaces
				var rem_text = 'code after\n      4 spaces\n';
				selected_text = padding_text + rem_text;
				tarea.value = content.substring(0, end) + selected_text + content.substring(end);
				tarea.selectionStart = end + padding_text.length;
				tarea.selectionEnd = tarea.selectionStart + rem_text.length;
				
				break;
				
			case 'terminal':
				if (start === end)
					selected_text = 'Verbatim';
				// Remove Back ticks if already added
				if (start >=1 && content[start-1]==='`' && content[end]==='`') {
					tarea.value = content.substring(0, start-1) + selected_text + content.substring(end+1);
					tarea.selectionStart = start - 1;
					tarea.selectionEnd = start + selected_text.length - 1;
				}
				else {	
					tarea.value = content.substring(0, start) + '`'+ selected_text + '`' + content.substring(end);
					tarea.selectionStart = start + 1;
					tarea.selectionEnd = start + selected_text.length + 1;
				}
				
				break;
				
			// Bugs in Lists: Two digit numbers will be problematic as match('[0-9]. ') is for only one digit
			// But we hope this implementation (without complicated regular expressions) will be fine most of the time!
			case 'list0':
				// bullet list/Unordered list
				if (start === end) // nothing selected
						selected_text = 'List Item';
				
				// Allow nested lists, if start is not at the beginning of List Item.
				// If start is at the beginning, then change the list type.
				if (start >= 3 && content.slice(start-3, start).match('[0-9]. ')) {
					var padding_text = '- ';					
					tarea.value = content.substring(0, start-3) + padding_text + content.substring(start);
					tarea.selectionStart = start - 1;
					tarea.selectionEnd = end - 1;
					break;
				}
				
				// Do we have to un-list, if same list type? Un-list only if start is at the beginning. Otherwise nested list 
				if (start >= 2 && content.slice(start-2, start)==='- ') {
					tarea.value = content.substring(0, start-2) + content.substring(start);
					tarea.selectionStart = start - 2;
					tarea.selectionEnd = end - 2;
				}
				else {	
					var padding_text = (start===0 || content[start-1]==='\n' ? '' : '\n') + '- ';
					
					tarea.value = content.substring(0, start) + padding_text + selected_text + content.substring(end);
					tarea.selectionStart = start + padding_text.length;
					tarea.selectionEnd = tarea.selectionStart + selected_text.length;
				}
				
				break;
				
			case 'list1':
				// Ordered list/Numbered list
				if (start === end) // nothing selected
						selected_text = 'List Item';
				
				// Allow nested lists, if start is not at the beginning of List Item.
				// If start is at the beginning, then change the list type.
				if (start >= 2 && content.slice(start-2, start)==='- ') {
					var padding_text = '1. ';					
					tarea.value = content.substring(0, start-2) + padding_text + content.substring(start);
					tarea.selectionStart = start + 1;
					tarea.selectionEnd = end + 1;
					break;
				}
				
				// Do we have to un-list? 
				if (start >= 3 && content.slice(start-3, start).match('[0-9]. ')) {
					tarea.value = content.substring(0, start-3) + content.substring(start);
					tarea.selectionStart = start - 3;
					tarea.selectionEnd = end - 3;
				}
				else {	
					var padding_text = (start===0 || content[start-1]==='\n' ? '' : '\n') + '1. ';
					
					tarea.value = content.substring(0, start) + padding_text + selected_text + content.substring(end);
					tarea.selectionStart = start + padding_text.length;
					tarea.selectionEnd = tarea.selectionStart + selected_text.length;
				}
								
				break;
				
			case 'Math':
				// Insert $$ $$
				var latex_text = ' $$ x^2 $$ '; // escaping! 
				tarea.value = content.substring(0, start) + latex_text + content.substring(end);
				tarea.selectionStart = start + 4;
				tarea.selectionEnd = start + latex_text.length - 4;
				
				break;
				
			case 'math':
				// Insert '//(' and '//)'
				var latex_text = '\\\\\( x^2 \\\\\)'; // escaping! 
				tarea.value = content.substring(0, start) + latex_text + content.substring(end);
				tarea.selectionStart = start + 4;
				tarea.selectionEnd = start + latex_text.length - 4;
		
				break;
				
			case 'table':
				
				var padding_text = '\nColumn1';
				var table_text = padding_text + ' | Column2\n:-----:|:--------:|\n1 | 2\n3 | 4\n';
				tarea.value = content.substring(0, start) + table_text + content.substring(end);
				tarea.selectionStart = start + 1;
				tarea.selectionEnd = start + padding_text.length;
				
				break;
				
			case 'draw':
				// Hide the draw-area if already shown
				if (!draw_area.classList.contains("disabled")) {
					draw_area.classList.add('disabled');
				}
				else {
					draw_area.classList.remove('disabled');
					// clear the input text field of previous values
					draw_input_area.value = '';
					draw_input_area.focus();	
				}
				
				break;
				
				
				
		} // End of Switch
		
		
		
		// Finally call the event handler for input change
		re_render();
	} // End of if (target.id)
	
	else {
		console.log('Oops! ID not found');
		console.log(target_node);
	}
}); // End // Button click handlers


document.getElementById('draw-close').addEventListener('click', function(event) {
	// Simply hide the draw-area
	draw_area.classList.add('disabled');
});

// keep track of how many drawings inserted
var count_drawing = 1;

document.getElementById('data-url-btn').addEventListener('click', function() {
	// get the input and check if it starts with data:image/png;base64
	var im_data = draw_input_area.value.trim();
	// Hide the draw-area
	draw_area.classList.add('disabled');
	
	// Insert only if image data is valid
	var s = 'data:image/';
	if (im_data.length>s.length && im_data.substr(0, s.length)===s) {
		// Insert the image. Keep track of count as paint1, paint2 etc.
		tarea.focus();
		var content = tarea.value;
		var start = tarea.selectionStart;
		var end = tarea.selectionEnd;
		var insert_text1 = (end===0 || content[end-1]==='\n'?'':' ') + '![Drawing' + count_drawing + '][paint' + count_drawing + ']\n';
		var insert_text2 = '\n\n[paint' + count_drawing + ']:'+im_data;
		tarea.value = content.substring(0, start) + insert_text1 + content.substring(end) + insert_text2;
		tarea.selectionStart = end + insert_text1.length;
		tarea.selectionEnd = tarea.selectionStart;

		count_drawing += 1;

		// Call the event handler for input change
		re_render();
	}
});

// Trigger Ok button click when pressed enter in the input field of insert drawing
draw_input_area.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("data-url-btn").click();
    }
});

var clipboard_textarea = document.getElementById('clip-text-area');
// To Copy to the clipboard
copy_clipboard_btn.addEventListener('click', function() {
	// Copy the innerHTML in the disp-div to the clipboard
	// Create a textarea and set its contents to the text you want copied to the clipboard.
	// Append the textarea to the DOM.
	// Select the text in the textarea.
	// Call document.execCommand("copy")
	// Remove the textarea from the dom.
	var clipboard_textarea = document.createElement('textarea');
	clipboard_textarea.id = 'clip-text-area';
	document.body.appendChild(clipboard_textarea);
	clipboard_textarea.value = disp.innerHTML;
	clipboard_textarea.select();
	document.execCommand('copy');
	document.body.removeChild(clipboard_textarea);
	
	// alert user that copied
	copy_clipboard_btn.innerText = 'Copied';
	copy_clipboard_btn.style.color = 'green';
	
	setTimeout(function() {
		copy_clipboard_btn.innerText = 'Copy HTML to Clipboard';
		copy_clipboard_btn.style.color = 'black';
	}, 500)
	
	
});

