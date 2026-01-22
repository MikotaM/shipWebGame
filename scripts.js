var model = {
  
  rozmiarTablica: 10,
  statekZatopione: 0,

  fleet: [3,3,3, 2,2,2,2, 4,4],
  ships: [],

  maxHP: 100,
  hp: 10,

  dmgMiss: 5,
  healHit: 15,
  gameOver: false,


  takeDamage: function(amount){
    this.hp -= amount;
    if (this.hp <= 0){ 
      this.hp = 0;
      this.gameOver=true;
      document.getElementById("guessInput").disabled=true;
      document.getElementById("fireButton").disabled=true;
    }
  },

  
  heal: function(amount){
    this.hp += amount;
    if (this.hp > this.maxHP) this.hp = this.maxHP;
  },

  fire: function (guess) {
      for (var i = 0; i < this.ships.length; i++){
          var ship = this.ships[i];
          var lokalizacja = ship.lokalizacja;
          var index = lokalizacja.indexOf(guess);

          if (index >= 0) {

              if (ship.trafienia[index] === "hit") {
                  view.displayMessage("Już wcześniej trafiłeś to pole");
                  return true;
              }

              ship.trafienia[index] = "hit";
              view.displayHit(guess);

              this.heal(this.healHit);

              view.displayMessage(
                  "Trafiony! +HP (" + this.hp + "/" + this.maxHP + ")"
              );

              if (this.isSunk(ship)){
                  view.displayMessage("Zatopiłeś okręt!");
                  this.statekZatopione++;
              }

              return true;
          }
      }

    view.displayMiss(guess);
    this.takeDamage(this.dmgMiss);

    view.displayMessage(
        "Spudłowałeś! -HP (" + this.hp + "/" + this.maxHP + ")"
    );

    if (this.hp <= 0){
        view.displayMessage("Koniec gry – brak HP!");
    }

    return false;
  },
  
  isSunk: function(ship){
    for (var i = 0; i < ship.trafienia.length; i++){
        if (ship.trafienia[i] !== "hit"){
            return false;
        }
    }
    return true;
  },
   
  generateShipsLocations: function(){
    this.ships = [];

    for (var i = 0; i < this.fleet.length; i++) {
        var length = this.fleet[i];
        var lokalizacja;

        do {
            lokalizacja = this.generateShip(length);
        } while (this.collision(lokalizacja));

        this.ships.push({
            lokalizacja: lokalizacja,
            trafienia: new Array(length).fill("")
        });
    }

    //console.log("Tablica okrętów:");
    //console.log(this.ships);
  },

    
  generateShip: function(length){
    var direction = Math.floor(Math.random() * 2);
    var row, col;
    var newShipLocations = [];

    if (direction === 1) {
        row = Math.floor(Math.random() * this.rozmiarTablica);
        col = Math.floor(Math.random() * (this.rozmiarTablica - length + 1));

        for (var i = 0; i < length; i++) {
            newShipLocations.push(row + "" + (col + i));
        }

    } else {
        row = Math.floor(Math.random() * (this.rozmiarTablica - length + 1));
        col = Math.floor(Math.random() * this.rozmiarTablica);

        for (var i = 0; i < length; i++) {
            newShipLocations.push((row + i) + "" + col);
        }
    }

    return newShipLocations;
  },


    
  collision: function(lokalizacja){
    for (var i = 0; i < this.ships.length; i++){
        var ship = this.ships[i];
        var shipLocations = ship.lokalizacja;

        for (var j = 0; j < lokalizacja.length; j++){
            var row = parseInt(lokalizacja[j].charAt(0));
            var col = parseInt(lokalizacja[j].charAt(1));

            for (var r = row - 1; r <= row + 1; r++){
                for (var c = col - 1; c <= col + 1; c++){
                    if (
                        r < 0 || r >= this.rozmiarTablica ||
                        c < 0 || c >= this.rozmiarTablica
                    ) {
                        continue;
                    }

                    var neighbor = r + "" + c;

                    if (shipLocations.indexOf(neighbor) !== -1){
                        return true;
                    }
                }
            }
        }
    }
    return false;
  }
};

var view = {
  displayMessage: function(msg){
    var messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayHit: function(location){
    var cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },
  displayMiss: function(location){
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  }
};

var controller = {
  guesses: 0,
  processGuess: function(guess) {
    var location = parseGuess(guess);
    if (location){
      this.guesses++;
      var hit = model.fire(location);
      if (hit && model.statekZatopione === model.ships.length){
        view.displayMessage("Zatopiłeś wszystkie okręty, w " + this.guesses + " próbach.");
        document.getElementById("guessInput").disabled=true;
        document.getElementById("fireButton").disabled=true;
      }
    }
  }
};

function parseGuess(guess){
    var alfabet = ["a","b","c","d","e","f","g","h","i","j"];

    if (!guess || guess.length < 2 || guess.length > 3){
        alert("Podaj np. A0 – J9");
        return null;
    }

    guess = guess.toLowerCase();

    var row = alfabet.indexOf(guess.charAt(0));
    var column = parseInt(guess.slice(1));

    if (isNaN(row) || isNaN(column)){
        alert("To nie są współrzędne.");
    } else if (
        row < 0 || row >= model.rozmiarTablica ||
        column < 0 || column >= model.rozmiarTablica
    ){
        alert("Pole poza planszą.");
    } else {
        return row + "" + column;
    }
    return null;
}


function init(){
  	var fireButton = document.getElementById("fireButton");
  	fireButton.onclick = handleFireButton;
    var guessInput = document.getElementById("guessInput");
    guessInput.onkeypress = handleKeyPress;

    model.generateShipsLocations();
}

function handleKeyPress(e){
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13){ 
      fireButton.click();
      return false;
    }
}

function handleFireButton(){
  var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    controller.processGuess(guess);
  guessInput.value = "";
}
window.onload = init;
//console.table(model.ships.map(s => s.lokalizacja));