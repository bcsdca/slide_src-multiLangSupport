function test_processPassage(p) {

  var array_test = [];
  var array_return = [];

  var str1 = "以弗所書 Ephesians 1: 2-9";
  var str2 = "詩篇 Psalm 33:8-12";
  var str3 = "詩篇 Psalm 98";
  var str4 = "彼得前書 1 Peter 2:4-10";
  var str5 = "詩篇Psalm 34:1-3";
  var str6 = "彼得前書1 Peter 2:4-10";
  var str7 = "詩篇 Psalm : 146: 6-10";
  var str8 = "詩篇 Psalm 146: 6-10";
  var str9 = "歷代志上 1Chronicles 29:10b,11-13";
  var str10 = "歷代志上 1Chronicles 29:10b,11-13";
  var str11 = "以弗所書  esphesians 1:3-4; 提摩太後書 2Timothy 2:21";
  var str12 = "以弗所書  esphesians 1:3-4; 2:1-2";
  var str13 = "以弗所書  esphesians 1:3-4; 2:3";
  var str14 = "詩篇 Psalm 66:1-4.";
  var str15 = "詩篇 Psalm,86:5,8-12";
  var str16 = "";
  var str17 = "詩篇 Psalm 86:8-12.,";
  var str18 = "申命記 Deuteronomy 10:12-17";
  var str19 = "*約伯記* Job 42:1-5*"
  var str20 = "詩篇 Psalm 100:1-5";
  var str21 = "歷 代 志 上  I Chronicle 16:23-27";
  var str22 = "歷代志上  I Chronicle 16:23-27";
  var str23 = "詩篇 Psalm 63:1-5";
  var str24 = "启 示 录 Revelation 15:3-4";
  var str25 = "約翰一書 1 John 1:9; 路加福音 Luke 1:76-77";


  array_test.push(str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14, str15, str17, str18, str19, str20, str21, str22, str23, str24);
  //array_test.push(str1);

  for (var i = 0; i < array_test.length; i++) {
    logMessage(`${getCallStackTrace()}: Start working on these passage : "${array_test[i]}"`)
    array_return.push(processPassage(array_test[i]));
  }

  logMessage(`${getCallStackTrace()}: Returning from  processPassage function = ${JSON.stringify(array_return)}`)

}