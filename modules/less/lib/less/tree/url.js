(function (tree) {
    var path = require('path');

    /**
     * 计算图片在合并后的文件中相对路径: 先根据图片和父级css的相对路径计算出图片路径,然后计算该路径与顶级css路径的相对路径.
     * @param{String}rootPath: 顶级css路径(rootNode of .less @import Tree )
     * @param{String}imported: @import引用的css路径
     * @param{String}imgPath: @import引用的css文件中原始图片路径
     * */
    function relative(rootPath,imported,imgPath){
        //解决windows平台下path.relative带来的bug(先替换全部'\'为'/', 再去掉一个 '../' )
        return path.relative(rootPath,path.resolve(imported,'..',imgPath)).replace(/\\/g,'/').replace('../','');
    }

    tree.URL = function (val, rootpath, env) {
        this.value = val;
        this.rootpath = rootpath;

        this.env = env;
    };
    tree.URL.prototype = {
        toCSS: function () {
            return "url(" + this.value.toCSS() + ")";
        },
        eval: function (ctx) {
            var val = this.value.eval(ctx), rootpath;

            // Add the base path if the URL is relative
            if (typeof val.value === "string" && !/^(?:[a-z-]+:|\/)/.test(val.value)) {
                rootpath = this.rootpath;
                if (!val.quote) {
                    rootpath = rootpath.replace(/[\(\)'"\s]/g, function(match) { return "\\"+match; });
                }
                val.value = rootpath + val.value;
            }
            
            var config = this.env.files._config_, host;
            val.value = relative(config['_root_less_'], this.env.filename, val.value);
            return new(tree.URL)(val, this.rootpath);
        }
    };

})(require('../tree'));
