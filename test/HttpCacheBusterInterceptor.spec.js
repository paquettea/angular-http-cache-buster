'use strict';

var injections = ['$http','$httpBackend', '$templateCache', 'HttpCacheBusterInterceptor', '$compile', '$rootScope'];
var genericUrl = '/some/path.xml';
var templateUrl = '/this/is/a/template/file.html';


function getDefaultInjects(be){
    var output = {};
    var injectCall = injections.slice(0)

    injectCall.push(
        function (){

            var services = [].slice.call(arguments);
            var i = 0;

            for (i = 0 ; i < injections.length ; i++){
                output[injections[i]] = services[i];
            }
        }
    );

    be(inject(injectCall));

    return output;
}

describe('HttpCacheBusterInterceptor', function () {


    describe('using default configuration',function (){
        var s;

        beforeEach(module('paquettea.http-cache-buster'));
        beforeEach(module('ngMock'));

        s = getDefaultInjects(beforeEach);

        afterEach(function() {
            s.$httpBackend.verifyNoOutstandingExpectation();
            s.$httpBackend.verifyNoOutstandingRequest();
        });

        it('should NOT add cache buster for POST requests', function () {
            s.$httpBackend.expectPOST(genericUrl).respond(200);
            s.$http.post(genericUrl);
            s.$httpBackend.flush();
        });
        it('should NOT add cache buster for PUT requests', function (){
            s.$httpBackend.expectPUT(genericUrl).respond(200);
            s.$http.put(genericUrl);
            s.$httpBackend.flush();
        });
        it('should NOT add cache buster for PATCH requests', function (){
            s.$httpBackend.expectPATCH(genericUrl).respond(200);
            s.$http.patch(genericUrl);
            s.$httpBackend.flush();
        });

        it('should NOT add cache buster for DELETE requests', function () {
            s.$httpBackend.expectDELETE(genericUrl).respond(200);
            s.$http.delete(genericUrl);
            s.$httpBackend.flush();
        });
    });


    describe('using affectTemplate to TRUE', function (){
        var s;
        var cbValue = 10;
        var cbName = 'cb';


        beforeEach(module('paquettea.http-cache-buster'));

        beforeEach(module('ngMock'));
        beforeEach(function() {
            module(function (_HttpCacheBusterInterceptorProvider_) {
                _HttpCacheBusterInterceptorProvider_.qsParameterName = cbName;
                _HttpCacheBusterInterceptorProvider_.setQsParameterValue(cbValue);
                _HttpCacheBusterInterceptorProvider_.affectTemplate = true;

            });
        });

        s = getDefaultInjects(beforeEach);


        it('should add cache buster to templateUrl', function (){
            s.$templateCache.remove(templateUrl);
            s.$httpBackend.expectGET(templateUrl + '?cb=' + cbValue).respond(200);
            s.$compile('<mock></mock>')(s.$rootScope);

            s.$httpBackend.flush();
        });
    });

    describe('using affectTemplate to FALSE', function (){
        var s;
        var cbValue = 10;
        var cbName = 'cb';


        beforeEach(module('paquettea.http-cache-buster'));
        beforeEach(module('ngMock'));

        beforeEach(function() {
            module(function (_HttpCacheBusterInterceptorProvider_) {
                _HttpCacheBusterInterceptorProvider_.qsParameterName = cbName;
                _HttpCacheBusterInterceptorProvider_.setQsParameterValue(cbValue);
                _HttpCacheBusterInterceptorProvider_.affectTemplate = false;

            });
        });

        s = getDefaultInjects(beforeEach);

        it('should NOT add cache buster to templateUrl', function (){

            s.$httpBackend.expectGET(templateUrl).respond(200);
            s.$compile('<mock></mock>')(s.$rootScope);
            s.$httpBackend.flush();
        });
    });



    it('should add cache buster if matched by whitelist');
    it('should NOT add cache buster if NOT matched by whitelist');

    it('should NOT add cache buster if matched by blacklist');
    it('should add cache buster if NOT matched by blacklist');

    it('should NOT add cache buster if matched by both whitelist and blacklist');

    it('should vary cache buster parameter on each call when mode is a function returning a variable value');
    it('should not vary cache buster parameter on each call when mode is set to a fixed value');

});
