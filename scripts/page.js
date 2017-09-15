////  Page-scoped globals  ////


// Counters
var lollipopIdx = 1;
var candyIdx = 1;
var shieldIdx = 1;
var numlollipops = 0;
var numAst = 0;
var lives = 2;
var s = 1;
var state = 0;
var score = 0;
var shielded = 0;
var shieldRate = 10;
var numAstDestroyed = 0;
var maxAstDest = 10;

// Size Constants
var MAX_candy_SIZE = 50;
var MIN_candy_SIZE = 15;
var candy_SPEED = 5;
var lollipop_SPEED = 10;
var SHIP_SPEED = 25;
var OBJECT_REFRESH_RATE = 50;  //ms
var SCORE_UNIT = 100;  // scoring is in 100-point units

// Size vars
var maxShipPosX, maxShipPosY;

// Global Window Handles
var gwhGame, gwhOver, gwhStatus, gwhScore, gwhAcc, gwhLives, gwhEnd; //add

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
  lives = gup("life");
  maxAstDest = gup("itemRate");
  if(maxAstDest == null){
    maxAstDest = 10;
  }
  if(maxAstDest<=0){
    alert("must be positive");
  }
  if (maxAstDest % 1 === 0){
  }  
  else{
    alert("data is not an integer");
  }
  if (lives == null){
    lives = 2;
  }
  if(lives > 10){
    alert("lives cannot be greater than 10");
  }
  lives--;
  console.log("Ready!");
  var interval = setInterval(function(){
    if(document.getElementById("myCheck").checked == false){
      document.getElementById('splash-sound').play();
    }
    if (state == 1){
      clearInterval(interval);
    }
  },1000);

  // Set global handles (now that the page is loaded)
  gwhGame = $('.game-window');
  gwhOver = $('.game-over');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  gwhEnd = $('#end-score');
  gwhAcc = $('#acc-box');//add
  gwhLives = $('.ship-life');//add
  ship = $('#enterprise');  // set the global ship handle

  // Set global positions
  maxShipPosX = gwhGame.width() - ship.width();
  maxShipPosY = gwhGame.height() - ship.height();

  $(window).keydown(keydownRouter);
 

  // Periodically check for collisions (instead of checking every position-update)
  setInterval( function() {
    checkCollisions();  // Remove elements if there are collisions
  }, 100);
});

function getLives(){
  lives = gup("life");
  if (lives == null){
    lives = 2;
  }
  else{
    lives--;
  }
  var i;
  var numLives = lives;
  for ( i = 1; i<=lives; i++){
    var top = (i-1)*10;
    gwhLives.append("<img id = life-num"+i+" class='ship-avatar' src= img/fighter.png style='position:absolute; top:"+top+"; 'height='10px'/>");
  }
}


function restart(){
  //reset accuracy
  console.log("go back button");
  state = 0;
  console.log("state : " +state);
  score = 0;
  numAstDestroyed = 0;
  acc = 0;
  //show game over
  // show primary windows
  gwhGame.show();
  gwhStatus.show();
  // hide "Game Over" screen
  gwhOver.hide();
  //show splash
  document.getElementById('overlay').style.display = 'block';
  //reset ship
  //reset lives
  state = 1;
  lives = 2;
  
  ship.css('top', '500px');
  ship.css('left', '122px');

  $('.lollipop').remove();
  $('.candy').remove();  // remove all candys
  $('.shield').remove();
  console.log("remove everything");
}

function alertCheck(){
  s = document.getElementById('speed-input').value;
  console.log("speed: "+s);
   if (s < 0.2){
    alert("TOO SMALL! Try something over or equal to 0.2");
  }
  if (s > 4){
    alert("TOO BIG! Try something under or equal to 4");
  }
  s = 1/s;
}

function start(){
  state = 1;
  console.log("state is now 1");
  getLives();
  document.getElementById('overlay').style.display = 'none';
  //spawn candys
  var randNum = 0; //random number between 0 and .5
  var interval = setInterval(function(){
    if (numAstDestroyed >= maxAstDest){
      createShield();
      numAstDestroyed = 0;
    }
    else{
      createcandy();
    }
    randNum = (Math.random()*0.5); //random number between 0 and .5
    randNum *= (Math.floor(Math.random()*10)) > 5 ? 1 : -1;
    if(lives == -1){

      clearInterval(interval);
    }
  }, (s*1000 + randNum*1000));
}


function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      if (state == 1){createcandy();}
      break;
    case KEYS.spacebar:
      if (state == 1){
        firelollipop();
        numlollipops++; 
        console.log("numlollipops: " + numlollipops);
      }
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      moveShip(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

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

function updatePanel(){
  //update all things
  //and close
  document.getElementById('openButton').style.display = "block";
  document.getElementById('closeButton').style.display = "none";
  document.getElementById('setting-panel').style.display = "none";
}

// Check for any collisions and remove the appropriate object if needed
function checkCollisions() {
  // First, check for lollipop-candy checkCollisions
  $('.lollipop').each( function() {
    var curlollipop = $(this);  // define a local handle for this lollipop
    $('.candy').each( function() {
      var curcandy = $(this);  // define a local handle for this candy

      // For each lollipop and candy, check for collisions
      if (isColliding(curlollipop,curcandy)) {
        // If a lollipop and candy collide, destroy both
        curlollipop.remove();
        curcandy.remove();
        numAstDestroyed++;//add
        numAst++; //add
        console.log("numAst: " + numAst);
        var acc = Math.ceil(numAst/numlollipops*100);
        // Score points for hitting an candy! Smaller candy --> higher score
        var points = Math.ceil(MAX_candy_SIZE-curcandy.width()) * SCORE_UNIT;
        // Update the visible score
        score = parseInt($('#score-box').html()) + points;
        gwhScore.html(parseInt($('#score-box').html()) + points);
        // Update the visible accuracy
        gwhAcc.html(acc);
      }
    });

    $('.shield').each( function() {
      var curShield = $(this);  // define a local handle for this shield
      // For each lollipop and shield, check for collisions
      if (isColliding(curlollipop,curShield)) {
        curShield.remove();
        curlollipop.remove();
      }
     });
  });
  
    // Next, check for candy-ship interactions
  $('.candy').each( function() {
    var curcandy = $(this);
    if (isColliding(curcandy, ship)) {
      if (shielded == 0){
        document.getElementById('explosion').style.display = "block";
        setTimeout( function() { 
          document.getElementById('explosion').style.display = "none";
        }, 1000);
        
        if(document.getElementById("myCheck").checked == false){
          document.getElementById('explosion-sound').play();
        }
        if(lives == 0){
          state = 0;
          console.log("end of game state: " + state);
          $('.lollipop').remove();
          $('.candy').remove();  // remove all candys
          $('.shield').remove();
          console.log("removed everything: ");
          lives = -1;
        // Hide primary windows
          gwhGame.hide();
          gwhStatus.hide();
          // Show "Game Over" screen
          gwhOver.show();
          if(document.getElementById("myCheck").checked == false){
            document.getElementById('over-sound').play();
          }
          //show final score
          gwhEnd.html(score);
          
        }

        else{
          //delete life image
          document.getElementById('life-num'+lives).style.display = "none";
          lives--;
          
          //explode ship
          //delete candys and lollipops
          $('.lollipop').remove();
          $('.candy').remove();  // remove all candys
          $('.shield').remove();
        }
      }
      else{
        shielded = 0;
        curcandy.remove();
        document.getElementById('shield').style.display = "none";
      }
    }
  });

  //check ship and shield colliding
  $('.shield').each( function() {
    var curShield = $(this);
    if (isColliding(curShield, ship)) {
      console.log("they are colliding?");
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

// Return a string corresponding to a random HEX color code
function getRandomColor() {
  // Return a random color. Note that we don't check to make sure the color does not match the background
  return '#' + (Math.random()*0xFFFFFF<<0).toString(16);
}
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
function createcandy() {
  console.log('Spawning candy...');

  var candyDivStr = "<div id='a-" + candyIdx + "' class='candy'></div>"
  // Add the lollipop to the screen
  gwhGame.append(candyDivStr);
  // Create and candy handle based on newest index
  var curcandy = $('#a-'+candyIdx);

  candyIdx++;  // update the index to maintain uniqueness next time

  // Set size of the candy
  var astrSize = MIN_candy_SIZE + (Math.random() * (MAX_candy_SIZE - MIN_candy_SIZE));
  curcandy.css('width', astrSize+"px");
  curcandy.css('height', astrSize+"px");
  curcandy.append("<img src='img/candy.png' height='" + astrSize + "'/>")

  // Pick a random starting position within the game window
  var startingPosition = Math.random() * (gwhGame.width()-astrSize);  // Using 50px as the size of the candy (since no instance exists yet)

  // Set the instance-specific properties
  curcandy.css('left', startingPosition+"px");

  // Make the candys fall towards the bottom
  setInterval( function() {
    curcandy.css('top', parseInt(curcandy.css('top'))+candy_SPEED);
    // Check to see if the candy has left the game/viewing window
    if (parseInt(curcandy.css('top')) > (gwhGame.height() - curcandy.height())) {
      curcandy.remove();
    }
  }, OBJECT_REFRESH_RATE);
}

function firelollipop() {
  console.log('Firing lollipop...');
  if(document.getElementById("myCheck").checked == false){ 
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
