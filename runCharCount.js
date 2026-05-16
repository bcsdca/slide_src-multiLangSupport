var input = `Hi! Everyone, Thank you for serving at our Easter Sunday Joint Worship Service this Sunday, April 5 , at 11:00 AM . We look forward to a joyous celebration of the Lord’s resurrection. In addition to the in-person worship in the Sanctuary, the service will be livestreamed on YouTube: http://cec-sd.org/cantonese-worship Attached is the bulletin with the worship order and the announcements for your reference. You have been scheduled to chair worship, lead singing, usher/welcome, or assist with audio-visual duties. Below are the worship order and verbal announcements. 序樂 Prelude 宣召 Call To Worship 宣禱 Invocation 詩歌敬拜 Worship with Songs &amp; Praises 奉獻敬拜 Worship with Tithes &amp; Offering 牧禱 Pastoral Prayer 讀經 Scripture Reading 約翰福音 John 3:1-17 證道 Sermon 「復活的新生命 — 尼哥底母其人 」 “A Resurrected New Life—The Pharisees Nicodemus” 講員 Speaker 林楹俊牧師 Pastor Allen Lin 聖餐 Sacrament of the Lord’s Supper 歡迎及報告 Welcome / Announcements * 祝福 Benediction 殿樂 Postlude MC: Philemon Chan On Stage Cantonese-to-Mandarin Translator: Pastor Joseph Liang Translator&#39;s In-Ear Headset and Flat Screen Monitor Setup: James Coe Jr Song Leader: Junfei Tian Pianist: Helen Gao Usher/ Welcome: Melissa To, Michael To, Joyce Sheu, Jong Sheu PPT Preparation: Elton Yu Camera: Le Chu Sound Control: Issac Siu PowerPoint Control: Moon Tang YouTube/On-Line Sound Control: Cheong Yik M.C. - Please verbally highlight the following during announcement time: 1. # 2 粵語長青團契 2. # 3 粵語部禱告月會 3. # 4 湯杓事工 4. # 5 感謝蕭牧師紀念冊 5. # 6 主任牧師就任典禮 Thank you again for your faithful service. We look forward to celebrating together! Celebrating Christ, Emily Ip Administrative/Pastoral Assistant Chinese Evangelical Church of San Diego Email: emilyip@cec-sd.org
`;

function runCharCount() {
  var result = countCharacters(input);
  Logger.log(result);
}

function countCharacters(input) {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }
  return [...input].length; // counts all characters correctly
}