var appMdl = angular.module("AppModule",[])
.constant("appServices",function(service){
    return AppConfig.getService(service);
}).config(["appServices",function(appServices){
    //routing goes here
}]).factory("AppFactory",["$http","appServices",function($http,appServices){
    //console.log(appServices());
    return {
        getContents:function(){
            return $http.get(appServices("getContents"))
        },
        fetchContents:function(){
            return $http.get(appServices("fetchContents"))
        }
    };
}]).controller("AppController",["$scope","AppFactory",function($scope,AppFactory){
    var getContents = function(factory){
        factory().success(function(data){
            console.log("success",data)
            $scope.list = data;
        }).error(function(error){
            console.log("failed",error)
        })
    }

    $scope.getContents = getContents.bind($scope,AppFactory.getContents);
    $scope.fetchContents = getContents.bind($scope,AppFactory.fetchContents);

}]).run(["$rootScope",function($rootScope){
    //console.log($rootScope)
}])
;
