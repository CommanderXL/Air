var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var _ = require('underscore');
var mysql = require('mysql');
//引入crc模块
var crc = require("crc");

var util = require('./util.js');

//引入async库
var async = require("async");
//引入ip库
var ipStorage = require("./ipStorage.js");
//引入kt核心库
var kt = require('./lib/kt.core.js');

var cluster = require("cluster");
var tcp = require("net").createServer();

//设置最大监听数量
require('events').EventEmitter.prototype._maxListeners = 10000;


var controlFlag = false;

//接收返回控制命令
var controlCommond = {
    directive: {},
    selectedIpArr: [],
    sendDataArr: [],
    isJudge: false,
};

var dataArr = [];

setInterval(function () {
    dataArr.length = 0;
}, 1000);


function initToTime(time) {
    var date = new Date(time),
        Y = date.getFullYear() + '-',
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-',
        D = date.getDate() + ' ',
        h = date.getHours() + ':',
        m = date.getMinutes() + ':',
        s = date.getSeconds();
    return (Y + M + D + h + m + s);
}

function initializeConnection(config) {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    console.error(error.stack);
                    console.log("Lost connection. Reconnecting...");

                    initializeConnection(connection.config);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }

    var connection = mysql.createConnection(config);

    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}

var connection = initializeConnection({
    host: 'senlinxunjian.mysql.rds.aliyuncs.com',
    user: 'dbadmin',
    password: 'ccbfu6233',
    database: 'experiments'
});



    //数据库连接
/*var connection = mysql.createConnection({
	host: 'senlinxunjian.mysql.rds.aliyuncs.com',
	user: 'dbadmin',
	password: 'ccbfu6233',
	database: 'experiments'
});*/
//
/*connection.connect(function (err) {
	if(err){
		console.error('error connecting ' + err.stack);
		return ;
	}
	console.log('connected as id ' + connection.threadId);
});*/


if (cluster.isMaster) {

    var wk = cluster.fork();
//监听fork事件
    cluster.on("fork", function (worker) {
        console.log("[master]" + "fork:worker " + worker.id);
    });
//监听online事件
    cluster.on("online", function (worker) {
        console.log("[master]" + "listening:worker:" + worker.process.pid);
    });
    //进行间数据共享
/*    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].on("message", function (msg) {
            console.log("[master]" + msg);
        })
    });*/




    var app = express();
    var http = require('http');
    var server = http.createServer(app);
    server.listen(8080);

    //加载各种中间件
    app.use(logger('dev'));
    app.use(bodyParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, 'online')));

    //登录界面
    app.get('/', function (req, res) {
        console.log('someone has login');
        res.sendFile(path.join(__dirname, '/online/index.html'));
    });

    //登录账号
    app.post('/login', function (req, res) {
        var sql = 'select name, password from user where name="' +req.body.name + '"';
        connection.query(sql, function (err, results) {
            if(req.body.val === results[0].password) {
                return res.send({status: 0});
            }
            return res.send({status: 1});
        });
    });
    //控制页面
    app.post('/control', function (req, res) {
        console.log(req.body);

        controlFlag = true;     //controlFlag标志位

        var _tableMessage = req.body.airType === '海信' ? 'message' : 'message2';

        //存入数据库操作
        var _selectedArr = req.body.selectedArr;
        for(var i = 0; i < _selectedArr.length; i ++) {
            var _param = {
                id: _selectedArr[i], //教室
                time: req.body.time, //时间
                switch: req.body.switch, 
                temperature: req.body.temperature,
                pattern: req.body.pattern,
                windspeed: req.body.windSpeed,
                winddirection: req.body.windDirection
            };
            
            //添加空调状态字段
            ipStorage[_selectedArr[i]].status = req.body.switch;

            connection.query('insert into '+ _tableMessage +' set ?', _param, function (err, result) {
                console.log(result);
            })
        };  

        //控制命令
        controlCommond.directive.switch = req.body.switch;
        controlCommond.directive.temperature = req.body.temperature;
        controlCommond.directive.pattern = req.body.pattern;
        controlCommond.directive.windSpeed = req.body.windSpeed;
        controlCommond.directive.windDirection = req.body.windDirection;
        //controlCommond.directive.airType = req.body.airType;

        console.log(controlCommond);


        //发送给TCP服务器
        wk.send(req.body);
        //返回给前台信息
        res.send({
            status: 0,
            description: 'OK'
        });
    });
    //control页面初始化(获取空调所有状态)
    app.post('/getAllState', function (req, res) {
        var _tableMessage = (req.body.airType === '海信' ? 'message' : 'message2');
        var sql = 'select id, switch from (select id, switch from ' + _tableMessage + ' ORDER BY time desc) as temp GROUP BY id';
        //connection.connect();
        connection.query(sql, function (err, results) {
            if(err) console.log(err);
            if(results.length > 0) {
                res.send({
                    status: 0,
                    description: 'OK',
                    data: classifyStatus(results)
                });
            }
        });
        //connection.end();
    });
    //初始化获取所有数据
    function classifyStatus(result) {
        var arr = [];
        for(var i = 0; i < result.length; i++) {
            if(result[i].switch === 'on') {
                arr.push([result[i].id, true]);
            } else {
                arr.push([result[i].id, false]);
            }
        };
        return arr;
    }
    //状态查询
    app.post('/status', function (req, res) {
        var _tableMessage = (req.body.airType === '海信' ? 'message' : 'message2');
        var _tableContainer = (_tableMessage === 'message' ? 'conditioner' : 'conditioner2');
        //var sql = 'select temp.id, time, switch, temperature, pattern, windspeed, winddirection, location from (select * from ' + _tableMessage + ' ORDER BY time, id desc) as temp INNER JOIN ' + _tableContainer + ' ON ' + _tableContainer + '.id = temp.id where temp.id like "'+ req.body.floor +'%" group by temp.id order by temp.id desc';

        var _sql = 'SELECT temps.id, time, switch, temperature, pattern, windspeed, winddirection, location, Rtemperature FROM (SELECT temp.id, time, switch, temperature, pattern, windspeed, winddirection, Rtemperature FROM (SELECT id, max(time) dtime FROM ' + _tableMessage + ' GROUP BY id DESC) AS temp INNER JOIN ' + _tableMessage + ' ON ' + _tableMessage + '.id = temp.id AND ' + _tableMessage + '.time = temp.dtime AND temp.id like "' + req.body.floor + '%") AS temps,' + _tableContainer + ' WHERE temps.id = ' + _tableContainer + '.id ORDER BY temps.id ASC';
        connection.query(_sql, function (err, results) {
            if(err) console.log(err);
            res.send({
                status: 0,
                description: 'OK',
                data: results
            });
        });
    });
    //报表页面
    app.post('/table', function (req, res) {
        var sqlA = '',sqlRoom = '',
            _tableMessage = (req.body.airType === '海信' ? 'message' : 'message2');

        var _tableContainer = (_tableMessage === 'message' ? 'conditioner' : 'conditioner2');
        if(req.body.room) {
            sqlA = 'select temp.id, time, switch, temperature, pattern, windspeed, winddirection, location from (select * from ' + _tableMessage + ' ORDER BY time, id desc) as temp INNER JOIN ' + _tableContainer + ' ON ' + _tableContainer + '.id = temp.id where time > "' + req.body.from + '" and time < "' + req.body.to + '" and temp.id like "'+ req.body.room +'%" order by temp.id asc';
            sqlRoom = 'select ' + _tableMessage + '.id, time, switch, powerc, powerw from ' + _tableMessage + ', ' + _tableContainer + ' where time > "' + req.body.from + '" and time < "' + req.body.to + '" and '+ _tableMessage +'.id = ' + _tableContainer + '.id and ' +  _tableMessage + '.id like "' + req.body.room + '%"';
        } else {
            sqlA = 'select temp.id, time, switch, temperature, pattern, windspeed, winddirection, location from (select * from ' + _tableMessage + ' ORDER BY time, id desc) as temp INNER JOIN ' + _tableContainer + ' ON ' + _tableContainer + '.id = temp.id where time > "' + req.body.from + '" and time < "' + req.body.to + '" and temp.id like "'+ req.body.floor +'%" order by temp.id asc';
            sqlRoom = 'select ' + _tableMessage + '.id, time, switch, powerc, powerw from ' + _tableMessage + ', ' + _tableContainer + ' where time > "' + req.body.from + '" and time < "' + req.body.to + '" and ' + _tableMessage + '.id = ' + _tableContainer + '.id and ' + _tableMessage + '.id like "' + req.body.floor + '%"';
        }

        async.parallel({
            dataStatus: function (next) {
                connection.query(sqlA, function (err, rows) {
                    next(null, rows);
                })
            },
            power: function (next) {
                connection.query(sqlRoom, function (err, rows) {
                    next(null, rows);
                })
            }
        }, function (err, results) {
            if(err) {
                console.error(err);
                return ;
            }

            res.send({
                status: 0,
                data: {
                    dataStatus: results.dataStatus,
                    power: util.getPower(results.power, req.body.chartIndex)
                }
            });
        });
    });
    //定时状态存入数据库
    app.post('/time', function (req, res) {
        console.log(req.body);
        var selectedArr = req.body.selectedArr,
            timeSelectedList = req.body.timeSelectedList,
            _param = {
                switch: 'on',
                temperature: req.body.temperature,
                pattern: req.body.pattern,
                windSpeed: req.body.windSpeed,
                windDirection: req.body.windDirection,
            };

        //删除数据
        for(var k = 0; k < selectedArr.length; k++) {
            (function (x) {
                _param.id = selectedArr[x];
                for(var day in timeSelectedList) {
                    for(var i = 0; i < timeSelectedList[day].length; i++) {
                        if(timeSelectedList[day][i] === true) {
                            _param.days = Number(day);
                            _param.period = i;

                            connection.query('delete from schedule where id = "' + _param.id + '"', function (err, results) {
                                if(err) console.log(err);
                                //console.log(results);
                                    /*connection.query('insert into schedule set ?', _param, function (err, result) {
                                    if(err) console.log(err);*/
                                //console.log(result);
                             //})
                             })
                        }
                    }
                }
            })(k);
        }
        //存入数据
        setTimeout(function () {
            for(var k = 0; k < selectedArr.length; k++) {
                (function (x) {
                    _param.id = selectedArr[x];
                    for(var day in timeSelectedList) {
                        for(var i = 0; i < timeSelectedList[day].length; i++) {
                            if(timeSelectedList[day][i] === true) {
                                _param.days = Number(day);
                                _param.period = i;

                                connection.query('insert into schedule set ?', _param, function (err, result) {
                                    if(err) console.log(err);
                                    //console.log(result);
                                })
                            }
                        }
                    }
                })(k);
            }
        }, 2000);
    });
    //定时操作
    app.post('/timeSwitch', function(req, res){
        var _day = Number(req.body.day),
            _period = Number(req.body.period);
        console.log(req.body);
        connection.query('select  id, switch, temperature, pattern, windspeed, winddirection  from schedule where days = "' + _day + '" and period = "' + _period + '"', function (err, results) {
            if(err) console.log(err);
            console.log(results);
            wk.send({
                    fixedFlag: true,
                    dataList: results
                });
            res.send({status: 0, description: 'OK'});
        })
    });

//    cluster.on('online', function (worker) {
//        worker.on('message', function (data) {
//            data.time = initToTime((new Date()).valueOf());
//            connection.query('insert into message set ?', data, function (err, results) {
//                //console.log(results);
//            })
//        })
//    })

} else if (cluster.isWorker) {

    //获取CRC效验码
    function resortCRC(BUFFER) {
        var buffer = crc.crc16modbus(BUFFER);
        var buf = buffer.toString(16);
        var c_buf1 = buf.substr(0, 2);
        var c_buf2 = buf.substr(2, 2);
        if(buf.length === 3) {
            c_buf1 = buf.substr(1, 2);
            c_buf2 = buf.substr(0, 1);
        }
        c_buf1 = Number("0x" + c_buf1);
        c_buf2 = Number("0x" + c_buf2);
        if(buf.length === 3) {
            return new Buffer([c_buf1, c_buf2]);
        }
        return new Buffer([c_buf2, c_buf1]);
    }

    //获取所有的socket数组
    var socketArr = [],
        lastIp = '';
    
    //每10s清空一次
    setInterval(function() {
        lastIp = '';
    }, 10000);

    tcp.on("connection", function (socket) {
        //获取硬件设备的IP和端口号
        var remoteIP = socket.remoteAddress, remotePort = socket.remotePort;
        //将连接的socket对象存入数组
        socketArr.push(socket);


        console.log(remoteIP, remotePort);
        console.log(socketArr.length);

        //硬件掉线处理
        //前台显示
        socketArr.forEach(function (socket, index) {
            //处理正常断线的情况
            socket.on("end", function () {
                console.log(socket._peername.address + "正常断开");
                socketArr.splice(index, 1);
                console.log(socketArr.length);
            });
            //处理意外断线的情况
            socket.on('error', function (err) {
                console.log(socket._peername.address.slice(7) + '意外掉线');
                socketArr.splice(index, 1);
                console.log(socketArr.length);
            });
            //获取硬件设备传输数据
            socket.on("data", function (data) {
                var _remoteAddress = socket.remoteAddress.slice(7),
                    _getData = {},  //入库对象
                    _compareData = {},  //比较对象 
                    _tableMessage = '';

                if(lastIp === _remoteAddress) {
                    return;
                } else {
                    lastIp = _remoteAddress;
                }

                //类型
                data.slice(1, 2)[0] === 1 ? _getData.airType = '海信' : _getData.airType = '格力';
                _getData.airType === '海信' ? _tableMessage = 'message' : _tableMessage = 'message2';
                //开关
                data.slice(3, 4)[0] === 1 ? _compareData.switch = _getData.switch = 'on' : _compareData.switch = _getData.switch = 'off';
                //模式
                switch (data.slice(4, 5)[0]) {
                    case 1: 
                        _compareData.pattern = _getData.pattern = 'cold';
                        break;
                    case 2: 
                        _compareData.pattern = _getData.pattern = 'hot';
                        break;
                    case 3: 
                        _compareData.pattern = _getData.pattern = '送风';
                        break;
                    case 4:
                        _compareData.pattern = _getData.pattern = '除湿';
                        break;
                    default:
                        break;
                }
                //风速
                _compareData.windSpeed = _getData.windSpeed = data.slice(5, 6)[0];
                //风向
                _compareData.windDirection = _getData.windDirection = data.slice(6, 7)[0];
                //温度
                _compareData.temperature = _getData.temperature = data.slice(7, 8)[0];

                _getData.time = new Date();

                //空调每次返回的数据都存入数据库
                kt.each(ipStorage, function(key, val) {
                    if(val.ip === String(_remoteAddress)) {
                        _getData.id = key;
                        connection.query('insert into ' +  _tableMessage + 'set ?', _getData, function(err, result) {
                            console.log(result);
                        })
                    }
                })

                if(controlCommond.isJudge) {
                    if(controlCommond.selectedIpArr.length !== 0 && controlCommond.selectedIpArr.indexOf(_remoteAddress) !== -1) {
                        var _index = controlCommond.selectedIpArr.indexOf(_remoteAddress);
                        if(_.isEqual(_compareData, controlCommond.directive)) controlCommond.selectedIpArr.splice(_index, 1);
                    }
                }

                _compareData = null;

            })
        });
        
    });

    process.on("message", function (msg) {

        controlDirective(msg, socketArr);

        // if(msg.fixedFlag) { //定时操作
        //     for(var i = 0; i < msg.dataList.length; i++) {
        //         controlDirective(msg.dataList[i], 'fixedTime');
        //     }
        // } else {
        //     controlDirective(msg);  //普通操作
        // }
    });


    //传送数据    
    function transferData(finalCommand, selectedIP) {
        //遍历socketArr数组,发送数据
        for (var j = 0; j < selectedIP.length; j++) {
            socketArr.forEach(function (socket, index) {
                if (socket.remoteAddress.slice(7) == selectedIP[j]) {
                    socket.write(finalCommand);
                }
            })
        }
        controlCommond.isJudge = true;
    }
    //解析数据
    function controlDirective(msg, selectedIPArr) {

        // if(arguments.length === 2) {
        //     var airType = '海信',
        //         SwitchValue = msg.switch,
        //         temperatureValue = msg.temperature,
        //         patternValue = msg.pattern,
        //         windSpeedValue = msg.windspeed,
        //         windDirectionValue = msg.winddirection,
        //         selectedArr = [msg.id];
        // } else {

    
        //解析传输数据
        var airType = msg.airType,
            SwitchValue = msg.switch,
            temperatureValue = msg.temperature,
            patternValue = msg.pattern,
            windSpeedValue = msg.windSpeed,
            windDirectionValue = msg.windDirection;

        if(arguments.length === 3) {
            selectedIP = selectedIPArr;
        } else {
            //做一个映射后查询IP地址发送数据
            //选取将要发送的ip地址
            var selectedIP = [];
            for (var i = 0; i < msg.selectedArr.length; i++) {
                _.map(ipStorage, function (val, key) {
                    if(msg.selectedArr[i] === key) {
                        selectedIP.push(val.ip);
                    }
                });
            }
            controlCommond.selectedIpArr = selectedIP;
        }


        console.log(selectedIP);

        var Btype, Bswitch, Btemperature, Bpattern, BwindSpeed, BwindDirection, CRC_Buffer;


        //     帧头    /   预留字节   /    帧尾
        var frameHeader = new Buffer([170, 126]), frameSaved = new Buffer([0, 0, 0, 0, 0]), frameEnd = new Buffer([126]);

        airType == "海信" ? Btype = new Buffer([1]) : Btype = new Buffer([2]);

        //开关
        SwitchValue == "on" ? Bswitch = new Buffer([1]) : Bswitch = new Buffer([2]);
        //温度
        Btemperature = new Buffer([parseInt(temperatureValue)]);
        //模式
        patternValue == "cold" ? Bpattern = new Buffer([1]) : Bpattern = new Buffer([2]);
        //风速
        BwindSpeed = new Buffer([parseInt(windSpeedValue)]);
        //风向
        BwindDirection = new Buffer([parseInt(windDirectionValue)]);


        CRC_Buffer = resortCRC(Buffer.concat([frameHeader, Btype, Bswitch, Bpattern, BwindSpeed, BwindDirection, Btemperature, frameSaved]));
        var finalCommand = Buffer.concat([frameHeader, Btype, Bswitch, Bpattern, BwindSpeed, BwindDirection, Btemperature, frameSaved, CRC_Buffer, frameEnd]);
        /*******************向硬件发送数据部分**************************/

        transferData(finalCommand, selectedIP);

        console.log(finalCommand);
    };

    //每30s轮询监测一次。给未收到命令的Client发送数据
    setInterval(function() {
        if(controlCommond.isJudge && controlCommond.selectedIpArr.length !== 0) {
            controlDirective(controlCommond.directive, controlCommond.selectedIpArr, 'checkFlag');
        }
        controlCommond.isJudge = false;
    }, 30000);
    

    //每一小时轮询空调状态
    function checkState() {
        var frameHeader = new Buffer([170, 126]), checkByte = new Buffer([51]), frameSaved = new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), frameEnd = new Buffer([126]),
            _CRC_Buffer = resortCRC(Buffer.concat([frameHeader, checkByte, frameSaved, frameEnd])),
            _finalCommand = Buffer.concat([frameHeader, checkByte, frameSaved, _CRC_Buffer, frameEnd]);
       
        setInterval(function() {
            socketArr.forEach(function(socket, index) {
                var _ip = socket.remoteAddress.slice(0, 7);
                _.map(ipStorage, function(val, key) {
                    if(val.ip === String(_ip) && val.status === 'on') {
                        socket.write(_finalCommand);
                    }
                })
            })
        }, 60 * 60 * 1000);
    }
    
    checkState();

    tcp.listen(8234, function () {
        console.log("TCP Server is on the port of 8234");
    })
}




