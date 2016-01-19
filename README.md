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

If you don't want this behavior, you may set ```HttpCacheBusterInterceptorProvider.affectTemplate = true```. It will ignore the request config module and always proceed to the white/black list rules check.

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

All configurations are done on the provider: ```HttpCacheBusterInterceptor```


### pushToWhiteList(RegExp)
TODO

### pushToBlackList(RegExp)
TODO

### setQsParameterValue(function|value)
TODO

### qsParameterName
TODO