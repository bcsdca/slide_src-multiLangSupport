function parseInvocation(p) {
  
  var array_return1 = [];
  var array_return2 = [];

  var temp = p.replace(/[*]/g, "").split(/Call\s*to\s*worship\s*[*]*[:]/i)
  var passage = temp[1].split(/；|;/);
  logMessage(`${getCallStackTrace()}: Start working on these Invocation passage = ${JSON.stringify(passage)}`)
  array_return2.push(parsePassage(passage));

  // Using reduce method to convert 2 dimension array array_return2 to 1 dimension array array_return1
  var array_return1 = array_return2.reduce(function (flat, current) {
    return flat.concat(current);
  }, []);
  
  logMessage(`${getCallStackTrace()}: Invocation passage array_return1 = ${JSON.stringify(array_return1)}`)
  return array_return1;

}