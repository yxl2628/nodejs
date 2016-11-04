var fs = require('fs');
var util = require('util');

var csParentPath = 'E:\\yang.xiaolong\\work\\cs\\';
var csResultFile = 'E:\\cs-result.json';

var pmsParentPath = 'E:\\yang.xiaolong\\work\\pms\\pc\\src\\js\\';
var pmsResultFile = 'E:\\pms-result.json';
var isFirestInit = false;

main(csResultFile,csParentPath,'.html');
// main(pmsResultFile,pmsParentPath,'.js');

//主函数入口
function main(resultFile,path,tag){
	//写入前清除文件
	if(!isFirestInit){
		console.log('写入前清除文件['+resultFile+']');
		fs.writeFileSync(resultFile, '');
		isFirestInit = true;
	}
	//循环读取文件及目录
	readDir(path,function(dirPath,files){
		if(util.isArray(files)){
			files.forEach(function(f){
				isExistsFile(dirPath,f,function(dirPath,fileName){
					statFile(dirPath,fileName,function(dirPath,fileName,stats){
						if(stats.isFile()&&fileName.lastIndexOf(tag)>0){
							//是文件并且为html
							// console.log('读取文件['+fileName+']....');
							readFile(dirPath,fileName,function(fileName,result){
								writeResult(resultFile,fileName,result);
							});
						}else if(stats.isDirectory()){
							//是文件夹,重复读取
							main(resultFile,dirPath + '\\' + fileName,tag);
						}
					});
				});
			});
		}
	});
}

//输出结果
function writeResult(resultFile,fileName,result){
	var text = '{name:"'+fileName+'",value:['+result+']}~~~';
	// var text = fileName+'('+result.length+'个接口):'+'\n';
	// console.log(result);
	// result.forEach(function(r){
	// 	text += '\t-->'+r+'\n';
	// });
	fs.appendFile(resultFile, text,  function(err) {
		console.log('写入文件['+fileName+']:'+result);
		if (err) {
	       return console.error(err);
	   }
	});
}

//读取目录
function readDir(dirPath,cb){
	// console.log('读取目录['+dirPath+']....');
	return fs.readdir(dirPath,function(err,files){
		cb && cb(dirPath,files);
	});
}

//判断文件是否存在
function isExistsFile(dirPath,fileName,cb){
	fs.exists(dirPath+'\\'+fileName, function(res){
		if(res){
			cb && cb(dirPath,fileName);
		}
	});
}

//获取文件信息
function statFile(dirPath,fileName,cb){
	fs.stat(dirPath+'\\'+fileName, function (err, stats) {
		cb && cb(dirPath,fileName,stats);
	});
}

//读取文件
function readFile(dirPath,fileName,cb){
	var buf = new Buffer(1024*1024);
	fs.open(dirPath+'\\'+fileName,'r',function(err,fd){
		if(err){
			return console.error(err);
		}
		//读取文件
		fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
			if(bytes > 0){
	        	var html = buf.slice(0, bytes).toString();
	        	var result = html.match(/'(\S)*\.do'/g);
	        	if(result!=null){
	        		//console.log('匹配结果:'+result);
	        		cb && cb(fileName,result);
	        	}
	      	}
	      	fs.close(fd, function(err){
	      		if(err){
					return console.error(err);
				}
	      	});
		});
	});
}