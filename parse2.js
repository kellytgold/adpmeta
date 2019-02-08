const fs = require('fs')

let metadata = JSON.parse(fs.readFileSync("employeeMeta.json").toString()).meta
let allObjects = metadata['/data/transforms'][0]
let fieldsArr = [];

const identifyFields = key => {if ("pattern" in allObjects[key] === true || key.includes('codeValue') === true || key.includes('shortName') === true || key.includes('idValue') === true){return key}}
//const getWorkerData = key => key.includes('/worker')
//const identifyArrays = (newArray, key) => {if ("maxItems" in allObjects[key] === true && "minItems" in allObjects[key] === true) {newArray.push(key+'[*]')}return newArray}
//const identifyObjects = (newArray, key) => {if ("maxItems" in allObjects[key] !== true && "pattern" in allObjects[key] !== true && key.includes('codeValue') !== true){newArray.push(key+'.')}return newArray}

let fields = Object.keys(allObjects).filter(identifyFields)
//let arrays = Object.keys(allObjects).reduce(identifyArrays, [])
//let objects = Object.keys(allObjects).reduce(identifyObjects, [])

const getParentPath = (key, path) => {
	let parentPath = key.substring(0, key.lastIndexOf('/'))
	lastKey = key.split('/').pop()
	let parentObject = allObjects[parentPath]
	if (key.length > 1){
		if (typeof parentObject != "undefined"){
			if (parentObject.hasOwnProperty('maxItems') && parentObject.hasOwnProperty('minItems')) {
				path = '[*]' + lastKey + path
			}
			else if (parentObject.hasOwnProperty('maxItems') !== true && parentObject.hasOwnProperty('pattern') !== true){
				path = '.' + lastKey + path
			}
		getParentPath(parentPath, path)
		}
	}
	if (key === '/worker'){
		key = ''
		path = 'worker'+ path
		//path = path.substring(0, path.length -1)
		console.log(path)
		fieldsArr.push(path)
	}
}


out = fields.map(getParentPath, '')
console.log(out)
