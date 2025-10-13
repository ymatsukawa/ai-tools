## GOAL
High speed showing images on gui using golang.

## Why
App satisfies GOAL is not on github.

## SPEC
* use fyne v2; go gui
* Point on specific directory by user
* Read all images
  * Load to **on memory images**
  * avoid reading sub-directory
* gui command:
  * o : show loading window to directory path
  * n : previous image
    * if no image, stop
  * b : next image
* on memory size
   * 3GB
   * if over loading size is over 3GB, load sequentially
