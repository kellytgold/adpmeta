const fs = require('fs')

//drill down on the metadata to an array of object keys and their properties. 
let metadata = JSON.parse(fs.readFileSync("payDistroMeta.json").toString()).meta
let allObjects = metadata['/data/transforms'][0]
//if (request_path_variables.id === "employees"
  let fieldMappings = {
    "hidden": "hidden",
    "maxLength": "length",
    "minLength": "minLength",
    "optional": "vendorRequired",
    "pattern": "mask",
    "readOnly": "vendorReadOnly",
    "shortLabelName": "description",
    "path": "vendorPath",
    "dependencies": "relations",
    "maxItems": "length",
    "pickListItems": "picklistValues",
    "reference" : "reference",
    "longLabelName":"description",
    "codeValue":"value",
    "shortName":"description",
    "longName" : "description",
    "valueDescription": "description"
  }

//Identify which entries in allObjects are fields, (some are arrays/objs and we don't want those for now)
const identifyFields = key => {
    if ("pattern" in allObjects[key] === true || key.includes('codeValue') === true || key.includes('shortName') === true || key.includes('idValue') === true || key.includes('itemID') === true || "shortLabelName" in allObjects[key] === true ){return key}}
let fields = Object.keys(allObjects).filter(identifyFields)


//kick off function for the recursive path finding. 
const getParentPath1 = key => {
    let path = getParentPath(key, '')
    return {key, path}
}

// recursive function to identify the paths. Start with known fields, traverse up the path identifying parent object types on the way up til done
const getParentPath = (key, path) => {
	let parentPath = key.substring(0, key.lastIndexOf('/'))
	let lastKey = key.split('/').pop()
    let parentObject = allObjects[parentPath]
    if (typeof parentObject == "undefined"){
        if (parentPath.length < 1){
            path = lastKey + path
            return path
        }
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
        else if (typeof parentObject == "undefined"){
            path = '.' + lastKey + path
        }
        return getParentPath(parentPath, path)
    }
    return path
}

// Result/kickoff for recursive path finding. Kicks off the kick off function 
let findAllPaths = fields.map(getParentPath1)

// This function hydrates paths with their respective metadata properties
const hydrator = x => {
    let fieldData;
    let parentPath = x.key.substring(0, x.key.lastIndexOf('/'))
    //special handling for codeValue fields, doesn't follow the same structure
    if (x.key.includes('codeValue')){
        fieldData = allObjects[parentPath]
       if  (allObjects[parentPath].hasOwnProperty('codeList') === true){
            if (allObjects[parentPath].codeList.hasOwnProperty('listItems') === true){
                let listData = allObjects[parentPath].codeList.listItems
                listData.map(obj => {
                    //Map the deep fields to CE standards
                    Object.keys(obj).map(field => { if(fieldMappings.hasOwnProperty(field)){
                        let mappedValue = fieldMappings[field]
                        if (field !== fieldMappings[field]){
                        obj[mappedValue] = obj[field]
                        delete obj[field]
                        }
                    } })
                   });
                delete fieldData.codeList
                fieldData = Object.assign({path: x.path, picklistValues: listData}, fieldData)
            }
            // more special handling for links/relations
            else if (allObjects[parentPath].codeList.hasOwnProperty('links') === true){
                fieldData = allObjects[parentPath]
                delete fieldData.codeList
                fieldData = Object.assign({path: x.path}, fieldData)
            }
       }
       //generic handling in case codeValue exists but no other props do. 
       else {
           fieldData = allObjects[parentPath]
           fieldData.path = x.path
       }
        let out = JSON.stringify(fieldData)
    }
    //Generic handling in case codeValue does not exist
    else {
        fieldData = allObjects[x.key];
        fieldData.path = x.path
    }
    //Special handling for dependencies that are not existent in codeValue properties
    if (allObjects[x.key].hasOwnProperty('dependencies') === true){
        //fieldData = allObjects[x.key]
        delete fieldData.dependencies
}
    if (allObjects[x.key].hasOwnProperty('maxAmountValue') === true){
       // fieldData = allObjects[x.key]
        delete fieldData.maxAmountValue
    }
    if (allObjects[x.key].hasOwnProperty('minAmountValue') === true){
        //fieldData = allObjects[x.key]
        delete fieldData.minAmountValue
    }
    if (allObjects[x.key].hasOwnProperty('sequence') === true){
       // fieldData = allObjects[x.key]
        delete fieldData.sequence
    }
    //return resulting field Object data

    //Map the fields to CE names
    Object.keys(fieldData).map(field => {
        if(fieldMappings.hasOwnProperty(field)){
        let mappedValue = fieldMappings[field]
            if (field !== fieldMappings[field]){
            fieldData[mappedValue] = fieldData[field]
            delete fieldData[field]
            }
        } });

    //delete fieldData["pickListValues"]
    //delete fieldData["references"]
    delete fieldData["relations"]
    if (!fieldData["vendorPath"] || fieldData["vendorPath"] === null){
        console.log(x)
        fieldData["vendorPath"] = "unable to set path"
    }
    fieldData.vendorRequired = !fieldData.vendorRequired
    return fieldData
}
 
//kick off hydrator to populate paths with metadata
let finalResult = findAllPaths.map(hydrator)

// THIS ONE FAILS BC Dont have all fields in all objects
//const transformed = finalResult.map(({hidden, maxLength, minLength, optional, pattern, readOnly, shortLabelName, path, dependencies, maxItems, pickListItems, reference}) => ({hidden: hidden, length: maxLength, minLength: minLength, vendorRequired: optional, mask: pattern, readOnly: readOnly, path: path, relations: dependencies, length: maxItems, pickListItems: picklistItems, reference: reference}));
//console.log(transformed)

console.log(JSON.stringify({fields: finalResult}))

//mappedFinalResult = finalResult.fields.reduce(mapper5000);

//console.log(JSON.stringify(mappedFinalResult))