// Assuming song_masterSlide is a Slide object
function removeSlide() {

  if (song_masterSlide) {
    // Log basic properties
    logMessage("song_masterSlide exists.");

    // Log the slide ID
    try {
      logMessage("Slide ID: " + song_masterSlide.getObjectId());
    } catch (e) {
      logMessage("Unable to retrieve Slide ID: " + e.message);
    }

    // Log the number of elements on the slide
    try {
      logMessage("Number of Page Elements: " + song_masterSlide.getPageElements().length);
    } catch (e) {
      logMessage("Unable to retrieve Page Elements: " + e.message);
    }

    // Attempt to remove the slide
    try {
      // Get the index of the slide to remove it
      var slides = SlidesApp.getActivePresentation().getSlides();
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].getObjectId() == song_masterSlide.getObjectId()) {
          SlidesApp.getActivePresentation().removeSlide(slides[i]);
          logMessage("song_masterSlide removed successfully.");
          break;
        }
      }
    } catch (e) {
      logMessageError("Error removing song_masterSlide: " + e.message);
    }
  }
}
