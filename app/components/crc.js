/* 
* @Author: xl
* @Date:   2015-10-21 21:37:34
* @Last Modified by:   xl
* @Last Modified time: 2015-10-22 23:42:00
*/

function DecToBinTail(dec, pad)
{
    var bin = "";
    var i;
    for (i = 0; i < pad; i++)
    {
        dec *= 2;
        if (dec>= 1)
        {
            dec -= 1;
            bin += "1";
        }
        else
        {
            bin += "0";
        }
    }
    return bin;
}
function DecToBinHead(dec,pad)
{
    var bin="";
    var i;
    for (i = 0; i < pad; i++)
    {
        bin = (parseInt(dec % 2).toString()) + bin;
        dec /= 2;
    }
    return bin;
}
function get_float_hex(decString)
{
    var dec = decString;
    var sign;
    var signString;
    var decValue = parseFloat(Math.abs(decString));
    if (decString.toString().charAt(0) == '-')
    {
        sign = 1;
        signString = "1";
    }
    else
    {
        sign = 0;
        signString = "0";
    }
    if (decValue==0)
    {
        fraction = 0;
        exponent = 0;
    }
    else
    {
        var exponent = 127;
        if (decValue>=2)
        {
            while (decValue>=2)
            {
                exponent++;
                decValue /= 2;
            }
        }
        else if (decValue<1)
        {
            while (decValue < 1)
            {
                exponent--;
                decValue *= 2;
                if (exponent ==0)
                    break;
            }
        }
        if (exponent!=0) decValue-=1; else decValue /= 2;

    }
    var fractionString = DecToBinTail(decValue, 23);
    var exponentString = DecToBinHead(exponent, 8);
    return parseInt(signString + exponentString + fractionString, 2).toString(16);
}



