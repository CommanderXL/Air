/**
 * Created by XRene on 2015/12/4.
 */
/**
 * Created by XRene on 2015/12/2.
 */

define(function () {
    var timeModule = angular.module('timeModule', ['commonService']);

    timeModule.controller('timeCtrl', ['$rootScope', '$scope', '$_http', '$_yaq',function ($rootScope, $scope, $_http, $_yaq) {
        $scope.selectedAir = '海信';
        $scope.airList = {
            '海信': 1,
            '格力': 2
        };
        $scope.selectAir = function (key, val) {
            $scope.selectedAir = key;
        }

        $scope.selectedTemperature = 18;
        $scope.selectedWS = '一级';
        $scope.selectedWSValue = 1;
        $scope.selectedWD = '上下风';
        $scope.selectedWDValue = 1;
        $scope.selectedPattern = '制冷';
        $scope.selectedPatternValue = 'cold';
        $scope.fixedWeekday = 0;
        //$scope.fixedTimeNum = [null, null, null, null, null, null, null];
        //数据模型
        $scope.list = {
            nowItem: [false, false, false, false, false, false],
            openItem: function (index) {
                $scope.list.nowItem[index] = !$scope.list.nowItem[index];
            },
            temperatureList: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            selectT: function (val) {
                $scope.selectedTemperature = val;
                console.log($scope.selectedTemperature);
            },
            WSList: {
                '一级': 1,
                '二级': 2,
                '三级': 3,
                '四级': 4
            },
            selectWS: function (key, val) {
                $scope.selectedWS = key;
                $scope.selectedWSValue = val;
            },
            WDList: {
                '上下风': 1,
                '左右风': 2,
                '上下左右风': 3
            },
            selectWD: function (key, val) {
                $scope.selectedWD = key;
                $scope.selectedWDValue = val;
            },
            patternList: {
                '制冷': 'cold',
                '制热': 'hot'
            },
            selectPattern: function (key, val) {
                $scope.selectedPattern = key;
                $scope.selectedPatternValue = val;
            },
            weekdayList: {
                周一: 0,
                周二: 1,
                周三: 2,
                周四: 3,
                周五: 4,
                周六: 5,
                周日: 6
            },
            selectFixedWeekday: function (val) {
                $scope.fixedWeekday = val;
            },
            timeList: {
                '0': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                },
                '1': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                },
                '2': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                },
                '3': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                },
                '4': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                },
                '5': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                },
                '6': {
                    '08:00 - 10:00': 0,
                    '10:00 - 12:00': 1,
                    '13:30 - 15:30': 2,
                    '15:30 - 17:30': 3,
                    '19:00 - 21:00': 4
                }
            },
            timeSelectedList: {
                '0': [false, false, false, false, false],
                '1': [false, false, false, false, false],
                '2': [false, false, false, false, false],
                '3': [false, false, false, false, false],
                '4': [false, false, false, false, false],
                '5': [false, false, false, false, false],
                '6': [false, false, false, false, false],
            },
            selectFixedTime: function (weekday, index) {
                $scope.list.timeSelectedList[weekday][index] = !$scope.list.timeSelectedList[weekday][index];
            }
        };
        $scope.floorList = [
            {
                '103室': [false, false, '103室1', '103室2', false, false],
                '105室': [false, false, '105室1', '105室2', false, false],
                '112室': [false, false, '112室1', '112室2', false, false],
                '114室': [false, false, '114室1', '114室2', false, false],
                '116室': [false, false, '116室1', '116室2', false, false],
            },
            {
                '205室': [false, false, '205室1', '205室2', false, false],
                '207室': [false, false, '207室1', '207室2', false, false],
                '209室': [false, false, '209室1', '209室2', false, false],
                '211室': [false, false, '211室1', '211室2', false, false],
                '213室': [false, false, '213室1', '213室2', false, false],
                '215室': [false, false, '215室1', '215室2', false, false]
            },
            {
                '301室': [false, false, '301室1', '301室2', false, false],
                '304室': [false, false, '304室1', '304室2', false, false],
                '306室': [false, false, '306室1', '306室2', false, false],
                '308室': [false, false, '308室1', '308室2', false, false],
                '310室': [false, false, '310室1', '310室2', false, false],
                '312室': [false, false, '312室1', '312室2', false, false],
                '314室': [false, false, '314室1', '314室2', false, false],
                '316室': [false, false, '316室1', '316室2', false, false],
                '318室': [false, false, '318室1', '318室2', false, false],
                '320室': [false, false, '320室1', '320室2', false, false],
                '322室': [false, false, '322室1', '322室2', false, false]
            },
            {
                '401室': [false, false, '401室1', '401室2', false, false],
                '406室': [false, false, '406室1', '406室2', false, false],
                '408室': [false, false, '408室1', '408室2', false, false],
                '409室': [false, false, '409室1', '409室2', false, false],
                '411室': [false, false, '411室1', '411室2', false, false],
                '412室': [false, false, '412室1', '412室2', false, false],
                '414室': [false, false, '414室1', '414室2', false, false],
                '418室': [false, false, '418室1', '418室2', false, false],
                '419室': [false, false, '419室1', '419室2', false, false],
                '421室': [false, false, '421室1', '421室2', false, false]
            },
            {
                '101室': [false, false, false, '101室1', '101室2', '101室3', false, false, false],
                '108室': [false, false, false, '108室1', '108室2', '108室3', false, false, false],
                '109室': [false, false, false, '109室1', '109室2', '109室3', false, false, false],
                '117室': [false, false, false, '117室1', '117室2', '117室3', false, false, false]
            }
        ];

        $scope.selectedArr = [];

        //单选
        $scope.selectClassAndAir = function (floorNum, key, location) {
            $scope.floorList[floorNum][key][location] = !$scope.floorList[floorNum][key][location];
        };

        //全选\全不选
        $scope.allControl = function (index, switchValue) {
            _.map($scope.floorList[index], function (item, key) {
                item[0] = switchValue;
                item[1] = switchValue;
            });
            //一楼4个大教室的空调
            if(index === 0) {
                _.map($scope.floorList[4], function (item, key) {
                    item[0] = switchValue;
                    item[1] = switchValue;
                    item[2] = switchValue;
                    //_param.selectedArr.push(item[3]);
                    //_param.selectedArr.push(item[4]);
                    //_param.selectedArr.push(item[5]);
                });
            }
        }

        $scope.timeSwitchFn = function () {
            var selectedArr = [];
            for(var i = 0; i < $scope.floorList.length; i ++) {
                _.map($scope.floorList[i], function (item) {
                    if(i === 4) {
                        if(item[0] === true) {
                            selectedArr.push(item[3]);
                        }
                        if(item[1] === true) {
                            selectedArr.push(item[4]);
                        }
                        if(item[2] === true) {
                            selectedArr.push(item[5]);
                        }
                    } else {
                        if(item[0] === true) {
                            selectedArr.push(item[2]);
                        }
                        if(item[1] === true) {
                            selectedArr.push(item[3]);
                        }
                    }
                })
            }
            //暂时定时操作为 开
            var _param = {
                airType: $scope.selectedAir,
                temperature: $scope.selectedTemperature,
                pattern: $scope.selectedPatternValue,
                windSpeed: $scope.selectedWSValue,
                windDirection: $scope.selectedWDValue,
                time: $_yaq.timeToInit((new Date()).valueOf()),
                switch: 'on',
                flag: 'timeControl',
                selectedArr: selectedArr,
                timeSelectedList: $scope.list.timeSelectedList
            };

            $_http.reqPostFn('/time', _param).then(function (data) {
                if(data.status === 0) {
                    alert('设置成功');
                    console.log(data);
                }
            }, function (data) {
                console.log(data);
            })
            //console.log($scope.list.timeSelectedList);
            //console.log(selectedArr);
            //定时开关选项
            //$rootScope.$broadcast('modal', {data: _param});
        };

        /*setInterval(function () {
         $_http.reqPostFn('/timeSwitch', {days: 3, period: 2}).then(function (data) {
         if(data.status === 0) {
         console.log(123);
         }
         }, function (data) {
         console.log(data);
         })
         }, 10000);*/
    }]);

    timeModule.controller('selectModalDialog', ['$rootScope', '$scope', '$_http', function ($rootScope, $scope, $_http) {
        $scope.selectedHour = 0;
        $scope.selectedMinutes = 0;
        $scope.selectedSwitch = '开';
        $scope.selectedSwitchValue = 'on';
        $scope.dataList = null;
        $scope.timeList = {
            hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            minutes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
            switchValues: {
                '开': 'on',
                '关': 'off'
            },
            selectHour: function (hour) {
                $scope.selectedHour = hour;
            },
            selectMinutes: function (minute) {
                $scope.selectedMinutes = minute;
            },
            selectSwitch: function (key, val) {
                $scope.selectedSwitch = key;
                $scope.selectedSwitchValue = val;
            }
        }
        $scope.$on('modal', function (e, modalData) {
            $scope.isShow = true;
            $scope.dataList = modalData.data;
            console.log($scope.dataList);
        });

        $scope.saveTime = function () {
            var nowTime = new Date(),
                nowHour = nowTime.getHours(),
                nowMinutes = nowTime.getMinutes();

            //定时时间
            var millseconds = ($scope.selectedHour - nowHour) * 3600 * 1000 + ($scope.selectedMinutes - nowMinutes) * 60 * 1000;
            $scope.dataList.fixedTime = millseconds;
            $scope.dataList.switch = $scope.selectedSwitchValue;
            console.log($scope.selectedSwitchValue);

            $_http.reqPostFn('/control', $scope.dataList).then(function (data) {
                if(data.status === 0) {
                    alert('设置成功');
                    $scope.isShow = false;
                }
            }, function (data) {
                console.log(data);
            })
        };
    }])
});


