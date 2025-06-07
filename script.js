
window.onload = function() {
  createBoard();
  speedSelect.disabled = false;
  fieldSelect.disabled = false;
  
  let old_high_score = localStorage.getItem('h_score');
  console.log(old_high_score);
  if(old_high_score==null){
    localStorage.setItem('h_score','0')
    old_high_score='0';
    alert('d') 
  }
    h_score_nu.innerText = old_high_score;
alert('s') 
  
  // Now safe to dispatch because listener is attached
  const event = new Event('change');
  fieldSelect.dispatchEvent(event);
};

/*
window.onload = function() {
  createBoard();
  speedSelect.disabled = false;
  fieldSelect.disabled = false;
  let old_high_score = localStorage.getItem('h_score')
  h_score_nu.innerText= old_high_score
  // Apply default field class on load
  const event = new Event('change');
  fieldSelect.dispatchEvent(event);
};
*/

let gameOverMessage;
let speedLevel = 0;
let directionChanged = false;
const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const h_score_nu = document.getElementById('h_score_nu');

const speedSelect = document.getElementById('speed-select');
const fieldSelect = document.getElementById('field-select');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-btn');

let tiles = [];
let snake = [44];
let direction = 'right';
let interval;
let score = 0;
let food = -1;
let isPaused = false;
let playing = false;
let speed = 300;
let obstacles = [];

const fields = {
  1: [22, 23, 24, 55, 56],
  2: [11, 12, 13, 41, 61],
  3: [88, 32, 65, 35, 25],
  4: []
};



function createBoard() {
  tiles=[]
  board.innerHTML = ''; // Clear old content
  
  // Create game over message
  gameOverMessage = document.createElement('div');
  gameOverMessage.id = 'game-over-message';
  gameOverMessage.textContent = 'GAME OVER';
  gameOverMessage.style.display = 'none';
  board.appendChild(gameOverMessage);
  
  // Create tiles
  for (let i = 0; i < 100; i++) {
    let div = document.createElement('div');
    div.className = 'tile';
    board.appendChild(div);
    tiles.push(div);
  }
}

function drawBoard() {
  tiles.forEach(t => {
    t.className = 'tile';
    t.style.removeProperty('--head-rotation'); // reset
  });
  
  obstacles.forEach(i => tiles[i].classList.add('obstacle'));
  
  snake.forEach((i, idx) => {
    tiles[i].classList.add('snake');
    if (idx === 0) {
      tiles[i].classList.add('snake-head');
      
      // Set rotation using CSS variable
      let rotation = '-90deg';
      if (direction === 'up') rotation = '180deg';
      else if (direction === 'down') rotation = '0deg';
      else if (direction === 'left') rotation = '90deg';
      
      tiles[i].style.setProperty('--head-rotation', rotation);
    }
  });
  
  if (food >= 0) tiles[food].classList.add('food');
}

function moveSnake() {
  if (isPaused) return;
  directionChanged = false;

  let head = snake[0];
  let x = head % 10;
  let y = Math.floor(head / 10);
  if (direction === 'right') x++;
  else if (direction === 'left') x--;
  else if (direction === 'up') y--;
  else if (direction === 'down') y++;
  
  if (x < 0 || x > 9 || y < 0 || y > 9) return gameOver();
  let newHead = y * 10 + x;
  
  if (snake.includes(newHead) || obstacles.includes(newHead)) return gameOver();
  
  snake.unshift(newHead);
  
  if (newHead === food) {
    score++;
    scoreDisplay.textContent = 'Score: ' + score;
    if (parseInt(h_score_nu.innerText) < score) {
  h_score_nu.innerText = score;
}
    
    placeFood();
    
    eatsound.play();
    
    // 🚀 Increase speed every 5 points
    if (score % 5 === 0) {
      speedLevel++;
      let newSpeed = speed - speedLevel * 40;
      if (newSpeed < 80) newSpeed = 80; // Minimum speed limit
      
      clearInterval(interval);
      interval = setInterval(moveSnake, newSpeed);
    }
    
  } else {
    snake.pop();
  }
  
  drawBoard();
}

function placeFood() {
  let empty = [];
  for (let i = 0; i < 100; i++) {
    if (!snake.includes(i) && !obstacles.includes(i)) empty.push(i);
  }
  food = empty[Math.floor(Math.random() * empty.length)];
}


function changeDirection(dir) {
  if (isPaused || directionChanged) return;
  
  if ((dir === 'up' && direction !== 'down') ||
    (dir === 'down' && direction !== 'up') ||
    (dir === 'left' && direction !== 'right') ||
    (dir === 'right' && direction !== 'left')) {
    direction = dir;
    directionChanged = true;
  }
}


function gameOver() {
  oversound.play();
  scoreDisplay.classList.add('colorful')
  if(parseInt(h_score_nu.innerText)==score){
    h_score.classList.add('colorful')
  }
  localStorage.setItem('h_score', h_score_nu.innerText)
  clearInterval(interval);
  playing = false;
  document.querySelectorAll('.snake').forEach(el => el.classList.add('vibrate'));
  gameOverMessage.style.display = 'block';
  speedSelect.disabled = false;
  fieldSelect.disabled = false;
  startButton.disabled = false;
  startButton.innerText = 'Start'
  pauseButton.disabled = true;
  
}


function pauseGame() {
  isPaused = !isPaused;
  if (isPaused) {
    pauseButton.innerText = 'Resume'
  }
  else {
    pauseButton.innerText = 'Pause'
  }
}

function restartGame() {
  playing = true;
  h_score.classList.remove('colorful')
  scoreDisplay.classList.remove('colorful')

  // Read latest field and speed
  speed = +speedSelect.value;
  obstacles = fields[fieldSelect.value];
  
  // Apply field theme
  board.classList.remove('forest', 'desert', 'space');
  if (fieldSelect.value === '1') board.classList.add('forest');
  else if (fieldSelect.value === '2') board.classList.add('desert');
  else if (fieldSelect.value === '3') board.classList.add('space');
  
  // Clear board and reset
  clearInterval(interval);
  gameOverMessage.style.display = 'none';
  
  tiles = [];
  createBoard();
  
  snake = [44];
  direction = 'right';
  score = 0;
  food = -1;
  isPaused = false;
  scoreDisplay.textContent = 'Score: 0';
  speedLevel = 0;
  placeFood();
  drawBoard();
  interval = setInterval(moveSnake, speed);
  
  startButton.disabled = true
  startButton.innerText = 'Playing'
  pauseButton.disabled = false;
  speedSelect.disabled = true;
  fieldSelect.disabled = true;
}


function startGame() {
  if (playing) return; // Prevent multiple starts
  
  playing = true;
  gameOverMessage.style.display = 'none';
  h_score.classList.remove('colorful')
    scoreDisplay.classList.remove('colorful')

  // Read latest field and speed
  // speed = +speedSelect.value;
  speed = parseInt(speedSelect.value, 10);
  obstacles = fields[fieldSelect.value];
  
  // Apply field theme
  board.classList.remove('forest', 'desert', 'space');
  if (fieldSelect.value === '1') board.classList.add('forest');
  else if (fieldSelect.value === '2') board.classList.add('desert');
  else if (fieldSelect.value === '3') board.classList.add('space');
  
  // Clear board and set up
  clearInterval(interval);
  tiles = [];
  createBoard();
  
  snake = [44];
  direction = 'right';
  score = 0;
  food = -1;
  isPaused = false;
  scoreDisplay.textContent = 'Score: 0';
  speedLevel = 0;
  placeFood();
  drawBoard();
  interval = setInterval(moveSnake, speed);
  speedSelect.disabled = true;
  fieldSelect.disabled = true;
  startButton.disabled = true
  startButton.innerText = 'Playing';
  pauseButton.disabled = false;
}




fieldSelect.addEventListener('change', () => {
  // Remove old field classes
  board.classList.remove('forest', 'desert', 'space', 'water');
  
  // Add selected field class
  if (fieldSelect.value === '1') board.classList.add('forest');
  else if (fieldSelect.value === '2') board.classList.add('desert');
  else if (fieldSelect.value === '3') board.classList.add('space');
  else if (fieldSelect.value === '4') board.classList.add('water');
  
  // Show field layout with obstacles (no snake/food)
  obstacles = fields[fieldSelect.value];
  drawBoard(); // Re-render the board with new obstacles
});

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') changeDirection('up');
  else if (e.key === 'ArrowDown') changeDirection('down');
  else if (e.key === 'ArrowLeft') changeDirection('left');
  else if (e.key === 'ArrowRight') changeDirection('right');
});
