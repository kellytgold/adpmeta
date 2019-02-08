const fs = require('fs')

let metadata = JSON.parse(fs.readFileSync("employeeMeta.json").toString()).meta
let allObjects = metadata['/data/transforms'][0]
let fieldsArr = [];
let mapping = {
    
}
const identifyFields = key => {if ("pattern" in allObjects[key] === true || key.includes('codeValue') === true || key.includes('shortName') === true || key.includes('idValue') === true){return key}}
//const getWorkerData = key => key.includes('/worker')
//const identifyArrays = (newArray, key) => {if ("maxItems" in allObjects[key] === true && "minItems" in allObjects[key] === true) {newArray.push(key+'[*]')}return newArray}
//const identifyObjects = (newArray, key) => {if ("maxItems" in allObjects[key] !== true && "pattern" in allObjects[key] !== true && key.includes('codeValue') !== true){newArray.push(key+'.')}return newArray}

let fields = Object.keys(allObjects).filter(identifyFields)
//let arrays = Object.keys(allObjects).reduce(identifyArrays, [])
//let objects = Object.keys(allObjects).reduce(identifyObjects, [])


const getParentPath1 = key => {
    let path = getParentPath(key, '')
    return {key, path}
}

const getParentPath = (key, path) => {
	let parentPath = key.substring(0, key.lastIndexOf('/'))
	lastKey = key.split('/').pop()
    let parentObject = allObjects[parentPath]
            if (typeof parentObject == "undefined"){
            path = 'worker'+ path
            fieldsArr.push(path)
            return path
        }
	if (parentPath.length > 1){
		if (typeof parentObject != "undefined"){
			if (parentObject.hasOwnProperty('maxItems') && parentObject.hasOwnProperty('minItems')) {
				path = '[*]' + lastKey + path
			}
			else if (parentObject.hasOwnProperty('maxItems') !== true && parentObject.hasOwnProperty('pattern') !== true){
				path = '.' + lastKey + path
            }
        }
        return getParentPath(parentPath, path)
    }
    return path
}


let out = fields.map(getParentPath1)
//console.log(out)
//console.log(fields)

const hydrator = x => {
    let parent = x.key
    let parentPath = parent.substring(0, parent.lastIndexOf('/'))
    if (x.key.includes('codeValue')){
       if  (allObjects[parentPath].hasOwnProperty('codeList') === true){
            if (allObjects[parentPath].codeList.hasOwnProperty('listItems') === true){
                fieldData = allObjects[parentPath].codeList.listItems
                finalData = {path: key, pickListItems: fieldData}
            }
            else if (allObjects[parentPath].codeList.hasOwnProperty('links') === true){
                fieldData = allObjects[parentPath].codeList.links
                finalData = {}
            }
       }
       else {
           fieldData = allObjects[parentPath]
       }
        //console.log(allObjects[parentPath].codeList)

        out = JSON.stringify(fieldData)
    }
    else {
    fieldData = allObjects[x.key];
    }
    key = x.path;
    poo = fieldData
    fieldData.path = key
    //console.log(fieldData)
    return fieldData
}
let finalResult = out.map(hydrator)
console.log(JSON.stringify({fields: finalResult}))
//out.map(x => x.replace(/\./g, '/').replace(/\[\*\]/g, '/'))


