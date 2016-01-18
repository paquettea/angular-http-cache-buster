angular.module('paquettea.http-cache-buster').config(function ($httpProvider) {
    return $httpProvider.interceptors.push('HttpCacheBusterInterceptor');
});
