/**
 * Created by XRene on 2015/10/20.
 */
app.factory('$_http', ['$rootScope', '$stateParams', '$http', '$q', function($rootScope, $stateParams, $http, $q){
    return {
        reqGetFn: function (url) {

            var deffered = $q.defer();
            var _url = '' + url;

            $http.get(_url).success(function (data) {
                if(data.status === 0){
                    deffered.resolve(data);
                } else {
                    deffered.reject(data);
                }
            }).error(function (data) {
                deffered.reject(data);
            });

            return deffered.promise;
        },
        reqPostFn: function (url, param) {

            var deffered = $q.defer();
            var _req = {
                method: 'POST',
                url: url,
                data: param,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            $http(_req).success(function (data) {
                if(data.status === 0){
                    deffered.resolve(data);
                } else {
                    deffered.reject(data);
                }
            }).error(function (data) {
                deffered.reject(data);
            });

            return deffered.promise;
        }
    }
}]);

app.factory('$_socket', ['$rootScope', function ($rootScope) {
    var socket = io();
    return {
        on: function(eventName, callback){
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            })
        },
        emit: function (eventName, callback) {
            socket.emit(eventname, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if(callback){
                        callback.apply(socket, args);
                    }
                });
            })
        }
    }
}]);

app.factory('$_yaq', ['$rootScope', '$stateParams', '$filter', function ($rootScope, $stateParams, $filter) {
    //时间序列化
    var _timeToInit = function (time) {
        return $filter('date')(time, 'yyyy-MM-dd HH:mm:ss');
    };
    //时间转化为时间戳
    var _initToTime = function (time) {
        return (new Date(time)).valueOf();
    };
    //时间戳选择
    var _selectTimeFn = function (num) {
        var _oDate = new Date(),
            _nowTime = (_oDate.getHours() * 3600 + _oDate.getMinutes() * 60 + _oDate.getSeconds()) * 1000,  //距离凌晨时间戳
            _aDate = _oDate.valueOf();  //当前时间戳

        var _WEEK_SECOND = 24 * 60 * 60 * 1000;

        switch(num) {
            case 1: //距离凌晨时间
                return [_aDate - _nowTime, _aDate];
            case 3: //3天
                return [_aDate - _WEEK_SECOND * 3, _aDate];
            case 5: //5天
                return [_aDate - _WEEK_SECOND * 5, _aDate];
            case 7: //7天
                return [_aDate - _WEEK_SECOND * 7, _aDate];
            case 15: //15天
                return [_aDate - _WEEK_SECOND * 15, _aDate];
            case 30: //30天
                return [_aDate - _WEEK_SECOND * 30, _aDate];
            default :
                return [0, _aDate];

        }
    }

    return {
        timeToInit: _timeToInit,
        initToTime: _initToTime,
        selectTimeFn: _selectTimeFn
    }
}]);