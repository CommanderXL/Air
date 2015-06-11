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



  app.get("/",function(req,res,next){
    res.render("Air",{title:"Distureted Air Conditioner Version 1"});
  });

  app.post("/",function(req,res){

  	if(!req.body.a){
  		var data={
      Switch:req.body.Switch,
      temperature:req.body.temperature,
      pattern:req.body.pattern,
      windSpeed:req.body.windSpeed,
      windDirection:req.body.windDirection,
    }
    
    wk.send(req.body);
    
    var commandList=new Command(data);
    commandList.save(function(err){
      if(err){
        console(err.message);
        return res.redirect("/");
      }
    })
 }else if(req.body.a){
 	wk.send(req.body);
 }
    

    
  })

  app.get("/dataTables",function(req,res){
    res.render("show",{title:"Distureted Air Conditioner Version 1"});
  });

  app.get("/test",function(req,res){


    Command.getAll(function(err,docs){
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
      console.log(docs);
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
    //上一次的空调状态
    var lastData=[];
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

/*    socketArr.forEach(function(socket,index){
      socketArr[index].on("end",function(){

        console.log(socket._peername.address+"has connected");
        socketArr.slice(index,1);
        console.log(socketArr.length);
      })
    })*/
/*    for(var i=0;i<socketArr.length;i++){
      socketArr[i].on("end",function(){
        //console.log(socketArr[i]._peername.address);
        //console.log(socketArr[i]._peername.address+" has disconnected");
        socketArr.splice(i,1);
        console.log(socketArr[0]);
      })
    }*/

      //获取硬件设备传输数据
      socket.on("data",function(data){
        //console.log(new Buffer(data)+remoteIp);
/*
  @CRC校验操作
     
        var BinNum="";
        for(var i=0;i<data.length;i++){
          BinNum+=parseInt(data[i],16).toString(2);
        }
        //做模2除法
        var getData=new Buffer(data.length-1);
        for(var i=0;i<data.length-1;i++){
          getData[i]=data[i];
        }
        //多项式校验码
        var GX=new Buffer([40961]);
        //if(getData)
*/

        var funField=new Buffer(data[3]),funFieldValue=new Buffer(data[5]);
        var funValue="";
        //解析
        switch(funField){
          case 0x01:
              funValue=funFieldValue.toString()+"度";
              AirCondition.Switch=funValue;
              ControlState.update(remoteIP,Switch,AirCondition.Switch,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,Switch,AirCondition.Switch,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
          case 0x02:
              funValue=funFieldValue.toString()+"度";
              AirCondition.temperature=funValue;
              ControlState.update(remoteIP,temperature,AirCondition.temperature,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,temperature,AirCondition.temperature,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
          case 0x03:
              if(funFieldValue==0x01){
                funValue="制冷";
              }else if(funFieldValue==0x02){
                funValue="制热";
              }
              AirCondition.pattern=funValue;
              ControlState.update(remoteIP,pattern,AirCondition.pattern,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,pattern,AirCondition.pattern,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
          case 0x04:
              funValue=funFieldValue.toString()+"级";
              AirCondition.windSpeed=funValue;
              ControlState.update(remoteIP,windSpeed,AirCondition.windSpeed,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,windSpeed,AirCondition.windSpeed,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
          case 0x05:
              funValue="上下风";
              AirCondition.windDirection=funValue;
              ControlState.update(remoteIP,windDirection,AirCondition.windDirection,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,windDirection,AirCondition.windDirection,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
          case 0x06:
              funValue="左右风";
              AirCondition.windDirection=funValue;
              ControlState.update(remoteIP,windDirection,AirCondition.windDirection,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,windDirection,AirCondition.windDirection,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
          case 0xfe:
              funValue="状态查询";
              AirCondition.state=funValue;
              ControlState.update(remoteIP,state,AirCondition.state,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              Command.insertOne(remoteIP,state,AirCondition.state,function(err,doc){
                if(err){
                  alert(err.message);
                }
              })
              break;
        }

        })
    });



        process.on("message",function(msg){
          //解析传输数据
          var SwitchValue=msg.Switch,
              temperatureValue=msg.temperature,
              patternValue=msg.pattern,
              windSpeedValue=msg.windSpeed,
              windDirectionValue=msg.windDirection;
              //msg.a  refresh控制
			  //state=msg.state;

			 //数据拼接.
			var frameHeader=new Buffer([170,126]),frameID=new Buffer([0]),datalengthOne=new Buffer([1]),datalengthTwo=new Buffer([2]),frameEnd=new Buffer([126]);
			//前部数据码
			var SubBufferSwitch=Buffer.concat([frameHeader,frameID,new Buffer([1]),datalengthOne]);
			var SubBufferTemperature=Buffer.concat([frameHeader,frameID,new Buffer([2]),datalengthOne]);
			var SubBufferPattern=Buffer.concat([frameHeader,frameID,new Buffer([3]),datalengthTwo]);
			var SubBufferWindSpeed=Buffer.concat([frameHeader,frameID,new Buffer([4]),datalengthTwo]);
			var SubBufferUpDown=Buffer.concat([frameHeader,frameID,new Buffer([5]),datalengthOne]);
			var SubBufferLeftRight=Buffer.concat([frameHeader,frameID,new Buffer([6]),datalengthOne]);		  

			//上下风
			var windDirectionUDValue="";
			//左右风
			var windDirectionLRValue="";
			var buf_temperatureValue=new Buffer(1),
			    buf_SwitchValue=new Buffer(1),
			    buf_patternValue=new Buffer(1),
			    buf_windSpeedValue=new Buffer(1),
			    buf_windDirectionValue=new Buffer(1),
			    buf_windDirectionUDValue=new Buffer(1),
			    buf_windDirectionLRValue=new Buffer(1),
			    //CRC校验码
			    buf_CRCtemperature="",
			    buf_CRCSwitchValue="",
			    buf_CRCpatternValue="",
			    buf_CRCwindSpeedValue="",
			    buf_CRCwindDirectionUDValue="",
			    buf_CRCwindDirectionLRvalue="";


			var b_18=new Buffer([18]);
			var b_19=new Buffer([19]);
			var b_20=new Buffer([20]);
			var b_21=new Buffer([21]);
			var b_22=new Buffer([22]);
			var b_23=new Buffer([23]);
			var b_24=new Buffer([24]);
			var b_25=new Buffer([25]);
			var b_26=new Buffer([26]);
			var b_27=new Buffer([27]);
			var b_28=new Buffer([28]);
			var b_29=new Buffer([29]);
			var b_30=new Buffer([30]);
			var b_31=new Buffer([31]);
			var b_32=new Buffer([32]);
			//开关
			//温度
			  temperatureValue=parseInt(temperatureValue);
			  SwitchValue=temperatureValue;
			  buf_temperatureValue[0]=temperatureValue;
			  buf_SwitchValue[0]=SwitchValue;

			 

			  switch(temperatureValue){
			  case 18:   
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_18]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_18]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;    
			    //buf_CRCSwitchValue=new Buffer([224,70]);buf_CRCtemperature=new Buffer([16,70]);break;
			  case 19:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_19]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_19]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([33,134]);buf_CRCtemperature=new Buffer([209,134]);break;
			  case 20:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_20]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_20]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([96,68]);buf_CRCtemperature=new Buffer([144,68]);break;
			  case 21:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_21]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_21]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([161,132]);buf_CRCtemperature=new Buffer([81,132]);break;
			  case 22:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_22]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_22]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([225,133]);buf_CRCtemperature=new Buffer([17,133]);break;
			  case 23:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_23]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_23]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([32,69]);buf_CRCtemperature=new Buffer([208,69]);break;
			  case 24:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_24]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_24]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([96,65]);buf_CRCtemperature=new Buffer([144,65]);break;
			  case 25:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_25]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_25]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([161,129]);buf_CRCtemperature=new Buffer([81,129]);break;
			  case 26:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_26]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_26]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([225,128]);buf_CRCtemperature=new Buffer([11,128]);break;
			  case 27:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_27]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_27]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([32,64]);buf_CRCtemperature=new Buffer([208,64]);break;
			  case 28:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_28]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_28]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([97,130]);buf_CRCtemperature=new Buffer([145,130]);break;
			  case 29:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_29]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_29]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([160,66]);buf_CRCtemperature=new Buffer([80,66]);break;
			  case 30:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_30]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_30]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([224,67]);buf_CRCtemperature=new Buffer([16,67]);break;
			  case 31:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_31]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_31]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([33,131]);buf_CRCtemperature=new Buffer([209,131]);break;
			  case 32:
			    SubBufferSwitch=Buffer.concat([SubBufferSwitch,b_32]);
			    SubBufferTemperature=Buffer.concat([SubBufferTemperature,b_32]);
			    buf_CRCSwitchValue=resortCRC(SubBufferSwitch);
			    buf_CRCtemperature=resortCRC(SubBufferTemperature);
			    break;
			    //buf_CRCSwitchValue=new Buffer([97,147]);buf_CRCtemperature=new Buffer([145,147]);break;
			  }
			
			//模式
			switch(patternValue){

			  case "cold":
			    SubBufferPattern=Buffer.concat([SubBufferPattern,new Buffer([1]),new Buffer([temperatureValue])]);
			    buf_CRCpatternValue=resortCRC(SubBufferPattern);
			    break;
			    //buf_patternValue[0]=1;buf_CRCpatternValue=new Buffer([0,75]);break;
			  case "hot":
			    SubBufferPattern=Buffer.concat([SubBufferPattern,new Buffer([2]),new Buffer([temperatureValue])]);
			    buf_CRCpatternValue=resortCRC(SubBufferPattern);
			    break;
			    //buf_patternValue[0]=2;buf_CRCpatternValue=new Buffer([64,74]);break;
			}
			//风速
			switch(windSpeedValue){
			  case "one":
			    SubBufferWindSpeed=Buffer.concat([SubBufferWindSpeed,new Buffer([1]),new Buffer([temperatureValue])]);
			    buf_CRCwindSpeedValue=resortCRC(SubBufferWindSpeed);
			    break;
			  case "two":
			    SubBufferWindSpeed=Buffer.concat([SubBufferWindSpeed,new Buffer([2]),new Buffer([temperatureValue])]);
			    buf_CRCwindSpeedValue=resortCRC(SubBufferWindSpeed);
			    break;
			  case "three":
			    SubBufferWindSpeed=Buffer.concat([SubBufferWindSpeed,new Buffer([3]),new Buffer([temperatureValue])]);
			    buf_CRCwindSpeedValue=resortCRC(SubBufferWindSpeed);
			    break;
			  case "four":
			    SubBufferWindSpeed=Buffer.concat([SubBufferWindSpeed,new Buffer([4]),new Buffer([temperatureValue])]);
			    buf_CRCwindSpeedValue=resortCRC(SubBufferWindSpeed);
			    break;
			}
			//风向
			var WDCommand="";
			switch(windDirectionValue){
			  case "upDown":
			    SubBufferUpDown=Buffer.concat([SubBufferUpDown,new Buffer([temperatureValue])]);
			    buf_CRCwindDirectionUDValue=resortCRC(SubBufferUpDown);
			    WDCommand=Buffer.concat([SubBufferUpDown,buf_CRCwindDirectionUDValue,frameEnd]);
			    break;
			  case "leftRight":
			    SubBufferLeftRight=Buffer.concat([SubBufferLeftRight,new Buffer([temperatureValue])]);
			    buf_CRCwindDirectionLRValue=resortCRC(SubBufferUpDown);
			    WDCommand=Buffer.concat([SubBufferLeftRight,buf_CRCwindDirectionLRValue,frameEnd]);
			    break;
			}
			
			
			//开关
			var SCommand=Buffer.concat([SubBufferSwitch,buf_CRCSwitchValue,frameEnd]);
			//var SCommand=Buffer.concat([frameHeader,frameID,new Buffer([1,1,18,224,70,126])]);

			//温度
			var TCommand=Buffer.concat([SubBufferTemperature,buf_CRCtemperature,frameEnd]);
			//var TCommand=Buffer.concat([frameHeader,frameID,new Buffer([2,1,18,16,70,126])]);

			//模式
			var PCommand=Buffer.concat([SubBufferPattern,buf_CRCpatternValue,frameEnd]);
			//var PCommand=Buffer.concat([frameHeader,frameID,new Buffer([3,2,1,18,59,13,126])])

			//风速
			var WSCommand=Buffer.concat([SubBufferWindSpeed,buf_CRCwindSpeedValue,frameEnd]);
			//var WSCommand=Buffer.concat([frameHeader,frameID,new Buffer([4,2,1,18,58,121,126])]);

			
			//上下风
			//var finalCommand=Buffer.concat([SCommand,TCommand,PCommand,WSCommand,UPPER]);
			var finalCommand=Buffer.concat([SCommand,TCommand,PCommand,WSCommand,WDCommand]);
			//向硬件发送数据
		
		//单条控制命令
		if(msg.a){
			//本次控制数据
			var thisData=[temperatureValue,patternValue,windSpeedValue,windDirectionValue];
			//发生变化的控制命令
			var changeData=[];

			//本次控制命令
			var changeCommand=[TCommand,PCommand,WSCommand,WDCommand];

			var GOGO=[];
			for(var i=0;i<thisData.length;i++){
				//查看修改状态
				changeData[i]=thisData[i]==lastData[i];
				//保存最近一次修改的命令(一定要保存)
				lastData[i]=thisData[i];
			}
			
			for(var i=0;i<changeData.length;i++){
				if(changeData[i]==false){
					GOGO.push(changeCommand[i]);
				}
			}

			switch(GOGO.length){
				case 0:finalCommand=Buffer.concat([new Buffer([1])]);break;
				case 1:finalCommand=Buffer.concat([GOGO[0]]);break;
				case 2:finalCommand=Buffer.concat([GOGO[0],GOGO[1]]);break;
				case 3:finalCommand=Buffer.concat([GOGO[0],GOGO[1],GOGO[2]]);break;
				case 4:finalCommand=Buffer.concat([GOGO[0],GOGO[1],GOGO[2],GOGO[3]]);break;
			}

		  //发送数据
          if(msg.number101_f=="true" && msg.number101_b=="true"){
              socketArr.forEach(function(socket,index){
                socket.write(finalCommand);
              })
          }else if(msg.number101_f=="true"){
            socketArr[0].write(finalCommand);
          }else if(msg.number101_b=="true"){
            socketArr[1].write(finalCommand);
          }
          console.log(finalCommand);  

		}
		//开关命令
		else{
			lastData=[temperatureValue,patternValue,windSpeedValue,windDirectionValue];

         //发送数据
          if(msg.number101_f=="true" && msg.number101_b=="true"){
              socketArr.forEach(function(socket,index){
                socket.write(finalCommand);
              })
          }else if(msg.number101_f=="true"){
            socketArr[0].write(finalCommand);
          }else if(msg.number101_b=="true"){
            socketArr[1].write(finalCommand);
          }  
          //socketArr[0].write(finalCommand);
          console.log(finalCommand);
    	}    
    })
	
    tcp.listen(8234,function(){
      console.log("TCP Server is on the port of 8234");
    })
}




