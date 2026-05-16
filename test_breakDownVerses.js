function test_breakDownVerses() {
  const testInputs = [
    "10b,11-13",
    "1,3,5-7,10",
    "1,3",
    "3-10",
    "1-4",
    "4-8a",
    "2-5,8a",
    "10a",
    "8-10b",
    "1b,3,4-6",
    "1b-6",
    "1b-2a",
    "1b-3a"
  ];

  for (const input of testInputs) {
    //console.log(`Input: "${input}"`);
    breakDownVerses(input);
    //console.log("----");
  }
}


