/**
 * Created by XRene on 2015/12/2.
 */

define(function () {
    var selectModule = angular.module('selectModule', ['commonService']);

    selectModule.controller('selectCtrl', ['$rootScope', '$scope', '$_http', '$_yaq', function ($rootScope, $scope, $_http, $_yaq) {

        $scope.selectedAir = '海信';
        $scope.airList = {
            '海信': 1,
            '格力': 2
        };
        $scope.selectAir = function (key, val) {
            $scope.selectedAir = key;
        };
        $scope.allCheckArr = [false, false, false, false];

        $scope.selectedTemperature = 18;
        $scope.selectedWS = '一级';
        $scope.selectedWSValue = 1;
        $scope.selectedWD = '上下风';
        $scope.selectedWDValue = 1;
        $scope.selectedPattern = '制冷';
        $scope.selectedPatternValue = 'cold';
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

        $scope.selectClassAndAir = function (floorNum, key, location) {
            $scope.floorList[floorNum][key][location] = !$scope.floorList[floorNum][key][location];
            var _param = {
                airType: $scope.selectedAir,
                temperature: $scope.selectedTemperature,
                pattern: $scope.selectedPatternValue,
                windSpeed: $scope.selectedWSValue,
                windDirection: $scope.selectedWDValue,
                flag: 'control',
                time: $_yaq.timeToInit((new Date()).valueOf())
            }
            $scope.floorList[floorNum][key][location] === true ? _param.switch = 'on' : _param.switch = 'off';
            _param.selectedArr = [key + '' + (location + 1)];
            /*$_http.reqPostFn('/control', _param).then(function (data) {
             if(data.status === 0) {
             alert('设置成功');
             }
             console.log(data);
             }, function (data) {
             console.log(data);
             })*/
        };
        //全开,全关
        $scope.allControl = function (index, switchValue) {
            var _param = {
                airType: $scope.selectedAir,
                temperature: $scope.selectedTemperature,
                pattern: $scope.selectedPatternValue,
                windSpeed: $scope.selectedWSValue,
                windDirection: $scope.selectedWDValue,
                time: $_yaq.timeToInit((new Date()).valueOf()),
                flag: 'control',
                selectedArr: []
            }

            _.map($scope.floorList[index], function (item, key) {
                _param.selectedArr.push(item[2]);
                _param.selectedArr.push(item[3]);
            });

            //一楼4个大教室的空调
            if(index === 0) {
                _.map($scope.floorList[4], function (item, key) {
                    _param.selectedArr.push(item[3]);
                    _param.selectedArr.push(item[4]);
                    _param.selectedArr.push(item[5]);
                });
            }

            switchValue === true ? _param.switch = 'on' : _param.switch = 'off';

            $_http.reqPostFn('/control', _param).then(function (data) {
                if(data.status === 0) {
                    alert('设置成功');
                    $scope.allCheckArr[index] = switchValue;

                    _.map($scope.floorList[index], function (item) {
                        item[0] = switchValue;
                        item[1] = switchValue;
                    });
                    if(index === 0) {
                        _.map($scope.floorList[4], function (item) {
                            item[0] = switchValue;
                            item[1] = switchValue;
                            item[2] = switchValue;
                        });
                    }
                }
            }, function (data) {
                console.log(data);
            })
        };

        //应用至所选对象
        $scope.applyControl = function (item) {
            var selectedArr = [];
            var status = (item === 'on' ? true : false);    //每个按钮的颜色状态
            for(var i = 0; i < $scope.floorList.length; i ++) {     //添加被选中的数组
                _.map($scope.floorList[i], function (item) {
                    if(i === 4) {
                        if(item[6] === true) {
                            selectedArr.push(item[3]);
                        }
                        if(item[7] === true) {
                            selectedArr.push(item[4]);
                        }
                        if(item[8] === true) {
                            selectedArr.push(item[5]);
                        }
                    } else {
                        if(item[4] === true) {
                            selectedArr.push(item[2]);
                        }
                        if(item[5] === true) {
                            selectedArr.push(item[3]);
                        }
                    }
                })
            };
            var _param = {
                airType: $scope.selectedAir,
                temperature: $scope.selectedTemperature,
                pattern: $scope.selectedPatternValue,
                windSpeed: $scope.selectedWSValue,
                windDirection: $scope.selectedWDValue,
                time: $_yaq.timeToInit((new Date()).valueOf()),
                switch: item,
                flag: 'control',
                selectedArr: selectedArr
            };
            $_http.reqPostFn('/control', _param).then(function (data) {
                if(data.status === 0) {
                    alert('设置成功');
                    for(var i = 0; i < $scope.floorList.length; i ++) {     //改变被选中
                        _.map($scope.floorList[i], function (item) {
                            if(i === 4) {
                                if(item[6] === true) {
                                    item[0] = status;
                                }
                                if(item[7] === true) {
                                    item[1] = status;
                                }
                                if(item[8] === true) {
                                    item[2] = status;
                                }
                            } else {
                                if(item[4] === true) {
                                    item[0] = status;
                                }
                                if(item[5] === true) {
                                    item[1] = status;
                                }
                            }
                        });
                        if(i === 4 || i === 0) {
                            $scope.allCheckArr[0] = (isAllOn($scope.floorList[0]) && isAllOn($scope.floorList[4], 'flag'));
                            console.log(isAllOn($scope.floorList[0]), isAllOn($scope.floorList[4], 'flag'));
                        } else {
                            $scope.allCheckArr[i] = isAllOn($scope.floorList[i]);
                        }
                    };  //改变被数组
                }
            }, function (data) {
                console.log(data);
            })
        };

        //获取所有空调的状态
        $scope.getAllState = function () {
            $_http.reqPostFn('/getAllState', {airType: '海信'}).then(function (data) {
                if(data.status === 0) {
                    checkStatus(data.data);
                }
            }, function (data) {
                console.log(data);
            })
        };

        $scope.getAllState();
        //空调状态过滤
        function checkStatus (dataList) {
            for(var i = 0; i < $scope.floorList.length; i++) {
                for(var item in $scope.floorList[i]) {
                    for(var j = 0; j < dataList.length; j++) {
                        if(dataList[j][0].slice(0, 4) === item) {
                            var index = dataList[j][0].slice(4) - 1;
                            $scope.floorList[i][item][index] = Boolean(dataList[j][1]);
                        }
                    }
                }
            }
            console.log($scope.floorList);
        };
        //判断全开或全关
        function isAllOn(item, flag) {
            var _val = [];
            var _key = null;
            for(var key in item) {
                for(var i = 0; i < item[key].length; i++) {
                    _val.push(item[key][0]);
                    _val.push(item[key][1]);
                    if(flag) {
                        _val.push(item[key][2]);
                    }
                }
            }
            key = _val.every(function (ele) {
                return ele === true;
            });
            return key;
        }
    }]);
});




