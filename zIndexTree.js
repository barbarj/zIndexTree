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

//element1 and element2 should be the stacking context of ythe item you are looking for
function compare(treeArray, element1, element2) {
	var returnedElem1 = findInTree(treeArray, 'contextString', element1);
	var returnedElem2 = findInTree(treeArray, 'contextString', element2);

	console.log(returnedElem1.contextString + ' - ' +returnedElem1.stackingContext);
	console.log(returnedElem2.contextString + ' - ' +returnedElem2.stackingContext);
}

function createDocumentArray(value, currentStackingContext){
	//create a jquery object out of the element
	var $elem = $(value);
	$elem.contextString = createContextString($elem);

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
			var arrayToAdd = createDocumentArray(value, currentStackingContext);
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