export const addSwipeEvent = (elem, callback, threshold = 10) => {
  let startX,
    startY,
    distX,
    distY,
    allowedTime = 200, // maximum time allowed to travel that distance
    elapsedTime,
    startTime;

  elem.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
    },
    false
  );

  elem.addEventListener(
    "touchstart",
    function (e) {
      let touchobj = e.changedTouches[0];
      distX = 0;
      distY = 0;
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      startTime = new Date().getTime(); // record time when finger first makes contact with surface
      // e.preventDefault();
    },
    false
  );

  elem.addEventListener(
    "touchend",
    function (e) {
      let touchobj = e.changedTouches[0];

      distY = touchobj.pageY - startY;
      distX = touchobj.pageX - startX; // get total dist traveled by finger while in contact with surface
      elapsedTime = new Date().getTime() - startTime; // get time elapsed

      // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
      let swipeX =
        elapsedTime <= allowedTime && distX >= threshold
          ? touchobj.pageX - startX
          : 0;
      let swipeY =
        elapsedTime <= allowedTime && distY >= threshold
          ? touchobj.pageY - startY
          : 0;

      let x = Math.floor(distX);
      let y = Math.floor(distY);

      if (Math.abs(x) < threshold) {
        x = 0;
      }

      if (Math.abs(y) < threshold) {
        y = 0;
      }

      const direction = {
        x: x === 0 ? 0 : x < 0 ? -1 : 1,
        y: y === 0 ? 0 : y < 0 ? -1 : 1,
      };

      callback(direction);

      // e.preventDefault();
    },
    false
  );
};
