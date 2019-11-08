(function() {
  /* Helpers */
  function px(value) {
    return `${value}px`;
  }

  function addStyle($element, property, value) {
    const style = $element.getAttribute("style");
    $element.setAttribute("style", `${style || ""}; ${property}: ${value}`);
  }

  function snakePartFactory(defaults = {}) {
    return {
      top: defaults.top || 0,
      left: defaults.left || 0
    };
  }

  function snakeElementFactory($canvas, snake) {
    snake.forEach((part, i) => {
      $part = document.createElement("div");
      $part.classList.add("snake-part");
      $part.innerHTML = `${i}`;
      part.id = i;
      addStyle(
        $part,
        "transform",
        `translate(${px(part.left)}, ${px(part.top)})`
      );
      addStyle($part, "width", px(PART_SIZE));
      addStyle($part, "height", px(PART_SIZE));
      $canvas.append($part);
    });
  }

  /* Variables */
  const $canvas = document.querySelector(".canvas");
  const CANVAS_SIZE = 400;
  const PART_SIZE = 15;
  const MOVE_SIZE = PART_SIZE + 2;
  const MAX_TIME = 100;
  const UP = -1;
  const RIGHT = 1;
  const DOWN = 1;
  const LEFT = -1;
  const STOP = 0;

  let snake = [snakePartFactory({left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2})];
  let nextX = RIGHT;
  let nextY = 0;
  let startTime = null;

  /* Game */
  function init() {
    startTime = performance.now();
    addStyle($canvas, "width", px(CANVAS_SIZE));
    addStyle($canvas, "height", px(CANVAS_SIZE));
    bindEvents();

    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);
    setTimeout(() => addNewPart(), 500);

    requestAnimationFrame(gameLoop);
  }

  function bindEvents() {
    document.addEventListener("keyup", e => {
      // Use strategy pattern xD
      if (e.keyCode === 39 && nextY !== 0) {
        nextX = RIGHT;
        nextY = STOP;
      }

      if (e.keyCode === 37 && nextY !== 0) {
        nextX = LEFT;
        nextY = STOP;
      }

      if (e.keyCode === 38 && nextX !== 0) {
        nextY = UP;
        nextX = STOP;
      }

      if (e.keyCode === 40 && nextX !== 0) {
        nextY = DOWN;
        nextX = STOP;
      }
    });
  }

  function addNewPart() {
    const lastPart = snake[snake.length - 1];
    lastPart.left += -(PART_SIZE + 2);
    snake.push(snakePartFactory(lastPart));
  }

  function gameLoop() {
    const currentTime = performance.now();
    if (currentTime - startTime >= MAX_TIME) {
      startTime = currentTime;
      update();
      clean();
      draw();
    }
    requestAnimationFrame(gameLoop);
  }

  function setNextSnakePartsPositionOnUpdate() {
    const lastPart = snake.splice(snake.length - 1, 1)[0];
    const firstPart = snake[0] || lastPart;

    if (nextX === RIGHT) {
      lastPart.left = firstPart.left + MOVE_SIZE;
      lastPart.top = firstPart.top;
    }

    if (nextX === LEFT) {
      lastPart.left = firstPart.left - MOVE_SIZE;
      lastPart.top = firstPart.top;
    }

    if (nextY === DOWN) {
      lastPart.top = firstPart.top + MOVE_SIZE;
      lastPart.left = firstPart.left;
    }

    if (nextY === UP) {
      lastPart.top = firstPart.top - MOVE_SIZE;
      lastPart.left = firstPart.left;
    }

    snake.unshift(lastPart);
  }

  function checkSnakeCanvasBordersOnUpdate() {
    const firstPart = snake[0];
    const MIN_BORDER =  MOVE_SIZE;
    const MAX_BORDER = CANVAS_SIZE - MIN_BORDER;

    if (firstPart.top >= MAX_BORDER) {
      firstPart.top = MIN_BORDER;
    }

    if (firstPart.top <= 0) {
      firstPart.top = MAX_BORDER;
    }

    if (firstPart.left >= MAX_BORDER) {
        firstPart.left = MIN_BORDER;
      }
  
      if (firstPart.left <= 0) {
        firstPart.left = MAX_BORDER;
      }
  }

  function checkSnakeCollisionWithSnake() {
    const firstPart = snake[0];
    snake.forEach((part, i) => {
        
    });
  }

  function clean() {
    $canvas.innerHTML = "";
  }

  function update() {
    setNextSnakePartsPositionOnUpdate();
    checkSnakeCanvasBordersOnUpdate();
    checkSnakeCollisionWithSnake();
  }

  function draw() {
    snakeElementFactory($canvas, snake);
  }

  init();
})();
