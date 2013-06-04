# Angular CheatSheet

## module

- requires
- name 
- provider
- factory
- service
- value
- constant 
- animation
- filter
- controller
- directive
- config

## Angular namespace

'bootstrap': bootstrap,
'copy': copy,
'extend': extend,
'equals': equals,
'element': jqLite,
'forEach': forEach,
'injector': createInjector,
'noop':noop,
'bind':bind,
'toJson': toJson,
'fromJson': fromJson,
'identity':identity,
'isUndefined': isUndefined,
'isDefined': isDefined,
'isString': isString,
'isFunction': isFunction,
'isObject': isObject,
'isNumber': isNumber,
'isElement': isElement,
'isArray': isArray,
'version': version,
'isDate': isDate,
'lowercase': lowercase,
'uppercase': uppercase,
'callbacks': {counter: 0},
'noConflict': noConflict

## NG directives

ngBind: ngBindDirective,
ngBindHtmlUnsafe: ngBindHtmlUnsafeDirective,
ngBindTemplate: ngBindTemplateDirective,
ngClass: ngClassDirective,
ngClassEven: ngClassEvenDirective,
ngClassOdd: ngClassOddDirective,
ngCsp: ngCspDirective,
ngCloak: ngCloakDirective,
ngController: ngControllerDirective,
ngForm: ngFormDirective,
ngHide: ngHideDirective,
ngInclude: ngIncludeDirective,
ngInit: ngInitDirective,
ngNonBindable: ngNonBindableDirective,
ngPluralize: ngPluralizeDirective,
ngRepeat: ngRepeatDirective,
ngShow: ngShowDirective,
ngSubmit: ngSubmitDirective,
ngStyle: ngStyleDirective,
ngSwitch: ngSwitchDirective,
ngSwitchWhen: ngSwitchWhenDirective,
ngSwitchDefault: ngSwitchDefaultDirective,
ngOptions: ngOptionsDirective,
ngView: ngViewDirective,
ngTransclude: ngTranscludeDirective,
ngModel: ngModelDirective,
ngList: ngListDirective,
ngChange: ngChangeDirective,
required: requiredDirective,
ngRequired: requiredDirective,
ngValue: ngValueDirective

ngHref
ngSrc
ngInit


## Providers

$anchorScroll: $AnchorScrollProvider,
$animation: $AnimationProvider,
$animator: $AnimatorProvider,
$browser: $BrowserProvider,
$cacheFactory: $CacheFactoryProvider,
$controller: $ControllerProvider,
$document: $DocumentProvider,
$exceptionHandler: $ExceptionHandlerProvider,
$filter: $FilterProvider,
$interpolate: $InterpolateProvider,
$http: $HttpProvider,
$httpBackend: $HttpBackendProvider,
$location: $LocationProvider,
$log: $LogProvider,
$parse: $ParseProvider,
$route: $RouteProvider,
$routeParams: $RouteParamsProvider,
$rootScope: $RootScopeProvider,
$q: $QProvider,
$sniffer: $SnifferProvider,
$templateCache: $TemplateCacheProvider,
$timeout: $TimeoutProvider,
$window: $WindowProvider

## Animations

- <div ng-directive ng-animate="{enter: 'animate-enter'}"></div>
-  * .animate-enter-setup {
 *  -webkit-transition: 1s linear all; /&#42; Safari/Chrome &#42;/
 *  -moz-transition: 1s linear all; /&#42; Firefox &#42;/
 *  -ms-transition: 1s linear all; /&#42; IE10 &#42;/
 *  -o-transition: 1s linear all; /&#42; Opera &#42;/
 *  transition: 1s linear all; /&#42; Future Browsers &#42;/
 *
 *  /&#42; The animation preparation code &#42;/
 *  opacity: 0;
 * }
- .animate-enter-setup.animate-enter-start {
 *  /&#42; The animation code itself &#42;/
 *  opacity: 1;
 * }

-> TRANSLATED3D to force 3d acceleration !!!!!!!!!!!!!!!!!!!!!!!!!!!1


## Promise $q

 *   function asyncGreet(name) {
 *     var deferred = $q.defer();
 *
 *     setTimeout(function() {
 *       // since this fn executes async in a future turn of the event loop, we need to wrap
 *       // our code into an $apply call so that the model changes are properly observed.
 *       scope.$apply(function() {
 *         if (okToGreet(name)) {
 *           deferred.resolve('Hello, ' + name + '!');
 *         } else {
 *           deferred.reject('Greeting ' + name + ' is not allowed.');
 *         }
 *       });
 *     }, 1000);
 *
 *     return deferred.promise;
 *   }
 *
 *   var promise = asyncGreet('Robin Hood');
 *   promise.then(function(greeting) {
 *     alert('Success: ' + greeting);
 *   }, function(reason) {
 *     alert('Failed: ' + reason);
 *   });

 ## Form 

- myForm.myInput.$valid = true
- myForm.myInput.$error = {"required":false}
- myForm.$valid = true
- myForm.$error.required = false


# 