//console.log(process.argv);
const fs=require("fs");
//var filePath=process.argv[2];
var newS;
let times = [];
let lengths = [];
let last="";//side effect ,
let start="X0 Y0"; //another side effect :-(
let totalTime = 0;
let moveTime = 0;
let cutTime = 0;
var filePath="solarSystem.svg";
const svg = fs.readFileSync(filePath).toString();
var res = svg.split("\r\n");
res=(path2gcode(res.join("")).join("\n"))
fs.writeFileSync('solarSystem.gcode', res); //Main Gcode output
fs.writeFileSync('Times.csv', times.join("\n")); //Times output
fs.writeFileSync('Lengths.tab', lengths.join("\n")); //tab file of lengths


function apply(dataArray,funct,accum=[]) {
    if (dataArray.length === 0) return accum;
    accum.push(funct(dataArray.shift()));
    return apply(dataArray, funct, accum);
}


function path2gcode(source){
    source = processPathLettersIntoArray(source);
    source = source.map(x => filterArray(x));
    source = source.filter(x => x !== undefined);
    source = apply(source, x=>mapGroup(x));
    source = addExtras(source);
    return source;
}

function addExtras(source){
    source.unshift("M4 S1000");
    source.unshift("G0 X0 Y0 F1000");
    source.push("G0 X0 Y0 F200");
    source.push("(things in brackets are comments)");
    source.push("\n");
    let finalDistance = xyDistance(last, "0,0");
    let finalTime = (finalDistance / 200) * 60;
    totalTime += finalTime;
    moveTime += finalTime;
    source.push("(move="+moveTime+" cut="+cutTime+")");
    source.push("(total time)");
    source.push("("+totalTime+")");
    return source;
}

function gcodeXY(source){
    source = source.split(',');
    source[0] = "X".concat(source[0]);
    source[1] = "Y".concat(source[1]);
    source = source.join(' ');
    return source;
}


function mapGroup(grp){
    let s=grp.split(" ");
    let distance;
    let time;
    if (s[0]==="M"){
        start=s[1];
        if(last !== ""){ //If last is set
            distance = xyDistance(last, start);
        }
        else{
            distance = xyDistance("0,0", start); //Initial distance from origin
        }
        time = distance / 200;
        time = time * 60;
        totalTime += time;
        moveTime += time;

        newS = start;
        last=s[1];
        return "G0 F200 "+gcodeXY(start);
    }
    else if (s[0]==="L"){
        start=s[1];
        distance = xyDistance(last, start);
        lengths.push(distance);
        time = distance / 100;
        time = time * 60;
        times.push(time);
        totalTime += time;
        cutTime += time;
        last=s[1];
        return "G1 F100 "+gcodeXY(start);
    }
    else if (s[0]==="z"){
        start = s[1];
        distance = xyDistance(last, newS);
        lengths.push(distance);
        time = distance / 100;
        time = time * 60;
        times.push(time);
        totalTime += time;
        cutTime += time;
        last=newS;
        return "G1 F100" + ' ' + gcodeXY(newS) + " (Z)";
    }
    else if(s[0] === "5"){
        return "M5";
    }
    else if(s[0] === "4"){
        return "M4";
    }
    return grp;
}

function replaceAll(source,match,replace){
    return source.replace(new RegExp(match, 'g'), replace);
}


function processPathLettersIntoArray(source){
    source = replaceAll(source, "zM", "z M");
    source = source.split(" ");
    source = append(source);
    return source;
}

function xyDistance(from,to){
    var s=from.split(",");
    var x1=parseFloat(s[0]);
    var y1=parseFloat(s[1]);
    var p=to.split(",");
    var x2=parseFloat(p[0]);
    var y2 = parseFloat(p[1]);
    var dt = Math.sqrt( (x2-x1)**2+(y2-y1)**2);
    return dt;
}


function filterArray(array){
    let s = array.split(" ");
    if (s[0] === "M" || s[0] === "L" || s[0] === "z" || s[0] === "5" ||
    s[0] === "4"){
        return array;
    }
}

function append(array, accumulator = []){
    if (array.length === 0)
    {
        return accumulator;
    }
    if(array[0].includes("z"))
    {
        accumulator.push("z");
        array.shift();
    }
    else if(array[0].includes("M"))
    {
        accumulator.push("5");
        accumulator.push("M ".concat(array[1]).concat(" "));
        accumulator.push("4");
        array.shift();
        array.shift();
    }
    else
    {
        accumulator.push(array[0].concat(" ").concat(array[1]).concat(" "));
        array.shift();
        array.shift();
    }
    return append(array, accumulator);
}



