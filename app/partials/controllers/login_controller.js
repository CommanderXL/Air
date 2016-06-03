/**
 * Created by XRene on 2015/12/1.
 */


define(['common/common_service'], function () {
    var loginModule = angular.module('loginModule', ['commonService']);

    loginModule.controller('loginCtrl', ['$rootScope', '$scope', '$state', '$_http', function ($rootScope, $scope, $state, $_http) {

        $scope.account = {
            name: '',
            val: null
        };

        $scope.loginFn = function () {
            $_http.reqPostFn('/login', $scope.account).then(function (data) {
                if(data.status === 0) {
                    $rootScope.isShow = false;
                    $state.go('index.control');
                } else {
                    alert('请输入正确的账号和密码');
                }
            }, function (data) {
                console.log(data);
            });
        }
    }]);
});

