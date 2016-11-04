var fs = require('fs');
var util = require('util');

var _parentPath = 'E:\\yang.xiaolong\\work\\pms\\pc\\src\\views\\';
var _resultFile = 'E:\\gruntFile.json';
var isFirestInit = false;

main(_resultFile,_parentPath,'.html');

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
							readFile(dirPath,fileName,function(dirPath,fileName,result){
								writeResult(resultFile,dirPath,fileName,result);
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
function writeResult(resultFile,dirPath,fileName,result){
	parentText = 'build/views/'+dirPath.substring(40,dirPath.length);
	var text = '"'+parentText+'/'+fileName+'":["build/css/main.css","build/js/base.js", "build/js/gg.js","build/js/vcvmm.js"],\n';
	
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
	        	var result = html.match(/(\S)*main\.css/g);
	        	if(result!=null){
	        		//console.log('匹配结果:'+result);
	        		cb && cb(dirPath,fileName,result);
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