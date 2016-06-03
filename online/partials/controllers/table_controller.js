/**
 * Created by XRene on 2015/12/10.
 */

define(function () {
    var tableModule = angular.module('tableModule', ['commonService']);

    tableModule.controller('tableController', ['$scope', '$_http', '$_yaq', function ($scope, $_http, $_yaq) {

        $scope.selectedFloor = '1楼';
        $scope.showRoomList = ['101室', '103室', '105室', '108室', '109室', '112室', '114室', '116室', '117室'];
        $scope.chartIndex = {
            '总电量柱状图': 'zone',
            '趋势折线图': 'line'
        };
        $scope.selectedChart = 'zone';
        //数据模型
        $scope.list = {
            floorList: ['1楼', '2楼', '3楼', '4楼'],
            roomList: {
                '1楼': ['101室', '103室', '105室', '108室', '109室', '112室', '114室', '116室', '117室'],
                '2楼': ['205室', '207室', '209室', '211室', '213室', '215室'],
                '3楼': ['301室', '304室', '306室', '308室', '310室', '312室', '314室', '316室', '318室', '320室', '322室'],
                '4楼': ['401室', '406室', '408室', '409室', '411室', '412室', '414室', '418室', '419室', '421室']
            },
            selectFloor: function (val) {
                $scope.selectedFloor = val;
                $scope.selectedRoom = null;
                $scope.showRoomList = $scope.list.roomList[val];
            },
            selectRoom: function (val) {
                $scope.selectedRoom = val;
            },
            selectChart: function(val) {
                $scope.selectedChart = val;
            }
        };
        //时间模型
        $scope.date = {
            from: $_yaq.timeToInit($_yaq.selectTimeFn(3)[0]),
            to: $_yaq.timeToInit($_yaq.selectTimeFn(3)[1])
        }

        $scope.results = null;

        $scope.query = function () {
            var fromTime = $_yaq.initToTime($scope.date.from),
                toTime = $_yaq.initToTime($scope.date.to);
            if(toTime < fromTime) {
                alert('请重新选择时间');
                $scope.date.from = '';
                $scope.date.to = '';
                return;
            }
            var _param = {
                airType: '海信',
                floor: $scope.selectedFloor.slice(0, 1),
                from: $_yaq.timeToInit(fromTime),
                to: $_yaq.timeToInit(toTime),
                chartIndex: $scope.selectedChart
            }
            $scope.selectedRoom ? _param.room = $scope.selectedRoom : _param.room = '';

            $_http.reqPostFn('/table', _param).then(function (data) {
                if(data.status === 0) {
                    $scope.dataList = data.data.dataStatus;
                    $scope.results = data.data.power;
                }
            }, function (data) {
                console.log(data);
            })
        }

        $scope.query();
    }]);


    tableModule.filter('WD', function () {
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

