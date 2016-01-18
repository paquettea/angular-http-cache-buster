//This directive is an example that gets compiled within the test, to see how the interceptor will react when fetching
//the templateUrl
angular.module('paquettea.http-cache-buster').directive('mock', function (){
    return {
        restrict:'AE',
        templateUrl: templateUrl
    }
});
