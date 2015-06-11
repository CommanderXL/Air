var mongodb=require("./db.js");
//引入async库
var async=require("async");


//构造函数
//楼层，房间，编号，状态(开关),温度，模式，风速，风向
function ControlState(allState){
	this.IP=allState.remoteIP;
	this.Switch=allState.Switch;
	this.temperature=allState.temperature;
	this.pattern=allState.pattern;
	this.windSpeed=allState.windSpeed;
	this.windDirection=allState.windDirection;
	this.state=allState.state;
}

module.exports=ControlState;

ControlState.prototype.save=function(callback){
	var date=new Date();
	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
	}
	var controlState={
		remoteIP:this.remoteIP,
		time:time,
		Switch:this.Switch,
		temperature:this.temperature,
		pattern:this.pattern,
		windSpeed:this.windSpeed,
		windDirection:this.windDirection,
		state:this.state,
	}
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("testState",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(controlState,{safe:true},function(err,controlState){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,controlState[0]);//成功，并返回存储后的文档
			})
		})
	})
}

//更新数据库信息
ControlState.update=function(remoteIP,item,itemData,callback){
	async.waterfall([
			function(cb){
				mongodb.open(function(err,db){
					cb(err,db);
				})
			},function(db,cb){
				db.collection("testState",function(err,collection){
					cb(err,collection);
				})
			},function(collection,cb){
				collection.update({remoteIP:remoteIP},{$set:{item:itemData}},function(err,doc){
					cb(err,doc);
				})
			}
		],function(err,doc){
			mongodb.close();
			callback(null,doc);
		})
}

//获取所有的数据
ControlState.getAll=function(callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("testState",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//取不含_id字段的数据
			collection.find({},{"_id":false,"time":false}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				/*
				var result=[];
				docs.forEach(function(doc,index){
					doc=JSON.stringify(doc);
					result.push(doc);
					*/
				
				callback(null,docs);
			})
		})
	})
}
//查询所有的状态
ControlState.getTestState=function(callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("testState",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find({},{"_id":false}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			})
		})
	})
}
//查询remoteIP是否存在
ControlState.getIP=function(remoteIP,callback){
	async.waterfall([
			function(cb){
				mongodb.open(function(err,db){
					cb(err,db);
				})
			},
			function(db,cb){
				db.collection("testState",function(err,collection){
					cb(err,collection);
				})
			},
			function(collection,cb){
				collection.findOne({remoteIP:remoteIP},function(err,doc){
					cb(err,doc);
				})
			}
		],function(err,doc){
			mongodb.close();
			callback(err,doc);
		})
};
