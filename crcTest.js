
/**
 * Created by XRene on 2015/12/19.
 */
var fs = require('fs');
var crc = require('crc');

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
        console.log(new Buffer([c_buf1, c_buf2]));
    }

    return c_buf2 + ' ' + c_buf1;
}

var tempArr = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    windSpeedArr = [1, 2, 3],
    windDirectionArr = [1, 2, 3],
    patternArr = [1, 2],
    switchArr = [1, 2],
    airType = [1, 2];

var airTypeStr = '',
    tempStr = '',
    windSpeedStr = '',
    windDirectionStr = '',
    patternStr = '',
    switchStr = '';

var finnalStr = '';

var frameHeader = new Buffer([170, 126]), frameSaved = new Buffer([0, 0, 0, 0, 0]);

for(var i = 0; i < airType.length; i++) {
    airTypeStr = (airType[i] === 1 ? '海信' : '格力');
    for(var j = 0; j < switchArr.length; j++) {
        switchStr = (switchArr[j] === 1 ? '开' : '关');
        for(var k = 0; k < patternArr.length; k++) {
            patternStr = (patternArr[k] === 1 ? '制冷': '制热');
            for(var l = 0; l < windSpeedArr.length; l++) {
                windSpeedStr = windSpeedArr[l] + '级风';
                for(var m = 0; m < windDirectionArr.length; m++) {
                    if(windDirectionArr[m] === 1) {
                        windDirectionStr = '上下风';
                    } else if(windDirectionArr[m] === 2) {
                        windDirectionStr = '左右风';
                    } else {
                        windDirectionStr = '上下左右风';
                    }
                    for(var o = 0; o < tempArr.length; o++) {
                        tempStr = tempArr[o] + '度';
                        finnalStr = airTypeStr + ' ' + switchStr + ' ' + patternStr + ' ' + windSpeedStr + ' ' + windDirectionStr + ' ' + tempStr
                                    + ' '
                                    + String(resortCRC(Buffer.concat([frameHeader, new Buffer([airType[i]]), new Buffer([switchArr[j]]), new Buffer([patternArr[k]]), new Buffer([windSpeedArr[l]]), new Buffer([windDirectionArr[m]]), new Buffer([tempArr[o]]), frameSaved])));
                        fs.appendFile('crc.txt', finnalStr + '\r\n', 'utf-8', function (err) {
                            return;
                        });
                    }
                }
            }
        }
    }
}



