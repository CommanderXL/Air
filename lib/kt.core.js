var typeEqual = function(obj, type) {
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    },
    each = function(obj, fn) {
        if(obj.length) {
            for(var i = 0; i < obj.length; i++) {
                if(false === fn.call(obj[i] || {}, i, obj[i]))
                    break;
            }
        } else if(util.isObj(obj)){
            for(var key in obj) {
                if(false === fn.call(obj[key] || {}, key, obj[key]))
                    break;
            }
        }
    },
    emptyFn = function() {},
    util = {
        isObj: function(obj) {
            return typeEqual(obj, 'Object');
        },
        isArr: function(obj) {
            return typeEqual(obj, 'Array');
        },
        isNum: function(obj) {
            return typeEqual(obj, 'Number');
        },
        isBoolean: function(obj) {
            return typeEqual(obj, 'Boolean');
        },
        isEqual: function(obj1, obj2) {
            var keyNums1 = 0, keyNums2 = 0;
            for(var key1 in obj1) {
                ++keyNums1;
            }
            for(var key2 in obj2) {
                ++keyNums2;
            }
            //首先判断字段的个数是否相等
            if(keyNums1 !== keyNums2) return;


        }
    };

var kt = {
    typeEqual: typeEqual,
    each: each,
    util: util
};

module.exports = kt;
