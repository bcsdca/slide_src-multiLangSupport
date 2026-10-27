function processPassage(text) {
  
  //cleanup all the unwanted phrase at the end if it existed
  //parsePassage will also do some clean up at the end of the line, if it was not clean up completely here
  text = text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+(thanks|thank you|amen|please|pls|see).*$/i, "")
    .replace(/\.\s+[A-Za-z].*$/, "") //fixing this "詩篇 Psalms 86:8-12. See you all coming Sunday."
    .replace(/[.。；;，,:：]+$/, "") //fixing any punctuation mark left behind

  logMessage(`${getCallStackTrace()}: After all the passage string cleanup = "${text}"`);
  
  // ONLY splitting responsibility
  var passage = splitPassage(text);

  // parsePassage() returns 2D array
  var array_return2 = [];
  array_return2.push(parsePassage(passage));

  // flatten to 1D array
  var array_return1 = array_return2.reduce(function (flat, current) {
    return flat.concat(current);
  }, []);

  logMessage(
    `${getCallStackTrace()}: Returning passage array = ${JSON.stringify(array_return1)}`
  );

  return array_return1;
}