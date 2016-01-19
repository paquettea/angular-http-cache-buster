angular.module('paquettea.http-cache-buster').provider('HttpCacheBusterInterceptor', function () {

    var provider;
    var blackListRules = [];
    var whiteListRules = [];
    var customQsParameterValue;

    function qsParameterValue(config) {
        if (config && config.useCacheBuster) {
            if (angular.isFunction(config.useCacheBuster)) {
                return config.useCacheBuster();
            } else if (config.useCacheBuster !== true) {
                return config.useCacheBuster;
            }
        }

        if (customQsParameterValue) {
            return customQsParameterValue();
        }

        return new Date().getTime();
    }

    function hasMatch(list, url) {
        var i = 0;

        while (i < list.length) {
            if (url.match(list[i]) !== null) {
                return true;
            }
            i++;
        }

        return false;
    }

    function addCacheBusterToUrl(config) {
        return config.url +
            (config.url.indexOf('?') === -1 ? '?' : '&') +
            provider.qsParameterName + '=' + qsParameterValue(config);
    }

    provider = {
        affectTemplate: false,
        qsParameterName: 'cb',
        pushToBlackList: function (regexpRule) {
            if (regexpRule.constructor !== RegExp) {
                throw new Error('expected a regular expression');
            }

            blackListRules.push(regexpRule);
        },
        pushToWhiteList: function (regexpRule) {
            if (regexpRule.constructor !== RegExp) {
                throw new Error('expected a regular expression');
            }

            whiteListRules.push(regexpRule);
        },
        setQsParameterValue: function (valueHandler) {

            //normalize calls by forcing the value to be a function
            if (angular.isFunction(valueHandler)) {
                customQsParameterValue = valueHandler;
            } else {
                customQsParameterValue = function () {
                    return valueHandler;
                };
            }
        },
        $get: function ($templateCache, $log) {

            var service;

            function isCompatibleUrl(url) {
                var isWhiteListed = !whiteListRules.length || hasMatch(whiteListRules, url);
                var isBlackListed = !!blackListRules.length && hasMatch(blackListRules, url);

                if (isWhiteListed && isBlackListed) {
                    $log.warn(url, 'was both blacklisted and whitelisted - no cache buster will be appended.');
                    return false;
                }

                return isWhiteListed && !isBlackListed;
            }

            service = {
                request: function (config) {
                    if (config.method.toUpperCase() === 'GET') {
                        if (angular.isDefined(config.useCacheBuster) && config.useCacheBuster !== false) {
                            config.url = addCacheBusterToUrl(config);
                            return config;
                        }

                        if (config.useCacheBuster === false) {
                            return config;
                        }

                        if (!provider.affectTemplate && config.cache === $templateCache) {
                            return config;
                        }



                        if (isCompatibleUrl(config.url)) {
                            config.url = addCacheBusterToUrl(config);
                        }
                    }

                    return config;
                },
                setQsParameterName: function (name) {
                    provider.qsParameterName = name;
                },
                setQsParameterValue: provider.setQsParameterValue
            };

            return service;
        }

    };

    return provider;

});
