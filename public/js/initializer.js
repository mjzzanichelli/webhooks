if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

var AppConfig = (function () {
    var instance;
    var settings = {
        services:{
            "getContents":"/api/getContents",
            "fetchContents":"/api/fetchContents"
        }
        ,config:"/api/config"
    };
    var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    var fsError = function(code){
        var msg = '';
        switch (code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };
        return msg;
    };

    function deepExtend(destination, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                arguments.callee(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    var setFSconfig = function(filename,content){
        errorHandler = function(e){
            console.log('Error: ' + fsError(e.code));
        }
        ;

        if (!requestFileSystem) return false;
        requestFileSystem.call(window, window.TEMPORARY,  5*1024*1024 /*5MB*/, function (fs) {
            fs.root.getFile(filename,{create:true},function(fileEntry){
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function(e) {
                        console.log('Write completed.');
                    };
                    fileWriter.onerror = function(e) {
                        console.log('Write failed: ' + e.toString());
                    };
                    var blob = new Blob([content], {type: 'text/plain'});
                    fileWriter.write(blob);
                }, errorHandler);
            },errorHandler);
        },errorHandler);
    };

    var getFSconfig = function(filename,callback){
        errorHandler = function(e){
            console.log('Error: ' + fsError(e.code));
            callback();
        }
        ;

        if (!requestFileSystem) return callback();
        requestFileSystem.call(window, window.TEMPORARY,  5*1024*1024 /*5MB*/, function (fs) {
            fs.root.getFile(filename,{create:false},function(fileEntry){
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        console.log(this.result);
                        callback(angular.fromJson(this.result))
                    };
                    reader.readAsText(file);
                },errorHandler);
            },errorHandler);
        },errorHandler);
    };

    var bootstrap = function(){
        appDOM = document.getElementById("ng-app");
        angular.element(appDOM).ready(function(){
            console.log(angular)
            angular.bootstrap(appDOM,["AppModule"]);
            //angular.element(appDOM).off("ready");
        });
    };

    var getFromConfig = function(key){
        if (key)return this[key];
        else return deepExtend({},this);
    };

    var setMethods = function(proto,config){
        proto.getService = getFromConfig.bind(config.services);
        proto.private = {
            getService: getFromConfig.bind(settings.services)
        }
    };

    var getConfig = function(){
        var instance = this;
        angular.injector(['ng']).get("$http")
            .get(settings.config)
            .success(function(config){
                setFSconfig("config",JSON.stringify(config));
                startApp.call(instance,config);
            })
            .error(function(){
                getFSconfig("config",startApp.bind(instance));
            })
        ;
        return instance
    };

    var startApp = function(config){
        setMethods(this.constructor.prototype,deepExtend(deepExtend({},settings),config));
        bootstrap();
    };

    var init = function(instance,config) {
        if (!config) return getConfig.call(instance);
        setFSconfig("config",JSON.stringify(config));
        startApp.call(instance,config);
        return instance;
    };

    var AppConfig = function(){

    };

    AppConfig.prototype.init = function(config){
        if ( !instance ) instance = init(this,config);
        return instance;
    };

    return new AppConfig();

})();

