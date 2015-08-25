var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//引入crc模块
var crc=require("crc");

var routes = require('./routes/index');
var setting=require("./setting.js");
var session=require("express-session");
var MongoStore=require("connect-mongo")(session);
//引入模型文件
var ControlState=require("./models/control.js");
var Command=require("./models/command.js");
//引入eventproxy库
var eventproxy=require("eventproxy");
//引入async库
var async=require("async");
//引入ip库
var ipStorage=require("./ipStorage.js");

var cluster=require("cluster");
var tcp=require("net").createServer();


if(cluster.isMaster){

var wk=cluster.fork();
//监听fork事件
cluster.on("fork",function(worker){
 console.log("[master]"+"fork:worker "+worker.id);
});
//监听online事件
cluster.on("online",function(worker){
  console.log("[master]"+"listening:worker:"+worker.process.pid);
});
Object.keys(cluster.workers).forEach(function(id){
  cluster.workers[id].on("message",function(msg){
    console.log("[master]"+msg);
 })
});


var app = express();
var http = require('http');
var server = http.createServer(app);
server.listen(8080);



app.use(session({
  secret: setting.cookieSecret,
  key: setting.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: setting.db,
    host: setting.host,
    port: setting.port
  })
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

//加载各种中间件
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
    //获取时间
    var date=new Date();
    //构造栈函数
    function Stock(){
      this.top=0;
      this.dataStore=[];
      this.length=function(){
        return this.dataStore.length;
      }
      this.peek=function(){
        return this.dataStore[this.dataStore.length-1];
      }
      this.clear=function(){
        this.top=0;
      }
      this.push=push;
      this.pop=pop;
    }
    //压入栈
    function push(element){
      this.dataStore[this.top++]=element;
    } 
    //弹出栈
    function pop(element){
      return this.dataStore[--this.top];
    }
    //栈实例
    var stockTime=new Stock();



  app.get("/",function(req,res,next){
    res.render("control");
  });

  app.post("/",function(req,res){
    //防止出现假死状态.必须返回值使前台进行处理
    res.send("123");
      	if(!req.body.a){	//
      		var data={
          Switch:req.body.Switch,
          temperature:req.body.temperature,
          pattern:req.body.pattern,
          windSpeed:req.body.windSpeed,
          windDirection:req.body.windDirection,
        }
        //向TCP server发送数据      
        wk.send(req.body);
        //将操作存入数据库
        var commandList=new Command(data);
        commandList.save(function(err){
          if(err){
            console(err.message);
            return res.redirect("/");
          }
        })
     }else if(req.body.a){	//
     	wk.send(req.body);
     }
    

    
  })

  app.get("/dataTables",function(req,res){
    res.render("show",{title:"Distureted Air Conditioner Version 1"});
  });

//
  app.get("/test",function(req,res){


    Command.getconditionState(function(err,docs){
      if(err){
        // req.flash("error",err.message);
        return res.redirect("/dataTables");
      }
  //向前台推送obj对象
    var obj={
        "data":docs
    }
      //前台发送数据
      res.send(obj);
      //打印数据
      console.log("123");
    })
  });

  app.get("/testState",function(req,res){
    ControlState.getTestState(function(err,docs){
      res.send(docs);
    })
  });



//routes(app);

/*
  中间件处理函数
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();

});





}else if(cluster.isWorker){

    //获取CRC效验码
    function resortCRC(BUFFER){
      var buffer=crc.crc16modbus(BUFFER);
      var buf=buffer.toString(16);
      var c_buf1=buf.substr(0,2);
      var c_buf2=buf.substr(2,2);
      c_buf1=Number("0x"+c_buf1);
      c_buf2=Number("0x"+c_buf2);
      return new Buffer([c_buf2,c_buf1]);
    }
    
    //获取所有的socket数组
    var socketArr=[];

    tcp.on("connection",function(socket){
      //获取硬件设备的IP和端口号
      var remoteIP=socket.remoteAddress,remotePort=socket.remotePort;
      //将连接的socket对象存入数组
      socketArr.push(socket);   
      

      console.log(remoteIP,remotePort);
      console.log(socketArr.length);
      
      //数据库的处理
      var AirCondition={
        remoteIP:remoteIP,
        Switch:"",
        temperature:"",
        pattern:"",
        windSpeed:"",
        windDirection:"",
        state:"",
      };
      //存入数据库
      //状态表
        var NewAirConditionControlState=new ControlState(AirCondition);
        NewAirConditionControlState.save(function(err,doc){
          console.log(doc);
        process.send("[worker]"+"can you hear me?");
      })
        //操作记录表 
        var NewAirConditionCommand=new Command(AirCondition);
        NewAirConditionCommand.save(function(err,doc){
          console.log(doc);
        })


    //硬件掉线处理
    //存入数据库
    //前台显示
   socketArr.forEach(function(socket,index){
      socket.on("end",function(){
        console.log(socket._peername.address+"has disconnected");
        socketArr.splice(index,1);
        console.log(socketArr.length);

//改变state状态(掉线)
/*        for(var i in ipStorage){
            if(ipStorage[i]==socket._peername.address){
                var floor=i.slice(0,1), //楼层号
                    room=i, //房间号
                    location=i.slice(-1)==1?"前":"后";


            }
        }*/

      })
    })
    

      //获取硬件设备传输数据
      socket.on("data",function(data){
      	for(var i in ipStorage){ //遍历ipStorage
          if(ipStorage[i]==socket._peername.address){
            	if(data.length==16){
            	    var gFloor=i.slice(0,1),//楼层号
                        gRoom=i,   //房间号
                        gLocation=i.silce(-1)==1?"前":"后",
                        gSwitch=data.slice(3,4)[0],	//返回开关
            			gPattern=data.slice(4,5)[0],	//返回模式
            			gWindSpeed=data.slice(5,6)[0],	//返回风速
            			gWindDirection=data.slice(6,7)[0],	//返回风向
            			gTemperature=data.slice(7,8)[0],	//返回控制温度
            			Rtemperature=data.slice(8,9)[0];	//返回室内温度

            		var controlData={};

                    switch(gFloor){
                        case 1:controlData.gFloor="一层";break;
                        case 2:controlData.gFloor="二层";break;
                        case 3:controlData.gFloor="三层";break;
                        case 4:controlData.gFloor="四层";break;
                        case 5:controlData.gFloor="五层";break;
                        case 6:controlData.gFloor="六层";break;
                        case 7:controlData.gFloor="七层";break;
                        default:break;
                    }
                    controlData.gRoom=gRoom;
                    controlData.gLocation=gLocation;
            		switch(gSwitch){
            			case 1:controlData.gSwitch="开";break;
            			case 2:controlData.gSwitch="关";break;        				
            			default:break;        				
            		}
            		switch(gPattern){
            			case 1:controlData.gPattern="制冷";break;
            			case 2:controlData.gPattern="制热";break;
            			case 3:controlData.gPattern="送风";break;
            			case 4:controlData.gPattern="除湿";break;
            			default:break;
            		}
            		switch(gWindSpeed){
            			case 1:controlData.gWindSpeed="一级";break;
            			case 2:controlData.gWindSpeed="二级";break;
            			case 3:controlData.gWindSpeed="三级";break;
            			case 4:controlData.gWindSpeed="四级";break;
            			default:break;
            		}
            		switch(gWindDirection){
            			case 1:controlData.gWindDirection="上下风";break;
            			case 2:controlData.gWindDirection="左右风";break;
            			case 3:controlData.gWindDirection="上下左右风";break;
            			default:break;
            		}
            		controlData.gTemperature=gTemperature+"度";  //返回控制温度
            		controlData.Rtemperature=Rtemperature+"度";  //返回室内温度
            	}        

          }
        }
        
        })
    

    });


        process.on("message",function(msg){
          //解析传输数据
          var airType=msg.airType,
              SwitchValue=msg.Switch,
              temperatureValue=msg.temperature,
              patternValue=msg.pattern,
              windSpeedValue=msg.windSpeed,
              windDirectionValue=msg.windDirection,
              selectedArr=msg.selectedArr;

          var Btype,Bswitch,Btemperature,Bpattern,BwindSpeed,BwindDirection,CRC_Buffer;
              

	//     帧头    /   预留字节   /    帧尾
	var frameHeader=new Buffer([170,126]),frameSaved=new Buffer([0,0,0,0,0]),frameEnd=new Buffer([126]);

      airType=="海信"?Btype=new Buffer([1]):Btype=new Buffer([2]);

      //开关
      SwitchValue=="on"?Bswitch=new Buffer([1]):Bswitch=new Buffer([2]);
      //温度
      Btemperature=new Buffer([parseInt(temperatureValue)]);
      //模式
      patternValue=="cold"?Bpattern=new Buffer([1]):Bpattern=new Buffer([2]);
      //风速
      BwindSpeed=new Buffer([parseInt(windSpeedValue)]);
      //风向
      BwindDirection=new Buffer([parseInt(windDirectionValue)]);
      
      
      CRC_Buffer=resortCRC(Buffer.concat([frameHeader,Btype,Bswitch,Bpattern,BwindSpeed,BwindDirection,Btemperature,frameSaved]));
      var finalCommand=Buffer.concat([frameHeader,Btype,Bswitch,Bpattern,BwindSpeed,BwindDirection,Btemperature,frameSaved,CRC_Buffer,frameEnd]);
/*******************向硬件发送数据部分**************************/		

//做一个映射后查询IP地址发送数据

        //选取将要发送的ip地址
        var selectedIP=[];
        for(var i=0;i<selectedArr.length;i++){
          for(var num in ipStorage){
            if(Number(selectedArr[i])==num){
              selectedIP.push(ipStorage[num]);
            }
          }
        }
        //遍历socketArr数组,发送数据
        for(var j=0;j<selectedIP.length;j++){
          socketArr.forEach(function(socket,index){
            if(socket.remoteAddress==selectedIP[j]){
              socket.write(finalCommand);
            }
          })
        }
          console.log(finalCommand);
    	  
    })
	
    tcp.listen(8234,function(){
      console.log("TCP Server is on the port of 8234");
    })
}




