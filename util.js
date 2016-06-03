/**
 * Created by XRene on 2015/12/5.
 */
var _ = require('underscore');
//构造栈函数
function Stock() {
    this.top = 0;
    this.dataStore = [];
    this.length = function () {
        return this.dataStore.length;
    }
    this.peek = function () {
        return this.dataStore[this.dataStore.length - 1];
    }
    this.clear = function () {
        this.top = 0;
        console.log(this.top);
    }
    this.push = push;
}
//压入栈
function push(element) {
    this.dataStore[this.top++] = element;
}

function initToTime(time) {
    return (new Date(time)).valueOf();
}


function getPower(initArr, chartIndex) {

    var _locationsArr = _.pluck(initArr, 'id');
    var classifyArr = {};
    _.map(_locationsArr, function (id) {
        classifyArr[id] = _.filter(initArr, function (item) {
            return id === item.id;
        })
    });

    var result = {};
    _.map(classifyArr, function (val, key) {
        /*result[key]['time'] = calTime(val);
        result[key]['powerw'] = val[0].powerw;
        result[key]['powerc'] = val[0].powerc;*/
       if(chartIndex == 'zone') {
       		result[key] = {
            	time: calTime(val),
            	powerw: val[0].powerw,
            	powerc: val[0].powerc
        	}
       } else {
            var _dayArr = getDataByDays(val);
                result[key] = {};
            _.map(_dayArr, function(__val, __key) {
                result[key][__key] = {};
                result[key][__key] = {
                    date: __key,
                    time: calTime(__val),
                    powerw: __val[0].powerw,
                    powerc: __val[0].powerc
                }
            })
       }
    });

    return result;
}

//计算一共消耗的时间
function calTime(arr) {
 //   console.log(arr);
    var _arr = [],
        _index = null,
        firstItem = _.find(arr, function (item, index) {
            _index = index;
            return item.switch === 'on';
        }),
        flag = true;

    //栈实例
    var stockTime = new Stock();

    stockTime.push(arr[_index]);

    for(var i = _index; i < arr.length; i ++) {
        if((arr[i].switch === 'off' && flag === true) || (arr[i].switch === 'on' && flag === false)) {
            stockTime.push(arr[i]);
            flag = !flag;
        }
    }

    if(stockTime.length() % 2 !== 0) {
        stockTime.dataStore.pop();
    }

    var time = 0;
    for(var i = 0; i < stockTime.dataStore.length; i++) {
        if((i % 2 === 0) && (i < stockTime.dataStore.length - 1)) {
            time = time + (initToTime(stockTime.dataStore[i+1].time) - initToTime(stockTime.dataStore[i].time));
        }
    }

    return time/3600000;
};

function getDataByDays(arr) {
    var _obj = {};
    _.map(arr, function(val, key) {
        var _time = new Date(val.time),
            _realTime = _time.getFullYear() + '-' + (_time.getMonth() + 1) + '-' + _time.getDate();
        if(!_obj[_realTime]) {
            _obj[_realTime] = [];
        }
        _obj[_realTime].push(val);
    })
    return _obj;
}

module.exports = {
    getPower: getPower
}
