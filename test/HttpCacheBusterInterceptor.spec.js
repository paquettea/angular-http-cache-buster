'use strict';

var injections = ['$http', '$httpBackend', '$templateCache', 'HttpCacheBusterInterceptor', '$compile', '$rootScope',
                  '$window', '$cacheFactory'];
var genericUrl = '/some/path.xml';
var templateUrl = '/this/is/a/template/file.html';
var cbValue = 10;
var cbName = 'cb';

function initModules(be) {
    be(module('paquettea.http-cache-buster'));
    be(module('ngMock'));
}

function getDefaultInjects(be) {
    var output = {};
    var injectCall = injections.slice(0);

    injectCall.push(
        function () {
            var services = [].slice.call(arguments);
            var i;

            for (i = 0; i < injections.length; i++) {
                output[injections[i]] = services[i];
            }
        }
    );

    be(inject(injectCall));

    return output;
}

describe('HttpCacheBusterInterceptor', function () {

    describe('using default configuration', function () {
        var s;

        initModules(beforeEach, module);

        s = getDefaultInjects(beforeEach);

        afterEach(function () {
            s.$httpBackend.verifyNoOutstandingExpectation();
            s.$httpBackend.verifyNoOutstandingRequest();
        });

        it('should NOT add cache buster for POST requests', function () {
            s.$httpBackend.expectPOST(genericUrl).respond(200);
            s.$http.post(genericUrl);
            s.$httpBackend.flush();
        });
        it('should NOT add cache buster for PUT requests', function () {
            s.$httpBackend.expectPUT(genericUrl).respond(200);
            s.$http.put(genericUrl);
            s.$httpBackend.flush();
        });
        it('should NOT add cache buster for PATCH requests', function () {
            s.$httpBackend.expectPATCH(genericUrl).respond(200);
            s.$http.patch(genericUrl);
            s.$httpBackend.flush();
        });

        it('should NOT add cache buster for DELETE requests', function () {
            s.$httpBackend.expectDELETE(genericUrl).respond(200);
            s.$http.delete(genericUrl);
            s.$httpBackend.flush();
        });

        it('should add cache buster for get requests using question mark for url without query string', function () {
            s.$httpBackend.expectGET(/theUrl\?cb\=[0-9]+$/).respond(200);
            s.$http.get('theUrl');
            s.$httpBackend.flush();
        });

        it('should add cache buster for get requests using ampersand for url with a query string', function () {
            s.$httpBackend.expectGET(/theUrl\?wut=somevalue\&cb\=[0-9]+$/).respond(200);
            s.$http.get('theUrl?wut=somevalue');
            s.$httpBackend.flush();
        });

        it('should add custom cache buster for get requests that have useCacheBuster custom value in their configuration', function () {

            var customCbValue = 989898;

            s.$httpBackend.expectGET('theUrl?cb=' + customCbValue).respond(200);

            s.$http({
                useCacheBuster: customCbValue,
                method: 'GET',
                cache: true,
                url: 'theUrl'
            });

            s.$http({
                useCacheBuster: function () {
                    return customCbValue;
                },
                method: 'GET',
                cache: true,
                url: 'theUrl'
            });

            s.$httpBackend.flush();
        });

        it('should add cache buster for get requests that have useCacheBuster to true in their configuration', function () {
            s.$httpBackend.expectGET(/theUrl\?cb\=[0-9]+$/).respond(200);

            s.$http({
                useCacheBuster: true,
                method: 'GET',
                cache: true,
                url: 'theUrl'
            });

            s.$httpBackend.flush();
        });

        it('should NOT add cache buster for get requests that have useCacheBuster to FALSE in their configuration', function () {
            s.$httpBackend.expectGET('theUrl').respond(200);

            s.$http({
                useCacheBuster: false,
                method: 'GET',
                cache: true,
                url: 'theUrl'
            });

            s.$httpBackend.flush();
        });
    });

    describe('using affectTemplate to TRUE', function () {
        var s;

        initModules(beforeEach, module);

        beforeEach(function () {
            module(function (_HttpCacheBusterInterceptorProvider_) {
                _HttpCacheBusterInterceptorProvider_.qsParameterName = cbName;
                _HttpCacheBusterInterceptorProvider_.setQsParameterValue(cbValue);
                _HttpCacheBusterInterceptorProvider_.affectTemplate = true;

            });
        });

        s = getDefaultInjects(beforeEach);

        it('should add cache buster to templateUrl', function () {
            s.$templateCache.remove(templateUrl);
            s.$httpBackend.expectGET(templateUrl + '?' + cbName + '=' + cbValue).respond(200);
            s.$compile('<mock></mock>')(s.$rootScope);

            s.$httpBackend.flush();
        });
    });

    describe('using affectTemplate to FALSE', function () {
        var s;

        initModules(beforeEach, module);

        beforeEach(function () {
            module(function (_HttpCacheBusterInterceptorProvider_) {
                _HttpCacheBusterInterceptorProvider_.qsParameterName = cbName;
                _HttpCacheBusterInterceptorProvider_.setQsParameterValue(cbValue);
                _HttpCacheBusterInterceptorProvider_.affectTemplate = false;

            });
        });

        s = getDefaultInjects(beforeEach);

        it('should NOT add cache buster to templateUrl', function () {

            s.$httpBackend.expectGET(templateUrl).respond(200);
            s.$compile('<mock></mock>')(s.$rootScope);
            s.$httpBackend.flush();
        });
    });

    describe('using white list', function () {
        var whiteListRules = [
            /templates.*/i,
            /.*\.html$/ig
        ];

        var whiteListedUrls = [
            '/templates/file',
            '/path/file.html'
        ];

        var notWhiteListedUrls = [
            'someRandomName',
            'html/assets/file.pdf'
        ];

        var s;

        initModules(beforeEach, module);
        beforeEach(function () {
            module(function (HttpCacheBusterInterceptorProvider) {
                HttpCacheBusterInterceptorProvider.qsParameterName = cbName;
                HttpCacheBusterInterceptorProvider.setQsParameterValue(cbValue);

                angular.forEach(whiteListRules, function (rule) {
                    HttpCacheBusterInterceptorProvider.pushToWhiteList(rule);
                });
            });
        });

        s = getDefaultInjects(beforeEach);

        it('should NOT add cache buster if NOT matched by whitelist', function () {
            angular.forEach(notWhiteListedUrls, function (url) {
                s.$httpBackend.expectGET(url).respond(200);
                s.$http.get(url);
            });

            s.$httpBackend.flush();
        });

        it('should add cache buster if matched by whitelist', function () {
            angular.forEach(whiteListedUrls, function (url) {
                s.$httpBackend.expectGET(url + '?' + cbName + '=' + cbValue).respond(200);
                s.$http.get(url);
            });

            s.$httpBackend.flush();
        });
    });

    describe('using black list', function () {
        var blackListRules = [
            /templates.*/i,
            /.*\.html$/ig
        ];

        var blackListedUrls = [
            '/templates/file',
            '/path/file.html'
        ];

        var notBlackListedUrls = [
            'someRandomName',
            'html/assets/file.pdf'
        ];

        var s;

        initModules(beforeEach, module);
        beforeEach(function () {
            module(function (HttpCacheBusterInterceptorProvider) {
                HttpCacheBusterInterceptorProvider.qsParameterName = cbName;
                HttpCacheBusterInterceptorProvider.setQsParameterValue(cbValue);

                angular.forEach(blackListRules, function (rule) {
                    HttpCacheBusterInterceptorProvider.pushToBlackList(rule);
                });
            });
        });

        s = getDefaultInjects(beforeEach);

        it('should NOT add cache buster if matched by blacklist', function () {
            angular.forEach(blackListedUrls, function (url) {
                s.$httpBackend.expectGET(url).respond(200);
                s.$http.get(url);
            });

            s.$httpBackend.flush();
        });

        it('should add cache buster if NOT matched by blacklist', function () {
            angular.forEach(notBlackListedUrls, function (url) {
                s.$httpBackend.expectGET(url + '?' + cbName + '=' + cbValue).respond(200);
                s.$http.get(url);
            });

            s.$httpBackend.flush();
        });

    });

    describe('using white and black list', function () {
        var s;

        initModules(beforeEach, module);
        beforeEach(function () {
            module(function (HttpCacheBusterInterceptorProvider) {
                HttpCacheBusterInterceptorProvider.qsParameterName = cbName;
                HttpCacheBusterInterceptorProvider.setQsParameterValue(cbValue);
                HttpCacheBusterInterceptorProvider.pushToBlackList(/both/);
                HttpCacheBusterInterceptorProvider.pushToWhiteList(/both/);

                HttpCacheBusterInterceptorProvider.pushToBlackList(/blacklisted/);
                HttpCacheBusterInterceptorProvider.pushToWhiteList(/whitelisted/);

            });
        });

        s = getDefaultInjects(beforeEach);

        it('should NOT add cache buster if matched by both whitelist and blacklist', function () {
            s.$httpBackend.expectGET('both').respond(200);
            s.$http.get('both');
            s.$httpBackend.flush();
        });

        it('should NOT add cache buster if matched by blacklist', function () {
            s.$httpBackend.expectGET('blacklisted').respond(200);
            s.$http.get('blacklisted');
        });

        it('should add cache buster if matched by whitelist', function () {
            s.$httpBackend.expectGET('whitelisted?' + cbName + '=' + cbValue).respond(200);
            s.$http.get('whitelisted');
            s.$httpBackend.flush();
        });

    });

    describe('using custom param value', function () {
        var s;

        initModules(beforeEach, module);
        s = getDefaultInjects(beforeEach);

        it('should vary cache buster parameter on each call when mode is a function returning a variable value', function (done) {

            var fileName = 'someFile';
            var fileNameRegex = new RegExp(fileName + '.*');
            var callUrl1;
            var callUrl2;

            s.HttpCacheBusterInterceptor.setQsParameterName('time');
            s.HttpCacheBusterInterceptor.setQsParameterValue(function () {
                return new Date().getMilliseconds();
            });

            s.$httpBackend.whenGET(fileNameRegex).respond(200, '');
            s.$http.get(fileName).then(function (response) {
                callUrl1 = response.config.url;
            });

            s.$httpBackend.flush();

            setTimeout(function () {
                s.$httpBackend.whenGET(fileNameRegex).respond(200, '');
                s.$http.get(fileName).then(function (response) {
                    callUrl2 = response.config.url;
                });

                s.$httpBackend.flush();

                expect(callUrl1).toBeDefined();
                expect(callUrl2).toBeDefined();

                expect(callUrl1).not.toEqual(callUrl2);

                done();
            }, 5);

        });

        it('should not vary cache buster parameter on each call when mode is set to a fixed value', function (done) {
            var fileName = 'someFile';
            var fileNameRegex = new RegExp(fileName + '.*');
            var callUrl1;
            var callUrl2;

            s.HttpCacheBusterInterceptor.setQsParameterName('time');
            s.HttpCacheBusterInterceptor.setQsParameterValue(function () {
                return 15;
            });

            s.$httpBackend.whenGET(fileNameRegex).respond(200, '');
            s.$http.get(fileName).then(function (response) {
                callUrl1 = response.config.url;
            });

            s.$httpBackend.flush();

            setTimeout(function () {
                s.$httpBackend.whenGET(fileNameRegex).respond(200, '');
                s.$http.get(fileName).then(function (response) {
                    callUrl2 = response.config.url;
                });

                s.$httpBackend.flush();

                expect(callUrl1).toBeDefined();
                expect(callUrl2).toBeDefined();

                expect(callUrl1).toEqual(callUrl2);

                done();
            }, 5);
        });

    });
});
