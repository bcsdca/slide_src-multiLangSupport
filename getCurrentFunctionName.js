function getCurrentFunctionName() {
  const error = new Error();
  const stack = error.stack.split('\n');

  // stack[0] = "Error"
  // stack[1] = "    at getCurrentFunctionName (<file>:line:col)"
  // stack[2] = "    at yourFunctionName (<file>:line:col)"
  const callerLine = stack[2] || '';
  const match = callerLine.match(/at ([\w$]+) /);

  return match ? match[1] : 'anonymous';
}