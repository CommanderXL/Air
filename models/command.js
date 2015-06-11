var mongodb=require("./db.js");
var async=require("async");

function Command(AllCommand){
	this.Switch=AllCommand.Switch,
	this.temperature=AllCommand.temperature,
	this.pattern=AllCommand.pattern,
	this.windSpeed=AllCommand.windSpeed,
	this.windDirection=AllCommand.windDirection,
	this.state=AllCommand.state
}

module.exports=Command;

Command.prototype.save=function(callback){
	var date=new Date();
	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
	}
	//存入数据库的数据
	var command={
		remoteIP:this.remoteIP,		
		time:time,
		Switch:this.Switch,
		temperature:this.temperature,
		pattern:this.pattern,
		windSpeed:this.windSpeed,
		windDirection:this.windDirection,
		state:this.state
	}
		mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("command",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(command,{safe:true},function(err,command){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,command[0]);//成功，并返回存储后的文档
			})
		})
	})
}
//插入新操作值.
Command.insertOne=function(remoteIp,item,itemData,callback){
	var date=new Date();
	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
	}
	var command={
		remoteIP:remoteIP,
		time:time,
		item:itemData
	}
	async.waterfall([
			function(cb){
				mongodb.open(function(err,db){
					cb(err,db);
				})
			},function(db,cb){
				db.collection("command",function(err,collection){
					cb(err,collection);
				})
			},function(collection,cb){
				collection.insert(command,function(err,docs){
					cb(err,docs);
				})
			}
		],function(err,doc){
			mongodb.close();
			callback(null,doc);
		})
}


Command.getOne=function(callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("command",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find({},{"_id":false},function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			})
		})
	})
}

//获取所有的数据
Command.getAll=function(callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("command",function(err,collection){
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

