function slide_remove_copy(src,dst) {
  let srcId = src;
  let dstId = dst;
  var srcSlide = SlidesApp.openById(srcId);
  var dstSlide = SlidesApp.openById(dstId);
  let src_slides = srcSlide.getSlides();
  let dst_slides = dstSlide.getSlides();
  let src_slide_length = srcSlide.getSlides().length
  let dst_slide_length = dstSlide.getSlides().length

  //remove all the destination slides
  for (let i = 0; i < dst_slide_length; i++) {
    dst_slides[i].remove();
    Logger.log("Removing old slide = " +i + ", the total to remove is " + dst_slide_length);
  }
    

  //copy from src slides to destination slides
  for (let i = 0; i < src_slide_length; i++) {
    dstSlide.appendSlide(src_slides[i]);
    Logger.log("Appending backup template slide = " +i + ", the total to append is " + src_slide_length);
  }
  
}
