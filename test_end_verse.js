//determine the end verse of a book
//passing in "以弗所書 1
//returning the end verse number

function test_end_verse() {
  //var my_passage = p_c
  var my_passage = "以弗所書 1"
  //var my_passage = "Psalm 92"
  var a = [];

  a = my_passage.split(/\s+/);
  var book = a[0];
  var chapter = a[1]

  console.log(arguments.callee.name + ": Reading from the book of " + book + ", and chapter of " + chapter)
  var find_it = false
  //assuming the longest book don't have 200 verses
  for (i = 1; ((i < 200) && (!find_it)); i++) {
    //check for 2 verses return, if both are undefined, then it is end of chapter
    var one_verse_return1 = bible_gateway_1v_capture2(book, chapter, i)
    var one_verse_return2 = bible_gateway_1v_capture2(book, chapter, i + 1)
    if ((one_verse_return1 == undefined) && (one_verse_return2 == undefined)) {
      console.log(arguments.callee.name + ": Done, the end verse is %d for the chapter %d of this book %s !!!", i-1, chapter, book,);
      find_it = true;
      return i-1;
    } else {
      console.log(arguments.callee.name + ": The verse is \"%s\" for verse # %d of the chapter %d for the book %s", one_verse_return1, i, chapter, book,);
    }

  }
  
}

