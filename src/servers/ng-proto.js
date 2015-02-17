var path = require("path")
    ,express = require('express')
    ,BodyParser = require('body-parser')
    ,jsonParser = BodyParser.json()
    ,publicPath = path.join(__dirname,"..","..","public")
;

var setAppMethods = function(app){

    app.get('/', function (req, res) {
        console.log("homepage",path.join(publicPath,"index.html"));
        res.sendFile(path.join(publicPath,"index.html"));
    });

    app.get('/:pagename', function (req, res) {
        console.log("pagename",path.join(publicPath,req.params.pagename));
        res.sendFile(path.join(publicPath,req.params.pagename));
    });

    app.get('/css/:filename', function (req, res) {
        console.log("css",path.join(publicPath,"css",req.params.filename));
        res.sendFile(path.join(publicPath,"css",req.params.filename));
    });

    app.get('/js/:filename', function (req, res) {
        console.log("js",path.join(publicPath,"js",req.params.filename));
        res.sendFile(path.join(publicPath,"js",req.params.filename));
    });

    app.get('/templ/:templname', function (req, res) {
        console.log("templ",path.join(publicPath,"templ",req.params.templname));
        res.sendFile(path.join(publicPath,"templ",req.params.templname));
    });

    app.get('/api/:methodname', function (req, res) {
        console.log("api",path.join(publicPath,"mocks",req.params.methodname));
        res.sendFile(path.join(publicPath,"mocks",req.params.methodname));
    });

    app.get('/api/:classname/:methodname', function (req, res) {
        console.log("api",path.join(publicPath,"mocks",req.params.classname,req.params.methodname));
        res.sendFile(path.join(publicPath,"mocks",req.params.classname,req.params.methodname));
    });

};

var NgProto = function(port){
    this.app = express();
    this.port = port;
    setAppMethods(this.app);
    this.start();
};

NgProto.prototype.start = function(port){
    this.port = port || this.port;
    if (!this.port) return false;
    var _self = this;
    this.server = this.app.listen(this.port, function () {
        console.log('NgProto Server listening at http://%s:%s', this.server.address().address, this.server.address().port)
    }.bind(this))
};

module.exports = NgProto;