//Closure (PART 1)
// 使用closure做简单cache策略
function isPrimeCache() {
    const cache = new Map();

    return function isPrime(v){
        if(cache.get(v)) return cache.get(v)

        let res
        if (v <= 3) {
            res = v > 1;
        }else if (v % 2 == 0 || v % 3 == 0) {
            res = false;
        } else {
            var vSqrt = Math.sqrt(v);
            for (let i = 5; i <= vSqrt; i += 6) {
                if (v % i == 0 || v % (i + 2) == 0) {
                    res = false;
                }
            }
            res = true;
        }

        cache.set(v, res);
        return res
    }
}

//Closure (PART 2)
function toggle(...words){
    let index = 0

    return function repeatedlyPlay(){
        const res = words[index]
        index = (index + 1) % (words.length)
        return res
    }
}


//Closure (PART 3)
function calculator() {
    let mark = "", // 操作符
      leftOperand = "", // 左操作数
      rightOperand = "", // 右操作数
      isEnd = false;
  
    // 进入的v都是字符串
    return function calc(v) {
      // 是数字
      if (/[0-9]/.test(+v)) {
        if (isEnd) {
          leftOperand = [];
          isEnd = false;
          leftOperand += v;
        } else if (leftOperand.length === 0) {
          leftOperand += v;
        } else {
          rightOperand += v;
        }
  
        return v;
      }
  
      isEnd && (isEnd = false);
      // 如果是标点符号，计算一下之前结果
      if (/[\+\-\*\/]/.test(v)) {
        // 标点符号首次进入
        if (!mark) {
          mark = v;
        } else {
          // 标点符号二次进入
          const res = calcRes(leftOperand, rightOperand, mark);
          leftOperand = String(res);
          rightOperand = "";
          mark = v;
        }
  
        return v;
      }
  
      // 等号计算结果
      if (v === "=") {
        const res = calcRes(leftOperand, rightOperand, mark);
        leftOperand = String(res);
        rightOperand = "";
        mark = "";
        isEnd = true;
  
        return res;
      }
    };
}

function workCalc(calc, keys) {
    return [...keys].reduce(function showDisplay(display, key) {
        var ret = String(calc(key));
        return display + (ret != "" && key == "=" ? "=" : "") + ret;
    }, "");
}

function calcRes(left, right, mark) {
    if (left === "ERR" || right === "ERR") {
        return "ERR";
    } else {
        return formatTotal(eval(`${left}${mark}${right}`));
    }
}

// 结果的格式化处理
function formatTotal(display) {
    if (Number.isFinite(display)) {
        // constrain display to max 11 chars
        let maxDigits = 11;
        // reserve space for "e+" notation?
        if (Math.abs(display) > 99999999999) {
        maxDigits -= 6;
        }
        // reserve space for "-"?
        if (display < 0) {
        maxDigits--;
        }

        // whole number?
        if (Number.isInteger(display)) {
        display = display.toPrecision(maxDigits).replace(/\.0+$/, "");
        }
        // decimal
        else {
        // reserve space for "."
        maxDigits--;
        // reserve space for leading "0"?
        if (Math.abs(display) >= 0 && Math.abs(display) < 1) {
            maxDigits--;
        }
        display = display.toPrecision(maxDigits).replace(/0+$/, "");
        }
    } else {
        display = "ERR";
    }
    return display;
}

var calc = calculator();

console.log(workCalc(calc, "4+3=")); // 4+3=7
console.log(workCalc(calc, "+9=")); // +9=16
console.log(workCalc(calc, "*8=")); // *5=128
console.log(workCalc(calc, "7*2*3=")); // 7*2*3=42
console.log(workCalc(calc, "1/0=")); // 1/0=ERR
console.log(workCalc(calc, "+3=")); // +3=ERR
console.log(workCalc(calc, "51=")); // 51
  
// Modules
function calculator() {
    let mark = "", // 操作符
      leftOperand = "", // 左操作数
      rightOperand = "", // 右操作数
      isEnd = false;
  
    // 结果值计算
    function calcRes(left, right, mark) {
      if (left === "ERR" || right === "ERR") {
        return "ERR";
      } else {
        return formatTotal(eval(`${left}${mark}${right}`));
      }
    }
  
    // 结果的格式化处理
    function formatTotal(display) {
      if (Number.isFinite(display)) {
        // constrain display to max 11 chars
        let maxDigits = 11;
        // reserve space for "e+" notation?
        if (Math.abs(display) > 99999999999) {
          maxDigits -= 6;
        }
        // reserve space for "-"?
        if (display < 0) {
          maxDigits--;
        }
  
        // whole number?
        if (Number.isInteger(display)) {
          display = display.toPrecision(maxDigits).replace(/\.0+$/, "");
        }
        // decimal
        else {
          // reserve space for "."
          maxDigits--;
          // reserve space for leading "0"?
          if (Math.abs(display) >= 0 && Math.abs(display) < 1) {
            maxDigits--;
          }
          display = display.toPrecision(maxDigits).replace(/0+$/, "");
        }
      } else {
        display = "ERR";
      }
      return display;
    }
  
    function number(v) {
      if (isEnd) {
        leftOperand = [];
        isEnd = false;
        leftOperand += v;
      } else if (leftOperand.length === 0) {
        leftOperand += v;
      } else {
        rightOperand += v;
      }
  
      return v;
    }
  
    function eq(v) {
      isEnd && (isEnd = false);
  
      const res = calcRes(leftOperand, rightOperand, mark);
      leftOperand = String(res);
      rightOperand = "";
      mark = "";
      isEnd = true;
  
      return res;
    }
  
    function oper(v) {
      isEnd && (isEnd = false);
  
      // 标点符号首次进入
      if (!mark) {
        mark = v;
      } else {
        // 标点符号二次进入
        const res = calcRes(leftOperand, rightOperand, mark);
        leftOperand = String(res);
        rightOperand = "";
        mark = v;
      }
  
      return v;
    }
  
    return {
      number,
      plus: oper,
      minus: oper,
      mult: oper,
      div: oper,
      eq
    };
  }
  
  function workCalc(calc, keys) {
    var keyMappings = {
      "+": "plus",
      "-": "minus",
      "*": "mult",
      "/": "div",
      "=": "eq"
    };
  
    return [...keys].reduce(function showDisplay(display, key) {
      var fn = keyMappings[key] || "number";
      var ret = String(calc[fn](key));
      return display + (ret != "" && key == "=" ? "=" : "") + ret;
    }, "");
  }
  
  var calc = calculator();
  
  console.log(workCalc(calc, "4+3=")); // 4+3=7
  console.log(workCalc(calc, "+9=")); // +9=16
  console.log(workCalc(calc, "*8=")); // *5=128
  console.log(workCalc(calc, "7*2*3=")); // 7*2*3=42
  console.log(workCalc(calc, "1/0=")); // 1/0=ERR
  console.log(workCalc(calc, "+3=")); // +3=ERR
  console.log(workCalc(calc, "51=")); // 51
  


