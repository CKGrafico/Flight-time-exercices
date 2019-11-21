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

  function applesElementFactory($canvas, apples) {
    apples.forEach((apple, i) => {
      $apple = document.createElement("div");
      $apple.classList.add("apple");
      $apple.innerHTML = `${i}`;
      apple.id = i;
      addStyle(
        $apple,
        "transform",
        `translate(${px(apple.left)}, ${px(apple.top)})`
      );
      addStyle($apple, "width", px(APPLE_SIZE));
      addStyle($apple, "height", px(APPLE_SIZE));
      $canvas.append($apple);
    });
  }

  function getRandom(partSize, min, max) {
    const grid = [...(new Array(max).keys())].filter(x => x % partSize === 0 && x > min);
    const position = Math.floor(Math.random() * grid.length);
    return grid[position];
  }

  function appleFactory(partSize, maxTop, maxLeft) {
    return {
      born: performance.now(),
      top: getRandom(partSize, 0, maxTop),
      left: getRandom(partSize, 0, maxLeft)
    };
  }

  /* Variables */
  const $canvas = document.querySelector(".canvas");
  const CANVAS_SIZE = 400;
  const PART_SIZE = 15;
  const APPLE_SIZE = 5;
  const MOVE_SIZE = PART_SIZE + 2;
  const UP = -1;
  const RIGHT = 1;
  const DOWN = 1;
  const LEFT = -1;
  const STOP = 0;
  const DEFAULT_TIME = 100;
  const PAUSE_TIME= 10000000000;
  const APPLE_TIME = 7000;

  let MAX_TIME = DEFAULT_TIME;
  let snake = [];
  let apples = [];
  let nextX = RIGHT;
  let nextY = 0;
  let startTime = null;
  let appleTime = null;

  /* Game */
  function init() {
    addStyle($canvas, "width", px(CANVAS_SIZE));
    addStyle($canvas, "height", px(CANVAS_SIZE));

    bindEvents();

    reload();
    requestAnimationFrame(gameLoop);
  }

  function reload() {
    clean();
    snake = [snakePartFactory({left: getRandom(PART_SIZE, 0, CANVAS_SIZE), top: getRandom(PART_SIZE, 0, CANVAS_SIZE)})];
    apples = [];
    nextX = RIGHT;
    nextY = 0;
    startTime = performance.now();
    appleTime = performance.now();
    MAX_TIME = DEFAULT_TIME;
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

      if (e.keyCode === 80) {
        if (MAX_TIME === DEFAULT_TIME) {
          pause();
        } else {
          play();
        }
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
    const MIN_BORDER = MOVE_SIZE;
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
    const isEaten = snake.slice(1).some((part) => firstPart.left === part.left && firstPart.top === part.top);

    if (isEaten) {
      gameOver();
    }
  }

  function checkSnakeCollisionWithApple() {
    const firstPart = snake[0];
    const currentApple = apples.slice(1).find(apple => {
      if ((apple.left <= firstPart.left + PART_SIZE && apple.left + APPLE_SIZE >= firstPart.left) &&(apple.top + APPLE_SIZE <= firstPart.top + PART_SIZE && apple.top >= firstPart.top)) {
        return true;
      }
    });

    if (currentApple) {
      destroyApple(currentApple);
      addNewPart();
    }
  }

  function destroyApple(apple) {
    apples = apples.filter(x => x.id !== apple.id);
  }

  function checkApplesTimeAndAddRandom() {
    const currentTime = performance.now();

    apples.forEach(apple => {
      if (currentTime - apple.born > APPLE_TIME) {
        destroyApple(apple);
      }
    });

    if (currentTime - appleTime >= APPLE_TIME) {
      appleTime = currentTime;
      apples.push(appleFactory(PART_SIZE, CANVAS_SIZE, CANVAS_SIZE));
    }
  }

  function clean() {
    $canvas.innerHTML = "";
  }

  function update() {
    setNextSnakePartsPositionOnUpdate();
    checkSnakeCanvasBordersOnUpdate();
    checkSnakeCollisionWithSnake();
    checkSnakeCollisionWithApple();
    checkApplesTimeAndAddRandom();
  }

  function draw() {
    snakeElementFactory($canvas, snake);
    applesElementFactory($canvas, apples);
  }

  function pause() {
    MAX_TIME = PAUSE_TIME;
  }

  function play() {
    MAX_TIME = DEFAULT_TIME;
  }

  function gameOver() {
    pause();
    reload();
  }

  init();
})();
