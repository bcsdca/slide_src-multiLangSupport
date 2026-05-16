function test_extractLastNumber(inputString) {
    if (typeof inputString !== 'string') {
        return null;
    }
    
    // Match standalone single-digit numbers that are preceded or followed by non-word characters, spaces, or punctuation.
    var matches = inputString.match(/(?:^|\W)\d(?:\W|$)/g);  // Match digits preceded or followed by non-word characters

    // If there are exactly two matches, return the second match (index 1)
    if (matches && matches.length === 2) {
        return matches[1].replace(/\W/g, '');  // Return the second match
    }

    // If there are at least 3 matches or more, return the second-to-last one
    if (matches && matches.length > 2) {
        return matches[matches.length - 2].replace(/\W/g, '');  // Return the second-to-last match
    }

    // If there's only one match, return that digit
    return matches ? matches[0].replace(/\W/g, '') : null;
}

/*console.log(test_extractLastNumber("2. # 3 2025 年教會退修會")); // Output: "3"
console.log(test_extractLastNumber("7. 2025 年教會退修會")); // Output: "7"
//console.log(test_extractLastNumber("9. 3 年教會退修會")); // TBD, not working
console.log(test_extractLastNumber("2. 福音主日崇拜")); // Output: "2"
console.log(test_extractLastNumber("2. # 8 5年教會退修會")); // Output: "8"
console.log(test_extractLastNumber("2. # 4 77 年教會退修會")); // Output: "4"
console.log(test_extractLastNumber("2. # 5 7 年教會退修會")); // Output: "5"
*/
