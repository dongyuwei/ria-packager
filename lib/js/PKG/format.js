//  sudo npm install -g uglify-js@1
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;
var log = require('../../tools/log');

var formated = '';
var format = function(code,conf){
	try{
		var ast = jsp.parse(code);
		if(conf.beautify){
			formated = pro.gen_code(ast,{'beautify':true});
		}else{
			ast = pro.ast_mangle(ast);
			ast = pro.ast_squeeze(ast,{
				make_seqs   : false,
		        dead_code   : true,
		        no_warnings : false,
		        keep_comps  : true
			});
			formated = pro.gen_code(ast);
		}
	}catch(e){
		log.info("Error in " + conf.file + " " + e.message);
		throw e;
	}
	
	ast = null;
	//文件末尾加换行符,使合并后的文件看起来结构更清晰
	return  formated + ';\n';
};

module.exports = format;