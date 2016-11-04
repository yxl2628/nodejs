var md5 = require('md5');
var CryptoJS  = require('crypto-js');
var Base64 = require('base-64');
var DES_POSITIVE_KEY = "DFB3.0123";
var KEY_GEN_ROLES = "2,0,1,3,0,7,0,5";
var url = 'http://115.28.223.139:8088';
var param = 'interface_version=3.5.2&app_key=zzzzzzzzzzzzzzzzz&base_info=motorola_MotoXPro_shamu_retcn_shamu_t-5.0.2-89860315760103122719_355464060278735-301-false&app_version=3.5.2&access_token=&time_token=1477985419202&user_latlon=39.996091,116.48154';
var time_token = '1477985419202';

handleParam(url,param,time_token);

function handleParam(_url,_param,_time_token){
	var clearTextURL = _url+'?'+_param
	//生成变动密钥部分
	var desChangeKeyStr = createAppKey(clearTextURL,_time_token);
	//生成真实变动密钥
	var realDESChangeKeyStr = getReallyAppKey(desChangeKeyStr);
	//真实密钥 = 固定密钥 + 真实变动密钥
	var realKeyStr = DES_POSITIVE_KEY + realDESChangeKeyStr;
	// 生成加密串sig = 真实密钥加密明文URL
	var sig = encryptByDES(clearTextURL,realKeyStr);
	// 生成加密串k = 固定密钥加密变动密钥
	var k = encryptByDES(desChangeKeyStr,DES_POSITIVE_KEY);
	//生成签名sign
	var sign = generateSignature(_param,k,realKeyStr);

	var encodeSig = Base64.encode(sig);
    var encodeK = Base64.encode(k);
    var encodeSign = Base64.encode(sign);

    var returnValue = {
    	'sig':encodeSig,
    	'k':encodeK,
    	'sign':encodeSign
    };

    console.log(returnValue);

    return returnValue;
}
//获取byte数组
function getBytes(_str){
	var bytes = [];
    for(var i=0;i<_str.length;i++){
		bytes[i] = _str.charCodeAt(i);
	}
	return bytes;
}
//生成变动密钥部分
function createAppKey(_clearTextURL,_time_token){
	var keySource = _clearTextURL+_time_token;
	return md5(getBytes(keySource)).substring(8, 24);
}
// 生成真实变动密钥
function getReallyAppKey(_desChangeKeyStr){
	var key = '';
	var keyArray = KEY_GEN_ROLES.split(',');
	for(var i=0;i<keyArray.length;i++){
		key += _desChangeKeyStr.charAt(keyArray[i]);
	}
	return key;
}
//DES加密
function encryptByDES(message, key) {  
    // For the key, when you pass a string,  
    // it's treated as a passphrase and used to derive an actual key and IV.  
    // Or you can pass a WordArray that represents the actual key.  
    // If you pass the actual key, you must also pass the actual IV.  
    var keyHex = CryptoJS.enc.Utf8.parse(key);  
    //console.log(CryptoJS.enc.Utf8.stringify(keyHex), CryptoJS.enc.Hex.stringify(keyHex));  
    //console.log(CryptoJS.enc.Hex.parse(CryptoJS.enc.Utf8.parse(key).toString(CryptoJS.enc.Hex)));  
   
    // CryptoJS use CBC as the default mode, and Pkcs7 as the default padding scheme  
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {  
        mode: CryptoJS.mode.ECB,  
        padding: CryptoJS.pad.Pkcs7  
    });  
    return encrypted.toString();  
}
//签名算法
/**
 * 对形如param1=value1&param2=value2&param3=value3...的键值对
 * 1.拆分成键值对数组，按照参数名字典排序，同时去除值为空的键值对
 * 2.按照新的顺序重新组合成param1=value1&param2=value2&param3=value3...的形式
 * 4.新的键值对字符串拼接上密文key，然后MD5加密并转换成大写
 * 5.使用DES真实秘钥加密生成签名
 *
 * @param clearText    键值对明文
 * @param key          固定秘钥加密变动秘钥得到的密文
 * @param reallyAppKey 真实秘钥
 */
function generateSignature(_clearText, _key, _reallyAppKey){
	// 签名
    var signature = '';
    if(_reallyAppKey){
    	if(_clearText){
    		var paramValues = _clearText.split('&');
    		var trueParamValues = new Array();
    		for(var i=0;i<paramValues.length;i++){
    			if(paramValues[i]&&paramValues[i].indexOf('='>0)){
    				var param = paramValues[i].substring(0,paramValues[i].indexOf('='));
    				var value = '';
    				if(paramValues[i].indexOf('=')<paramValues[i].length-1){
    					value = paramValues[i].substring(paramValues[i].indexOf('=')+1);
    				}
    				if(param&&value){
    					trueParamValues.push(param+'='+value);
    				}
    			}
    		}
    		trueParamValues.sort();
    		var sortedParamValues = '';
    		for(var j=0;j<trueParamValues.length;j++){
    			sortedParamValues+=trueParamValues[j]+'&';
    		}
    		sortedParamValues += 'key='+_key;
    		var sortedMd5Upcase = md5(getBytes(sortedParamValues)).toUpperCase();
    		signature = encryptByDES(sortedMd5Upcase,_reallyAppKey);
    	}else{
			var sortedMd5Upcase = md5(getBytes(_key)).toUpperCase();
    		signature = encryptByDES(sortedMd5Upcase,_reallyAppKey);
    	}
    }
    return signature;
}