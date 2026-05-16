function test_parseScripture() {

  //this is sourcing from parse_scripture3.gs
  //fixing the "以弗所書4" situation, no white space between book name and chapter number

  var array_str = [];
  var a0 = [];
  var a1 = [];
  var a2 = [];
  var a3 = [];
  var a4 = [];
  var array_return1 = [];
  var array_return = [];

  var str1 = ",讀經              Scripture Reading    *路加福音** 5:12-14*";
  var str2 = ",讀經              Scripture  Reading   *彼得前書** 1 Peter 2:4-10*";
  var str3 = ",讀經               Scripture  Reading *羅馬書**Romans 10:9-17*"
  var str4 = ",讀經               Scripture  Reading *哥林多前書** 1 Cor. 15:1-11*"
  var str5 = ",讀經              Scripture  Reading   *詩篇** Psalm 98*"
  var str6 = ",讀經               Scripture  Reading *提摩太後書**2 Tim 4:1-6*"
  var str7 = ",讀經              Scripture Reading *路加福音** Luke 17:11-19*"
  var str8 = ",讀經            Scripture Reading *腓立比書** Philippians 2:9-11*"
  var str9 = ",讀經              Scripture Reading    *雅各書** James 1:1-4**；**5:7-8*"
  var str10 = ",讀經               Scripture  Reading *提摩太後書** 1:1-7*"
  var str11 = ",讀經              Scripture  Reading   *創世記** Genesis 24:1*"
  var str12 = ",讀經              Scripture  Reading   *創世記** Genesis 24:1; 25:7-8*"
  var str13 = ",讀經              Scripture  Reading   *馬太福音**Matthew18:15-20*"
  var str14 = ",讀經               Scripture  Reading *使徒行傳** Acts 8:26-40*"
  var str15 = ",讀經               Scripture  Reading *使徒行傳** Acts 8:26*"
  var str16 = ",讀經               Scripture  Reading *使徒行傳** Acts 8:26*; *雅各書** James 1:1-4**"
  var str17 = ",讀經              Scripture  Reading   *腓利門書**Philemon 8-20**節*"
  var str18 = ",讀經               Scripture  Reading *提摩太前書**1 Tim 3:1-7*"
  var str19 = ",讀經              Scripture  Reading   *歌羅西書** Col 1:24-29; *歌羅西書** Col 2:1-5*"
  var str20 = ",讀經              Scripture  Reading   *歌羅西書** Col 1:24-2:5*"
  var str21 = ",讀經              Scripture Reading   *雅各書**4**:1-10 (James 4:1-10)*"
  var str22 = ",讀經              Scripture Reading   *詩篇** Psalm 136:1-3, 26*"
  var str23 = ",讀經              Scripture Reading   馬可福音   Mark 4:35-41;   馬太福音   Matthew 11:28-30"
  var str24 = ",讀經               Scripture  Reading *歌羅西書** 3:18-4:1*"
  var str25 = ",讀經              Scripture Reading 馬太福音21：1-11，15-16"
  var str26 = ",讀經               Scripture  Reading *歌羅西書** 3 : 18-20, 22 *"
  var str27 = ",讀經              Scripture  Reading   *腓利門書**Philemon 1:1-5*"
  var str28 = ",讀經              Scripture  Reading   *猶大書** 2-5**"
  var str29 = ",讀經              Scripture  Reading   *猶大書** 1:2-8**"
  var str30 = ",讀經               Scripture  Reading 約翰福音John 11:1-6；38-44";
  var str31 = ",讀經               Scripture  Reading 約翰福音John 11:1-6,38-44";
  var str32 = ",讀經               Scripture  Reading 約翰福音John 11:1-6；12:38-44";
  var str33 = ",讀經               Scripture  Reading 約翰福音John 11:1-6；11:38-44";
  //var str34 = ",讀經               Scripture  Reading 使徒行傳 Acts 15:36-39; 腓利門書 Philemon23-24; 提摩太後書 2 Timothy 4:9-11";
  var str35 = ",讀經               Scripture  Reading 使徒行傳 Acts 15:36-39; 腓利門書 Philemon:23-24; 提摩太後書 2 Timothy 4:9-11";
  var str36 = ",讀經              Scripture Reading 哥林多前書 1 Corinthians 13:4-8a";
  var str37 = ",讀經              Scripture Reading 哥林多前書 1 Corinthians 13:2-6,8b";
  var str38 = ",讀經              Scripture Reading 哥林多前書 1 Corinthians 13:2-6a,8b";


  //array_str.push(str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14, str15, str16, str17, str18, str19, str20, str21, str22, str23, str24, str25, str26, str27, str28, str29, str30,str31, str32, str33, str35, str36 );
  array_str.push(str36);


  var array_return2 = [];
  for (var i = 0; i < array_str.length; i++) {
    var temp = array_str[i].replace(/[*]/g, "").split("Reading")
    var passage = temp[1].split(/；|;/);
    console.log(arguments.callee.name + ": Start working on these passage : %s", JSON.stringify(passage))
    array_return2.push(parsePassage(passage));

  }

  // Using reduce method to convert 2 dimension array array_return2 to 1 dimension array array_return1
  var array_return1 = array_return2.reduce(function (flat, current) {
    return flat.concat(current);
  }, []);
  console.log(arguments.callee.name + " Scripture reading passage array_return from parse_scripture function = %s", JSON.stringify(array_return1))
  return array_return1;

}
