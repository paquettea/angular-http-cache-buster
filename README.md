# Angular-http-cache-buster

This module adds an interceptor on $http GET requests only. Any other methods are not considered, since the browser does not cache them.

By default, all urls will receive the query string parameter ```cb=[currentMilliseconds]```

NOTE: You can systematically skip all templateUrl values using ```affectTemplate:false``` (default). When false, all requests triggered for $templateCache will not receive the cache buster, even if their url matches a white list. Explained in [details here](#skipping-templates)

## features

### Regex rules

You can decide to add a black list, a white list or both using regular expressions.

#### adding no rules

All url will receive the cache buster.

#### using white list only

As soon as you start adding regex rules to the white list, only url matching the provided rules will receive the cache buster.

#### using black list only

as soon as you start adding regex rules to the black list, all url will receive the cache buster EXCEPT for those matching the black list rules

#### using both lists

black list has precedence.
- If the url matches only the whitelist, it will have the cache buster ;
- If the url matches black list or both, cache buster will not be added ;
- If the url does not match any lists, it will not have the cache buster ;

### Skipping templates

It is a best practice to pre-cache your templates on build (using tools like gulp-angular-templatecache) to avoid
http requests going all over the place. When using such method, it's important that the templateUrl remains unchanged, otherwise the pre-caching becomes useless. Also when using this method, you might even not deploy the html files at all on your dist build, so they would not be available.

 Instead of relying on a blacklist, ```HttpCacheBusterInterceptorProvider.affectTemplate = false``` will set the interceptor to check if the request configuration cache is the instance of $templateCache. If it's the case, it will prevent the cache buster to be appended, even if the url is matching the white list.

 The reason for not using the blacklist is because vendor modules might can also have url patterns for their templates, so there is no ways to make sure that you are taking them under consideration. $templateCache on the other hand is a strong indication that the purpose of the request is to load a template.

If you don't want this behavior, you may set ```HttpCacheBusterInterceptorProvider.affectTemplate = true```. It will ignore the request cach module and always proceed to the white/black list rules check.

### Other scenarios

You can check the [tests](test/HttpCacheBusterInterceptor.spec.js) to see other scenarios.


## Installation

    bower install angular-http-cache-buster --save

include ```bower_components/dist/angular-http-cache-buster.min.js``` to your js assets.


### Dependency declaration

```javascript
    angular.module('yourApp',['paquettea.http-cache-buster']);
```

## Configuration

All configurations are done on the provider: ```HttpCacheBusterInterceptorProvider```


### affectTemplate [provider level]

If false (default), it will prevent cache buster on all url that are called to be stored in ```$templateCache```, without consideration for white list or black list rules. When set to true, the black/white list rules will also apply to those urls.

### pushToWhiteList(RegExp) [provider level]

Adds a regular expression that the url is tested against. If a match is returned, the url will get the cache buster. If not, or if also matching a blacklist rule, the cache buster is omitted. One rule per function call is added.

### pushToBlackList(RegExp) [provider level]

Adds a regular expression that the url is tested against. If a match is returned, the url won't get the cache buster, otherwise it will. One rule per function call is added.

### setQsParameterValue(function|value) [at provider and service level]
By default, it is a function returning ```new Date().getTime()```

If you assign a value, it value will remain the same on each request (can be a value representing the app version for example). If a function, it will be executed for each request and the value will be the return of the function.

### qsParameterName [at provider level] or setQsParameterName [at service level]

A String value. it will represent the key of the added query string parameter

## Override per call

Any $http configuration can override the cache buster behavior by adding the configuration ``` useCacheBuster```

 - When ```true```, the cache buster will systematically be added to the url
 - When ```function|value```, the cache buster will systematically be added tot the url using the provided function or value to generate it.

 - When ```false```, the cache buster will never be added to the url

Example from the tests:
```javascript
    $httpBackend.expectGET('theUrl').respond(200);

    $http({
        useCacheBuster: false,
        method: 'GET',
        cache: true,
        url: 'theUrl'
    });
```
```javascript
    $httpBackend.expectGET(/theUrl\?cb\=[0-9]+$/).respond(200);

    $http({
        useCacheBuster: true,
        method: 'GET',
        cache: true,
        url: 'theUrl'
    });
```
```javascript
    var customCbValue = 989898;

    $httpBackend.expectGET('theUrl?cb=' + customCbValue).respond(200);

    //using value
    $http({
        useCacheBuster: customCbValue,
        method: 'GET',
        cache: true,
        url: 'theUrl'
    });

    //using function
    $http({
        useCacheBuster: function () {
            return customCbValue;
        },
        method: 'GET',
        cache: true,
        url: 'theUrl'
    });
```
