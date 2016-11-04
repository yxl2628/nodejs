var fs = require('fs');

var csJsonFile = 'E:\\cs-result.json';
var pmsJsonFile = 'E:\\pms-result.json';

var csResultFile = 'E:\\cs-result.txt';
var pmsResultFile = 'E:\\pms-result.txt';

main(csResultFile,csJsonFile);
main(pmsResultFile,pmsJsonFile);

//主函数入口
function main(resultFilePath,jsonFilePath){
	writeFile(resultFilePath,sort(readFile(jsonFilePath)));
}

//排序
function sort(resultJsonArray){
	resultJsonArray.sort(function(a,b){
		a = eval("(" + a + ")");
		b = eval("(" + b + ")");
		return b.value.length - a.value.length;
	});
	return resultJsonArray;
}

//读取文件
function readFile(fliePath){
	var fileText = fs.readFileSync(fliePath).toString();
	return fileText.substring(0,fileText.length-3).split("~~~");
}

//写入文件
function writeFile(filePath,resultJsonArray){
	var content = '';
	resultJsonArray.forEach(function(r){
		r = eval("(" + r + ")");
		content += r.name+'('+r.value.length+'个接口):'+'\n';
		r.value.forEach(function(rv){
			content += '\t-->'+rv+'\n';
		});
	});
	fs.writeFileSync(filePath, content);
}