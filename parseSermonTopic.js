function parseSermonTopic(s) {

  var a0 = [];

  //var str1 = ",證道              Sermon  *「你們是活石」* *You Are Living Stones*";
  //var str2 = ",證道               Sermon  *「教會與傳福音」* *“The Church and Evangelism”*";
  //var str3 = ",證道               Sermon  *「**教會與福音」**“**The Church and the Gospel”*"
  //var str4 = ",證道              Sermon  *「普世歡騰」*"
  //var str5 = ",證道               Sermon  *「教會與真道」* *“The Church and The Truth”*"
  //var str6 = ",證道              Sermon  『*恩上加恩』*"
  //var str7 = ",證道              Sermon  『*人望高處』*"
  //var str8 = ",證道               Sermon  *「**剛強的靈」*"
  //var str9 = ",證道              Sermon  『*試煉中的喜樂』*"
  //var str10 = ",證道              Sermon  『*你的馬其頓在哪裏？』** “Where Is Your Macedonia?”*"
  //var str11 = ",證道              Sermon  *「尋找我們下一位牧師：禱告* *」* *“Finding Our Next Pastor:
  //               ,Prayer”*"

  //array_str.push(str1, str2, str3, str4, str5, str6, str7, str8, str9);
  //array_str.push(str1);
  //Logger.log(array_str)
  
  logMessage(`${getCallStackTrace()}: sermon topic input = ${s}`)
  //var a1 = s.replaceAll("\n", " ");
  //logMessage(arguments.callee.name + ": a1 = %s", a1)
  //var a2 = a1.replaceAll("*", "");
  //logMessage(arguments.callee.name + ": a2 = %s", a2)
  //a0 = a2.split("Sermon");
  //a0 = s.replaceAll("\n", " ").replaceAll("*", "").split("Sermon");
  //logMessage(arguments.callee.name + ": a00 = %s", a0[0])
  //logMessage(arguments.callee.name + ": a01 = %s", a0[1])
  a0 = s.replace(/\n/g, " ").replaceAll("*", "").split("Sermon");
  if (a0[1].toString().match("』")) {
      var return1 = a0[1].replace("』", "』\n");
    } else if (a0[1].toString().match("」")) {
      var return1 = a0[1].replace("」", "」\n");
    } else {
      // return the whole thing
      var return1 = a0[1];
    }
  logMessage(`${getCallStackTrace()}: return1 = ${return1}`)
  return return1

}
