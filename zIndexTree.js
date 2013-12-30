//to use, simply call zIndexTree anywhere you would like to have it drawn

function zIndexTree(dontLogTree) {
	var treeArray = createDocumentArray('body', '0');
	sortTree(treeArray);
	if(!dontLogTree) {
		logAll(treeArray, 0);
		//add a visible break to help visualize seperate calls
		console.log('-----------------------------------');
		console.log('-----------------------------------');
	}

	return treeArray;
}

//element1 and element2 should be the context string of the item you are looking for, in the order they appear in the DOM.
function compare(treeArray, element0, element1) {
	var returnedElem = [];
	returnedElem[0] = findInTree(treeArray, 'contextString', element0);
	returnedElem[1] = findInTree(treeArray, 'contextString', element1);

	var onTop = whichIsOnTop(returnedElem[0], returnedElem[1]);

	console.log(returnedElem[0].contextString + ' - ' +returnedElem[0].stackingContext);
	console.log(returnedElem[1].contextString + ' - ' +returnedElem[1].stackingContext);
	console.log('Sit\'s on top: ' + returnedElem[onTop].contextString);
}

//given the two elements with defined stacking contexts, return the one that sits on top.
function whichIsOnTop(object0, object1) {
	var split = [];
	split[0] = object0.stackingContext.split('.');
	split[1] = object1.stackingContext.split('.');

	//convert strings to numbers
	$.each(split, function(key, value) {
		$.each(value, function(key1, value1) {
			split[key][key1] = parseInt(value1);
		});
	});

	//get the longer of the two lengths
	var splitLength = (split[0].length > split[1].length) ? split[0].length : split[1].length;

	//cycle through the splits to find which one is on top
	var i = 0;
	var onTop;
	while(i<splitLength) {
		//if the current number of split 0 is higher, it sits on top, so set onTop to 0 and exit by setting i to splitLength
		if(split[0][i] > split[1][i]) {
			onTop = 0;
			i = splitLength;
		}
		//if the split numbers are equal, and this is not the last number, iterate i to go to the next number
		else if(split[0][i] == split[1][i] && i < splitLength-1)
			i++;
		//otherwise, if we've gone through all possible avenues, and they are equal, the one that is lower in the DOM, which should be the second provided argument, object1, sits on top, so return 1 and exit by setting i to splitLength
		else {
			onTop = 1;
			i = splitLength;
		}
	}
	console.log(split);
	return onTop;
}

function createDocumentArray(value, currentStackingContext, currentDepth){
	if(currentDepth == null)
		currentDepth = 0;

	//create a jquery object out of the element
	var $elem = $(value);
	$elem.contextString = createContextString($elem);

	//set the depth property
	$elem.depth = currentDepth;

	//add the current stacking context, using a dot notation system
	//i.e. 1.1.0
	//i.e. 3.2
	//i.e. 3.2.7
	var setZIndex = $elem.css('z-index');
	if(setZIndex != 'null' && setZIndex != 'auto') {
		currentStackingContext += '.' + setZIndex;
	}
	$elem.stackingContext = currentStackingContext;

	//if the element has children, use recursion to write out lower branches
	if($elem.children()) {
		var newArray = [];
		newArray.push($elem);
		$elem.children().each(function(key, value) {
			//cycle through children and add them to the tree
			var arrayToAdd = createDocumentArray(value, currentStackingContext, currentDepth++);
			//push returned array to new array
			newArray.push(arrayToAdd);
		});
	} else {
		return $elem;
	}
	return newArray;
}

//$object must be a jquery object
function createContextString($object) {
	//first of all, the element name
	var string = $object.context.nodeName.toLowerCase();
	//then the id if there is one
	if( $object.context.id ) {
		string += '#' + $object.context.id;
	}
	//and then the class if it exists
	if( $object.context.className ) {
		//split by spaces incase there is multiple classes
		var classArray = $object.context.className.split(' ');
		//cycle through array adding classes
		for(i=0; i<classArray.length; i++) {
			string +=  '.' + classArray[i];
		}
	}

	return string;
}

function writeTreeLine(indentCount, key, value) {
	//create indents and marks to help show different branches in the tree
	var indentMark = '';
	for(i=0; i<indentCount; i++) {
		if(i%3===0)
			indentMark += '|';
		else
			indentMark += ' ';
	}

	//write out the branch of the tree
	console.log(indentMark + key + ' : ' + value.contextString + ' : ' + value.stackingContext);
}

function logAll(documentArray, indentStartCount) {
	//cycle through the entire array
	$.each(documentArray, function(key, value) {
		if(value.contextString)
			writeTreeLine(indentStartCount, key, value);
		else
			logAll(value, indentStartCount + 3)
	});
}

function sortTree(treeArray) {
	$.each(treeArray, function(key, value) {
		value.sort(function(a, b) {
			if(a[0].stackingContext && b[0].stackingContext)
				return a[0].stackingContext > b[0].stackingContext ? a : b;
			else a[0].stackingContext ? a : b;
		});
		if(value.length > 1) {
			for(i==0; i < value.length; i++) {
				sortTree(value[i]);
			}
		}
	});
}

function findInTree(treeArray, searchProperty, searchValue) {
	var foundObject;
	//search array
	$.each(treeArray, function(key, value) {
		if(value[0][searchProperty] === searchValue) {
			foundObject = value[0];
			//break out of the each function upon success
			return false;
		}
		//if match is false, and array is longer than 1(to disclude the single item jquery objects, descend to into the next array down)
		else if (value.length > 1) {
			foundObject = findInTree(value, searchProperty, searchValue);
			//break out of the each function upon success
			if(foundObject) return false;
		}
	});
	return foundObject;
}