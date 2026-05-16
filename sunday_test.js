function sunday_test() {
  var today = new Date();
  var today_temp = new Date();

  today = new Date();

  today_temp = new Date();

  //var coming_sunday_offset_from_today = 7 - today.getDay()
  //var coming_sunday = Utilities.formatDate(new Date(today_temp.setDate(today_temp.getDate() + coming_sunday_offset_from_today)), Session.getScriptTimeZone(), 'MM/dd/yyyy');
  //var coming_sunday = new Date(today_temp.setDate(today_temp.getDate() + coming_sunday_offset_from_today));
  Logger.log("Today is %s: ", today)
  for (var i = 0; i < 60; i++) {
    if (i == 0) {
      var coming_sunday_offset_from_today = 7 - today.getDay()
      var coming_sunday = new Date(today_temp.setDate(today_temp.getDate() + coming_sunday_offset_from_today));
    }
    else {
      var coming_sunday = new Date(today_temp.setDate(today_temp.getDate() + 7));
    }
        
    var date = coming_sunday.getDate();
    var day = coming_sunday.getDay();
    //var coming_sunday_WeekOfMonth = Math.ceil((date - 1 - day) / 7);
    var coming_sunday_WeekOfMonth = Math.ceil(date / 7);
    Logger.log("Coming sunday is %s, and the WeekOfMonth is %d ", coming_sunday, coming_sunday_WeekOfMonth)
  }
  //var date = coming_sunday.getDate();
  //var day = coming_sunday.getDay();
  //var coming_sunday_WeekOfMonth = Math.ceil((date - 1 - day) / 7);
  //var coming_sunday_WeekOfMonth = Math.ceil(date / 7);
  //Logger.log("today is %s, sunday_offset %d, coming sunday is %s, weekofmonth is %d ", today, coming_sunday_offset_from_today, coming_sunday, coming_sunday_WeekOfMonth)

}
