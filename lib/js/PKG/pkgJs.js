var fs = require('fs');
var path = require('path');
var format = require('./format');
var combine = require('./combine');
var writeFile = require('../../tools/writeFile');
var log = require('../../tools/log');

module.exports = function(fromDir, toDir, jsList,conf){
	var jsMap = {}, ret = {};
	//获取缓存的文件列表
	log.info('read all js source code......');
	jsList.forEach(function(uri){
		jsMap[uri] = fs.readFileSync(uri,'utf-8');
	});
	
	
	(function(){
		//对内容进行格式化
		for(var k in jsMap){
			conf.file = k;
			jsMap[k] = format(jsMap[k], conf);
			log.info('> compress ' + k + ' Done.');
		}
	})();
	
	errorReport();
	
	(function(){
		//对内容进行合并
		for(var k in jsMap){
			ret[k] = combine(k,jsMap[k], jsMap,conf);
			log.info('> combine ' + k + ' Done');
		}
		jsMap = null;
	})();
	
	errorReport();
	warningReport();
	
	(function(){
		//进行写文件操作
		for(var k in ret){
			//u为目标文件绝对路径
			var u = k.replace(fromDir, toDir);
			writeFile(ret[k], u,k);
		}
		ret = null;
	})();
	
	log.info('\n > All javascripts merged!!!!!!\n');

	function errorReport(){
		var errs = log.getError();
		if(errs.length > 0){
			for(var i = 0, len = errs.length; i < len; i += 1){
				log.errorInfo(errs[i]);
			}
			errs = [];
			log.errorInfo(fromDir + ' pkg Error!');
			throw fromDir + ' pkg Error!';
		}
	};
	function warningReport(){
		//处理报错
		var warnings = log.getWarning();
		for(var i = 0, len = warnings.length; i < len; i += 1){
			log.warningInfo(warnings[i]);
		}
		warnings = null;
	};
};