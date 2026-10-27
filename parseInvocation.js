function parseInvocation(p) {

  var temp = p.replace(/[*]/g, "").split(/Call\s*to\s*worship\s*[*]*[:]/i)
  var text = temp[1];

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
    `${getCallStackTrace()}: Returning Invocation array = ${JSON.stringify(array_return1)}`
  );

  return array_return1;
}