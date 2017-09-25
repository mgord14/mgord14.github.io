// Counters
var lollipopIdx = 1;
var candyIdx = 1;
var shieldIdx = 1;
var numlollipops = 0;
var lives = 2;
var spawnRate = 1;
var state = 0; //game going or not
var score = 0;
var shielded = 0;
var numCandyDestroyed = 1;

// Size Constants
var MAX_candy_SIZE = 50;
var MIN_candy_SIZE = 15;
var candy_SPEED = 5;
var lollipop_SPEED = 10;
var SHIP_SPEED = 25;
var OBJECT_REFRESH_RATE = 50;  //ms

// Size vars
var maxShipPosX, maxShipPosY;

// Global Window Handles
var gwhGame, gwhOver, gwhStatus, gwhScore, gwhAcc, gwhLives, gwhEnd;

// Global Object Handles
var ship;

var KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
}

$(document).ready( function() {
  //check every second if sound is unmute
  var interval = setInterval(function(){
    if(document.getElementById("audioCheckBox").checked == false){
      document.getElementById('splash-sound').play();
    }
    //stop checking when player dies
    if (state == 1){
      clearInterval(interval);
    }
  },1000);

  // Periodically check for collisions
  setInterval( function() {
    checkCollisions();
  }, 100);

  // Set global handles (now that the page is loaded)
  gwhGame = $('.game-window');
  gwhOver = $('.game-over');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  gwhEnd = $('#end-score');
  gwhAcc = $('#acc-box');
  gwhLives = $('.ship-life');
  ship = $('.ship');

  // Set global max positions
  maxShipPosX = gwhGame.width() - ship.width();
  maxShipPosY = gwhGame.height() - ship.height();

  $(window).keydown(keydownRouter);
});

function setLives(){
  lives = 2;
  for (var i = 1; i<=lives; i++){
    var top = (i-1)*10;
    gwhLives.append("<img id = life-num"+i+" class='ship-avatar' src= img/fighter.png style='position:absolute; top:"+top+"; 'height='10px'/>");
  }
}

//start game
function start(){
  state = 1;
  console.log("state is now 1");
  setLives();
  //hide splash screen
  document.getElementById('overlay').style.display = 'none';
  
  //spawn candys or shield
  var randNum = 0;
  var interval = setInterval(function(){
    if (numCandyDestroyed % 10 == 0){
      createShield();
      numCandyDestroyed++; //to fix getting stuck
    }
    else{
      createCandy();
    }
    randNum = (Math.random()*0.5); //random number between 0 and .5
    randNum *= (Math.floor(Math.random()*10)) > 5 ? 1 : -1;
    console.log(spawnRate);
    //if dead, clear interval
    if(lives == -1){
      clearInterval(interval);
    }
  }, (spawnRate*1000 + randNum*1000));
}


function restart(){
  //reset score, accuracy
  state = 0;
  score = 0;
  numCandyDestroyed = 1;
  numlollipops = 0;
  gwhScore.html(0);
  gwhAcc.html(0);
  // show primary windows
  gwhGame.show();
  gwhStatus.show();
  // hide "Game Over" screen
  gwhOver.hide();
  //show splash
  document.getElementById('overlay').style.display = 'block';
  //reset lives
  state = 1;
  lives = 2;
  //reset ship
  ship.css('top', '500px');
  ship.css('left', '122px');
  //remove everything from screen
  $('.lollipop').remove();
  $('.candy').remove();  
  $('.shield').remove();
}
//panel functions
function showPanel() {  
   document.getElementById('setting-panel').style.display = "block";
   document.getElementById('openButton').style.display = "none";
   document.getElementById('closeButton').style.display = "block";
}

function hidePanel(){
  document.getElementById('openButton').style.display = "block";
  document.getElementById('closeButton').style.display = "none";
  document.getElementById('setting-panel').style.display = "none";
}

//check if speed is valid
function alertCheck(){
  spawnRate = document.getElementById('speed-input').value;
  console.log("speed: "+spawnRate);
   if (spawnRate < 0.2){
    alert("TOO SMALL! Try something over or equal to 0.2");
  }
  if (spawnRate > 4){
    alert("TOO BIG! Try something under or equal to 4");
  }
  spawnRate = 1/spawnRate;
  console.log(spawnRate);
}

// Check for any collisions and remove the appropriate object if needed
function checkCollisions() {
  // First, check for lollipop-candy checkCollisions
  $('.lollipop').each( function() {
    var curLollipop = $(this);  // define a local handle for this lollipop
    $('.candy').each( function() {
      var curCandy = $(this);  // define a local handle for this candy

      // For each lollipop and candy, check for collisions
      if (isColliding(curLollipop,curCandy)) {
        // If a lollipop and candy collide, destroy both
        curLollipop.remove();
        curCandy.remove();
        numCandyDestroyed++;
        //accuracy
        var acc = Math.ceil(numCandyDestroyed/numlollipops*100);
        if(acc > 100) {
          acc = 100;
        }
        gwhAcc.html(acc);
        // Score points for hitting candy! Smaller candy --> higher score
        var points = Math.ceil(MAX_candy_SIZE-curCandy.width()) * 100;
        // Update the visible score
        score = parseInt($('#score-box').html()) + points;
        gwhScore.html(parseInt($('#score-box').html()) + points);
      }
    });

    $('.shield').each( function() {
      var curShield = $(this);  // define a local handle for this shield
      // For each lollipop and shield, check for collisions
      if (isColliding(curLollipop,curShield)) {
        curShield.remove();
        curLollipop.remove();
      }
     });
  });
  
    // Second, check for candy-ship interactions
  $('.candy').each( function() {
    var curCandy = $(this);
    if (isColliding(curCandy, ship)) {
      //if not shielded collision
      if (shielded == 0){
        //explosion!!
        document.getElementById('explosion').style.display = "block";
        setTimeout( function() { 
          document.getElementById('explosion').style.display = "none";
        }, 1000);
        if(document.getElementById("audioCheckBox").checked == false){
          document.getElementById('explosion-sound').play();
        }
        //deal with lives
        if(lives == 0){
          //game over
          state = 0;
          console.log("end of game state: " + state);
          $('.lollipop').remove();
          $('.candy').remove();
          $('.shield').remove();
          console.log("removed everything: ");
          lives = -1;
          // Hide primary windows
          gwhGame.hide();
          gwhStatus.hide();
          // Show "Game Over" screen
          gwhOver.show();
          if(document.getElementById("audioCheckBox").checked == false){
            document.getElementById('over-sound').play();
          }
          //show final score screen
          gwhEnd.html(score);
          
        }

        else{
          //delete life image
          document.getElementById('life-num'+lives).style.display = "none";
          lives--;
          
          //delete candys and lollipops
          $('.lollipop').remove();
          $('.candy').remove();  
          $('.shield').remove();
        }
      }
      else{
        //was shielded so no explosion, just removed shield
        shielded = 0;
        curCandy.remove();
        document.getElementById('shield').style.display = "none";
      }
    }
  });

  //Lastly, check ship and shield colliding
  $('.shield').each( function() {
    var curShield = $(this);
    if (isColliding(curShield, ship)) {
      document.getElementById('shield').style.display = "block";
      console.log("shielded: "+ shielded)
      shielded = 1;
      curShield.remove();
    }
  });
}


// Check if two objects are colliding
function isColliding(o1, o2) {
  // Define input direction mappings for easier referencing
  o1D = { 'left': parseInt(o1.css('left')),
          'right': parseInt(o1.css('left')) + o1.width(),
          'top': parseInt(o1.css('top')),
          'bottom': parseInt(o1.css('top')) + o1.height()
        };
  o2D = { 'left': parseInt(o2.css('left')),
          'right': parseInt(o2.css('left')) + o2.width(),
          'top': parseInt(o2.css('top')),
          'bottom': parseInt(o2.css('top')) + o1.height()
        };

  // If horizontally overlapping...
  if ( (o1D.left < o2D.left && o1D.right > o2D.left) ||
       (o1D.left < o2D.right && o1D.right > o2D.right) ||
       (o1D.left < o2D.right && o1D.right > o2D.left) ) {

    if ( (o1D.top > o2D.top && o1D.top < o2D.bottom) ||
         (o1D.top < o2D.top && o1D.top > o2D.bottom) ||
         (o1D.top > o2D.top && o1D.bottom < o2D.bottom) ) {

      // Collision!
      return true;
    }
  }
  return false;
}

//Handle shiled creation events
function createShield() {
   console.log('Spawning shield...');

  // NOTE: source - http://www.clipartlord.com/wp-content/uploads/2016/04/aestroid.png
  var shieldDivStr = "<div id='a-" + shieldIdx + "' class='shield'></div>"
  console.log(shieldDivStr)
  // Add the lollipop to the screen
  gwhGame.append(shieldDivStr);
  // Create and candy handle based on newest index
  var curShield = $('#a-'+shieldIdx);

  shieldIdx++;  // update the index to maintain uniqueness next time

  curShield.append("<img src='img/shield.png'/>")

  // Pick a random starting position within the game window
  var startingPosition = Math.random() * (gwhGame.width()-50);  // Using 50px as the size of the candy (since no instance exists yet)

  // Set the instance-specific properties
  curShield.css('left', startingPosition+"px");

  // Make the candys fall towards the bottom
  setInterval( function() {
    curShield.css('top', parseInt(curShield.css('top'))+candy_SPEED);
    // Check to see if the candy has left the game window
    if (parseInt(curShield.css('top')) > (gwhGame.height() - curShield.height())) {
      curShield.remove();
    }
  }, OBJECT_REFRESH_RATE);
}

// Handle candy creation events
function createCandy() {
  console.log('Spawning candy...');

  var candyDivStr = "<div id='a-" + candyIdx + "' class='candy'></div>"
  // Add the candy to the screen
  gwhGame.append(candyDivStr);
  // Create and candy handle based on newest index
  var curCandy = $('#a-'+candyIdx);

  candyIdx++;  // update the index to maintain uniqueness next time

  // Set size of the candy
  var candySize = MIN_candy_SIZE + (Math.random() * (MAX_candy_SIZE - MIN_candy_SIZE));
  curCandy.css('width', candySize+"px");
  curCandy.css('height', candySize+"px");
  curCandy.append("<img src='img/candy.png' height='" + candySize + "'/>")

  // Pick a random starting position within the game window
  var startingPosition = Math.random() * (gwhGame.width()-candySize);  // Using 50px as the size of the candy (since no instance exists yet)

  // Set the instance-specific properties
  curCandy.css('left', startingPosition+"px");

  // Make the candys fall towards the bottom
  setInterval( function() {
    curCandy.css('top', parseInt(curCandy.css('top'))+candy_SPEED);
    // Check to see if the candy has left the game/viewing window
    if (parseInt(curCandy.css('top')) > (gwhGame.height() - curCandy.height())) {
      curCandy.remove();
    }
  }, OBJECT_REFRESH_RATE);
}

//handle lollipop creation events
function firelollipop() {
  console.log('Firing lollipop...');
  numlollipops++;
  if(document.getElementById("audioCheckBox").checked == false){ 
    document.getElementById('lollipop-sound').play();
  }
  var lollipopDivStr = "<div id='r-" + lollipopIdx + "' class='lollipop'><img src='img/lollipop.png'/></div>";
  // Add the lollipop to the screen
  gwhGame.append(lollipopDivStr);
  // Create and lollipop handle based on newest index
  var curlollipop = $('#r-'+lollipopIdx);
  lollipopIdx++;  // update the index to maintain uniqueness next time

  // Set vertical position
  curlollipop.css('top', ship.css('top'));
  // Set horizontal position
  var rxPos = parseInt(ship.css('left')) + (ship.width()/2);  // In order to center the lollipop, shift by half the div size (recall: origin [0,0] is top-left of div)
  curlollipop.css('left', rxPos+"px");

  // Create movement update handler
  setInterval( function() {
    curlollipop.css('top', parseInt(curlollipop.css('top'))-lollipop_SPEED);
    // Check to see if the lollipop has left the game/viewing window
    if (parseInt(curlollipop.css('top')) < curlollipop.height()) {
      //curlollipop.hide();
      curlollipop.remove();
    }
  }, OBJECT_REFRESH_RATE);
}

//control keys pressed
function keydownRouter(e) {
  switch (e.which) {
    //if pressed on spacebar, fire a lollipop
    case KEYS.spacebar:
      if (state == 1){
        firelollipop();
      }
      break;
    //move ship left right up down
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      moveShip(e.which);
      break;
  }
}

function moveShip(arrow) {
  switch (arrow) {
    case KEYS.left:  // left arrow
      var newPos = parseInt(ship.css('left'))-SHIP_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      ship.css('left', newPos);
    break;
    case KEYS.right:  // right arrow
      var newPos = parseInt(ship.css('left'))+SHIP_SPEED;
      if (newPos > maxShipPosX) {
        newPos = maxShipPosX;
      }
      ship.css('left', newPos);
    break;
    case KEYS.up:  // up arrow
      var newPos = parseInt(ship.css('top'))-SHIP_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      ship.css('top', newPos);
    break;
    case KEYS.down:  // down arrow
      var newPos = parseInt(ship.css('top'))+SHIP_SPEED;
      if (newPos > maxShipPosY) {
        newPos = maxShipPosY;
      }
      ship.css('top', newPos);
    break;
  }
}
