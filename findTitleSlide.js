function findTitleSlide(deck, titleInput) {
  const title = titleInput.trim();  // Clean up the title input
  const slides = deck.getSlides();  // Get all slides from the deck
  const slidesLength = slides.length;
  let foundSlide = null;

  for (let i = 0; i < slidesLength; i++) {
    const elements = slides[i].getPageElements();  // Get elements from the current slide
    
    for (const element of elements) {
      //logMessage(${getCallStackTrace()}: + ": element.getPageElementType = %s for slide %d", element.getPageElementType(), i);
      if (element.getPageElementType() == "SHAPE") {
        const text = element.asShape().getText().asString().replace("\n", "").trim();  // Clean up text

        // Debugging statement to help understand what's being found
        //logMessage(`${getCallStackTrace()}: Slide ${i}, Element ${element}: Text = "${text}"`);
        
        if (text === title) {
          logMessage(`${getCallStackTrace()}: Found it! Slide ${i} with title "${text}"`);
          foundSlide = slides[i];
          break;  // Exit inner loop once title is found
        }
      }
    }

    if (foundSlide) {
      break;  // Exit outer loop once slide is found
    }
  }

  if (foundSlide) {
    logMessage(`${getCallStackTrace()}: Find title \"${title}\"`);
    return foundSlide;  // Return deck and found slide
    
  } else {
    logMessage(`${getCallStackTrace()}: Sorry, can't find title "${title}" on any slide of the deck!`);
    return null;  // Return deck and null if slide not found
  }
}

