const fs = require('fs')

let metadata = JSON.parse(fs.readFileSync("employeeMeta.json").toString()).meta

let allObjects = metadata['/data/transforms'][0]

const getWorkerFields = key => key.includes('/worker')
let fields =  Object.keys(allObjects).filter(getWorkerFields)
console.log(fields)

const lastPathKey = lastKey => lastKey[lastKey.length -1]

const buildPath = fieldKey => {
	let path = buildPathRec(fieldKey, "") 
	let parentPath = fieldKey.substring(0, fieldKey.lastIndexOf('/'))
	let parentObject = allObjects[parentPath]
	
}

const buildPathRec = (fieldKey, path) => {
	let parentPath = fieldKey.substring(0, fieldKey.lastIndexOf('/'))
	let parentObject = allObjects[parentPath]
	if (parentPath != "/worker"){
		if (parentObject.hasOwnProperty('maxItems')) {
			path = parentPath + '[*]' + '.'+lastPathKey(fieldKey.split('/'))
			console.log(path)
		}
		//else if (parentObject.hasOwnProperty(''){
			
		//}
	}
	// path = path + something
	// if done with path
	// 	return path 
	// else buildPathRec(nextparentObjectkey, path)
}

fields.map(buildPath)
