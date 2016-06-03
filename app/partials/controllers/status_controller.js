/**
 * Created by XRene on 2015/12/11.
 */

define(function () {
    var statusModule = angular.module('stateModule', ['commonService']);

    statusModule.controller('statusController', ['$scope', '$_http', function ($scope, $_http) {
        $scope.selectedItem = '1楼';

        $scope.date = {
            year: '',
            month: '',
            day: '',
            hour: '',
            minutes: '',
            seconds: '',
            today: ''
        };
        //时间初始化
        $scope.initTime = function () {
            setInterval(function () {
                $scope.$apply(function () {
                    var _date = new Date();
                    $scope.date.year = _date.getFullYear();
                    $scope.date.month = _date.getMonth() + 1;
                    $scope.date.day = _date.getDate();
                    $scope.date.hour = _date.getHours();
                    $scope.date.minutes = _date.getMinutes();
                    $scope.date.seconds = _date.getSeconds();
                    $scope.date.today = _date.getDay();
                });
            }, 1000);
        };

        $scope.initTime();

        $scope.queryData = function (item) {
            $scope.selectedItem = item;
            $_http.reqPostFn('/status', {floor: item.slice(0, 1), airType: '海信'}).then(function (data) {
                if(data.status === 0) {
                    $scope.dataList = data.data;
                }
            }, function (data) {
                console.log(data);
            })
        };

        $scope.queryData('1楼');
    }]);

    statusModule.filter('WD', function () {
        return function (input) {
            switch (input) {
                case 1:
                    return '上下风';
                case 2:
                    return '左右风';
                case 3:
                    return '上下左右风';
                case 'cold':
                    return '制冷';
                case 'hot':
                    return '制热';
                case 'on':
                    return '开';
                case 'off':
                    return '关';
                default :
                    break;
            }
        }
    });
});
