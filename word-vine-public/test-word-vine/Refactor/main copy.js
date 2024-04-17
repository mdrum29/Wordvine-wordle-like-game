import '../styles/modern-normalize.css';
import '../styles/style.css';
import '../styles/components/header.css';
import '../styles/components/guessgrid.css';
import '../styles/components/keyboard.css';
import '../styles/components/scoreboard.css';
import '../styles/components/hints.css';
import '../styles/components/statsmodal.css';
import '../styles/components/alert.css';
import '../styles/components/howToPlay.css';
import '../styles/utils.css';
import puzzles from '../src/puzzles.js';

const MAX_SCORE = 1000
const MAX_WORD_LENGTH = 6
const MIN_WORD_LENGTH = 3
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 600
const offsetFromDate = new Date(2024, 0, 14)
const msOffset = Date.now() - offsetFromDate
var dayOffset = msOffset / 1000 / 60 / 60 / 24
var puzzle_number = Math.floor(dayOffset)

const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate(); 
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

var todays_date = mm + '/' + dd + '/' + yyyy;
   
const alertContainer = document.querySelector("[data-alert-container]")
const guessGrid = document.querySelector("[data-guess-grid]")
const game_words = getPuzzle(puzzles, dayOffset)



// // // // // // // // // // // // // // // // // // // // 
// // // // //  GAME FLOW // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // 

// use functions to open and close modals and init the game here.



// 
// 
// Core Game Functions
// 
// 
function getPuzzle(puzzles, dayOffset) {
  const targetWords = puzzles[Math.floor(dayOffset)]
  return targetWords
}

function getGuess (tiles) {
  var guessed_word = ''

  if (tiles[0]) {
    var targetRow = tiles[0].getAttribute('row')
    var tiles = document.querySelectorAll('.tile[row="' + targetRow + '"]')

    tiles.forEach((tile) => {
        guessed_word += tile.textContent.trim()
  
    });
  } else {
    guessed_word = 'XXXXXX'
  }
  return guessed_word.toUpperCase()
}

// NEED TO SIMPLIFY THIS
function submitGuess() {
  count_guess()

  const activeTiles = [...getActiveTiles()]
  // check for the correct word is working.
  var row = locateTiles(activeTiles) 
  if (row === "row1") {
      var correct_word = game_words[0]
  } else if (row === "row2") {
      var correct_word = game_words[1];
  } else if (row === "row3") {
      var correct_word = game_words[2];
  } else if (row === "row4") {
      var correct_word = game_words[3];
  } else if (row === "row5") {
      var correct_word = game_words[4];
  } else {
      var correct_word = game_words[5]
  }
  
  var guess = getGuess(activeTiles)

  var targetRow = row.slice(-1)
  var tiles_to_animate = document.querySelectorAll('.tile[row="' + targetRow + '"]')

  if (correct_word === guess){
      // shine_tiles(tiles_to_animate)
      correct_answer()
      var WL = checkWinLose()
      if (WL !== true) {
        stopInteraction()
        give_next_letter()
        startInteraction()
      } else {
        var final_board = getFinalBoard()
        var last_score = calculate_score(MAX_SCORE, seconds, guessCount, hintCount)
        setStorage(final_board, last_score, guessCount)
        var existing_storage = getStorage()
        var avg = get_average (existing_storage)
        var high = get_high (existing_storage)
        var games_streak = findConsecutiveDates(existing_storage);
        var last10_scores = getlast10(existing_storage,last_score)
        console.log(last10_scores)

        open_stats_modal(last_score, avg, high, games_streak, existing_storage)
        update_chart(chart, last10_scores)
        startInteraction()
        
      }

  } else {
      if (guess === "XXXXXX") {
        var correct_tiles = document.querySelectorAll('[data-state="correct"], [data-state="hint_given"]')
        var last_correct = correct_tiles[correct_tiles.length - 1]
        const row_lookup = last_correct.getAttribute("row")
        var tiles_to_animate = document.querySelectorAll('.tile[row="' + row_lookup + '"]')

      }
      shakeTiles(tiles_to_animate)
      wrong_answer()
  }

}


// 
// 
// Interaction Functions
function startInteraction() {
  document.addEventListener("click", handleMouseClick)
  document.addEventListener("keydown", handleKeyPress)
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick)
  document.removeEventListener("keydown", handleKeyPress)
}

function handleMouseClick(e) {
  console.log(e)
  
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key)
    return
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess()
    e.target.blur();
    return
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey()
    e.target.blur();
    return 
  }

  if (e.target.matches("[data-help]")) {
   give_hint();
   e.target.blur();
  
   return
  }

  if (e.target.matches("[data-close-stat-modal]")) {
    close_stats_modal()
    e.target.blur();
  
    return
  }

  if (e.target.matches("[data-play]")) {
    console.log("hit play")
    play()
    e.target.blur();
    return
  }

  if (e.target.matches("[data-share]")) {
    console.log("hit share")
    share(puzzle_number)
    e.target.blur();
    return
  }

  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key)
    return
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess()
    return
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey()
    return
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key)
    return
  }
}

function pressKey(key) {

  const nextTile = guessGrid.querySelector('.tile:not([data-state])')
  if (nextTile.getAttribute("col") === "1") return;
  // get all tiles in the row? and then cap it at 6
  var row_lookup = nextTile.getAttribute("row")
  var all_tiles = document.querySelectorAll(`[row="${row_lookup}"][data-state="correct"], [row="${row_lookup}"][data-state="active"]`);
  if (all_tiles.length >= MAX_WORD_LENGTH) return;
  nextTile.dataset.state = "active"
  nextTile.dataset.letter = key.toUpperCase()
  nextTile.textContent = key
}


function deleteKey() {
  const activeTiles = getActiveTiles()
  const lastTile = activeTiles[activeTiles.length - 1]
  if (lastTile == null) return
  lastTile.textContent = ""
  delete lastTile.dataset.state
  delete lastTile.dataset.letter
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]')
}

function locateTiles (tiles) {
  var tile_locations = []
  tiles.forEach(function (tile) {
      var locationValue = tile.getAttribute('row');
      tile_locations.push(locationValue)
  
  });
  return 'row' + tile_locations[0];
}

// 
// 
// Animation Functions
// 
// 

function flip_help_tiles () {
  var first_prac = document.querySelectorAll('[row="x"]');
  var second_prac = document.querySelectorAll('[row="y"]');

  var first_word = 'POINT'
  var second_word = 'BREAK'

  var tile_state = ''
  first_prac.forEach(tile => {
      var col = parseInt(tile.getAttribute("cols"),10)
      
      if (col -1 < first_word.length){
          var letter = first_word[col-1].toUpperCase()
          tile_state = "prac-correct"
      } else {
          var letter = ''
          tile_state = "prac-disabled"
      };
      console.log(tile)
      console.log(letter)
      console.log(tile_state)
      console.log(tile.classList)

        
      tile.classList.add("flip");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("flip");
          console.log("checking3")
          tile.dataset.letter = letter;
          tile.textContent = letter;
          tile.setAttribute('data-state', tile_state)
        }, false
        )
  
      })
    }

    function flip_tile(tiles, next_letter, dataset){
      stopInteraction();
      if (!tiles.length) {
        console.log('checking')
        
        tiles.classList.add("flip");
        tiles.addEventListener(
          "transitionend",
          () => {
            tiles.classList.remove("flip");
            console.log("checking3")
            tiles.dataset.letter = next_letter;
            tiles.textContent = next_letter;
            tiles.setAttribute('data-state', dataset)
          },
          { once: false }
        )
      } else {
      console.log('checking2')
      tiles.forEach((tile) => {
          tile.classList.add("flip");
          tile.addEventListener(
            "transitionend",
            () => {
              tiles.classList.remove("flip");
              tiles.dataset.letter = next_letter;
              tiles.textContent = next_letter;
              tiles.setAttribute('data-state', dataset);
            },
            { once: false }
          )
      })}
      startInteraction();
    }


    // 
    // 
    // Stats Modal Functions
    // 
    // 
    function open_stats_modal() {
      const modal = document.getElementById('outer-stats-modal')
      console.log(modal)
      modal.classList.add("open")
    }

    function close_stats_modal() {
      const modal = document.getElementById('outer-stats-modal')
      modal.classList.remove("open")
    }

    function update_stats(last_score, avg, high, streak) {
    
      var last_score_div = document.querySelector("[data-last-score]")
      last_score_div.textContent = numberWithCommas(last_score)
    
      var avg_score_div = document.querySelector("[data-avg-score]")
      if (avg == null) {
        avg = last_score
      }
    
      avg_score_div.textContent = numberWithCommas(avg)
    
      var high_score_div = document.querySelector("[data-best-score]")
      if (high == null) {
        high = last_score
      }
    
      high_score_div.textContent = numberWithCommas(high)
    
      var streak_div = document.querySelector("[data-streak-count]")
      if (streak == null) {
        var streak = 1
      }
    
      streak_div.textContent = numberWithCommas(streak)
    }

    function getFinalBoard() {
      var final_board = [];
      var i=0
      var states = guessGrid.querySelectorAll("[data-state]")
      states.forEach(tile=> {
        var ds = tile.getAttribute("data-state")
        final_board[i] = ds
        i++
      })
        return final_board
      }
      
    function get_average (wordvine_obj){
      if (wordvine_obj === null) {
        return null
      } else {
        var all_keys = Object.keys(wordvine_obj)
        let all_scores = []
        var i=0
    
        for (let i = 0; i < all_keys.length; i++) {
          var game_day = all_keys[i]
          var historical_score = wordvine_obj[game_day].score
          all_scores[i] = historical_score
        }
        var total = 0;
        for(var i = 0; i < all_scores.length; i++) {
            total += all_scores[i];
        }
        var avg = total / all_scores.length;
    
        return Math.round(avg)
      }
    }
    
    function get_high (wordvine_obj){
      if (wordvine_obj === null) {
        return null
      } else {
        var all_keys = Object.keys(wordvine_obj)
        let all_scores = []
        var i=0
    
        for (let i = 0; i < all_keys.length; i++) {
          var game_day = all_keys[i]
          var historical_score = wordvine_obj[game_day].score
          all_scores[i] = historical_score
        }
    
        var high = Math.max(...all_scores)
    
        return high
      }
    }
    
      function findConsecutiveDates(wordvine_obj) {
        var streak = 1
        if (wordvine_obj === null) {
          return streak
        } else {
          var all_dates = Object.keys(wordvine_obj)
        }
      
        // Convert date strings to Date objects
        const dates = all_dates.map(dateStr => new Date(dateStr)).sort((a, b) => b - a);  
        
        for (let i = 1; i < dates.length; i++) {
          // Calculate the difference in days between consecutive dates
          const dayDifference = (dates[i-1] - dates[i]) / (1000 * 60 * 60 * 24);
      
          // If the difference is 1, it's a consecutive date
          if (dayDifference === 1) {
            streak++;
          } else {
            break; // End the streak if consecutive dates are broken
          }
        }
        return Math.max(1, streak); // Return at least 1
      }
    
        
    function getlast10 (wordvine_obj, last_score){
      if (wordvine_obj == null) {
        return [0,0,0,0,0,0,0,0,0,last_score]
      } else {
        var all_keys = Object.keys(wordvine_obj)
        var rev_all_keys = all_keys.reverse()
        let last10_scores = []
        i=0
    
        for (let i = 0; i < rev_all_keys.length; i++) {
          var game_day = rev_all_keys[i]
          var historical_score = wordvine_obj[game_day].score
          last10_scores[i] = historical_score
        }
    
        last10_scores[last10_scores.length] = last_score
        if (last10_scores.length !== 10) {
          for (var i = 10; 10 > last10_scores.length; i--){
            last10_scores.unshift(0)
          }
        }
        return last10_scores
      }
      }

        
    function update_chart(chart, last10_scores){
      chart.data.datasets[0].data = last10_scores;
      chart.data.datasets[0].data[1] = last10_scores[1];
      chart.data.datasets[0].data[2] = last10_scores[2];
      chart.data.datasets[0].data[3] = last10_scores[3];
      chart.data.datasets[0].data[4] = last10_scores[4];
      chart.data.datasets[0].data[5] = last10_scores[5];
      chart.data.datasets[0].data[6] = last10_scores[6];
      chart.data.datasets[0].data[7] = last10_scores[7];
      chart.data.datasets[0].data[8] = last10_scores[8];
      chart.data.datasets[0].data[9] = last10_scores[9];
      chart.update();
    }

    // SHARE LOGIC   
    function share (puzzle_number) {
      var final_board = getFinalBoard()

      var puzz_num = formatNumber(puzzle_number)

      var red_square = String.fromCodePoint(0x1F7E5)
      var green_square = String.fromCodePoint(0x1F7E9)
      var white_square = String.fromCodePoint(0x2B1C)
      var smirk = String.fromCodePoint(0x1F60F)
      var grapes = String.fromCodePoint(0x1F347)
      var trophy = String.fromCodePoint(0x1F3C6)

      var existing_storage = getStorage()

      if (existing_storage === null) {
        var last_score = 0
      } else {
        var all_keys = Object.keys(existing_storage)
        let all_scores = []
        var i=0
    
        for (let i = 0; i < all_keys.length; i++) {
          var game_day = all_keys[i]
          var historical_score = existing_storage[game_day].score
          all_scores[i] = historical_score
        }

        var last_score = all_scores[all_scores.length-1]
      }

      var title_msg = 'WordVine' + grapes +' #' + puzz_num
      var text_msg = ''
      var url_txt = 'https://wordvine.games/'

      var line1 = 'Difficulty Score: ' + last_score + '' + trophy
      var line2 = white_square + white_square + white_square + white_square + white_square + white_square
      var line3 = ''
      var line4 = ''
      var line5 = ''
      var line6 = ''
      var line7 = ''
      var line8 = 'Can you beat my score?' + smirk

      var first = final_board.slice(6,12)
      var second = final_board.slice(12,18)
      var third = final_board.slice(18,24)
      var fourth = final_board.slice(24,30)
      var fifth = final_board.slice(30,36)

      var last_square = ''

      first.forEach(t => {
        if (t === 'correct') {
          last_square = "correct"
          line3 += green_square
        } else if (t === 'hint_given') {
          line3 += red_square
          last_square = "hint"
        } else {
          // if the square is disabled reuse the last square again
          if (last_square === 'correct') {
            line3 += green_square
          } else {
            line3 += red_square
          }
        }
      })

      second.forEach(t => {
        if (t === 'correct') {
          line4 += green_square
          last_square = "correct"
        } else if (t === 'hint_given') {
          line4 += red_square
          last_square = "hint"
        } else {
          // if the square is disabled reuse the last square again
          if (last_square === 'correct') {
            line4 += green_square
          } else {
            line4 += red_square
          }
        }
      })

      third.forEach(t => {
        if (t === 'correct') {
          line5 += green_square
          last_square = "correct"
        } else if (t === 'hint_given') {
          line5 += red_square
          last_square = "hint"
        } else {
          // if the square is disabled reuse the last square again
          if (last_square === 'correct') {
            line5 += green_square
          } else {
            line5 += red_square
          }
        }
      })

      fourth.forEach(t => {
        if (t === 'correct') {
          line6 += green_square
          last_square = "correct"
        } else if (t === 'hint_given') {
          line6 += red_square
          last_square = "hint"
        } else {
          // if the square is disabled reuse the last square again
          if (last_square === 'correct') {
            line6 += green_square
          } else {
            line6 += red_square
          }
        }
      })

      fifth.forEach(t => {
        if (t === 'correct') {
          line7 += green_square
          last_square = "correct"
        } else if (t === 'hint_given') {
          line7 += red_square
          last_square = "hint"
        } else {
          // if the square is disabled reuse the last square again
          if (last_square === 'correct') {
            line7 += green_square
          } else {
            line7 += red_square
          }
        }
      })

      text_msg = title_msg + '\n' + line1 + '\n' + line2 + '\n' + line3 + '\n' + line4 + '\n' + line5 + '\n' + line6 + '\n' + line7 + '\n' + line8 + '\n' + url_txt
      
      console.log(text_msg)

      if (navigator.share) {
        // if built in share function -- ideal
        navigator.share({
          text: `${text_msg}`,
        })

      } else {
        // if no share function copy to clipboard.
     
         // Copy the text inside the text field
        navigator.clipboard.writeText(text_msg);
      
        // Alert the copied text
        alert("Copied to clipboard: " + text_msg);

      }
    };


    //
    // 
    // STORAGE FUCNTIONS
    // 
    // 

    function getStorage() {
      if (localStorage.getItem("WordVineData") == null) {
        var wordvine_obj = null
      } else {
        var wordvine_obj = JSON.parse(localStorage.getItem("WordVineData"));
      }
      return wordvine_obj
    }
    
    
    function setStorage(final_board, score, guessCount) {
    
      // check for existing stored items
      if (localStorage.getItem("WordVineData") === null) {
    
        
          var wordvine_obj = {};
          wordvine_obj[todays_date] = {
            "score": score,
            "final_board": final_board,
            "guess_count": guessCount,
          }
    
      } else {
        var wordvine_obj = JSON.parse(localStorage.getItem("WordVineData"));
        if (!(wordvine_obj.hasOwnProperty(todays_date))) {
          wordvine_obj[todays_date] = {
            "score": score,
            "final_board": final_board,
            "guess_count": guessCount,
          }
        }
      }
      let wordvine_obj_serialized = JSON.stringify(wordvine_obj);
      localStorage.setItem("WordVineData", wordvine_obj_serialized)
    }

    // 
    // 
    // GAME PLAYED STATUS
    // 
    // 
    function update_board_if_played(wordvine_obj, todays_date){
  
      // update board with previous result
      var ds_list = wordvine_obj[todays_date].final_board

      var first_row_board = ds_list.slice(0,6)
      var first_row = document.querySelectorAll('[row="1"]');
      for (let i = 0; i < first_row.length; i++) {
        if (i > game_words[0].length) {
          var letter = ""
        } else {
          var letter = game_words[0][i]
        }
        console.log(first_row[i])
        flip_tile(first_row[i], letter, first_row_board[i])
      }

      var second_row_board = ds_list.slice(6,12)
      var second_row = document.querySelectorAll('[row="2"]');
      for (let i = 0; i < second_row.length; i++) {
        if (i > game_words[1].length) {
          var letter = ""
        } else {
          var letter = game_words[1][i]
        }
        flip_tile(second_row[i], letter, second_row_board[i])
      }

      var third_row_board = ds_list.slice(12,18)
      var third_row = document.querySelectorAll('[row="3"]');
      for (let i = 0; i < third_row.length; i++) {
        if (i > game_words[2].length) {
          var letter = ""
        } else {
          var letter = game_words[2][i]
        }
        flip_tile(third_row[i], letter, third_row_board[i])
      }

      var fourth_row_board = ds_list.slice(18,24)
      var fourth_row = document.querySelectorAll('[row="4"]');
      for (let i = 0; i < fourth_row.length; i++) {
        if (i > game_words[3].length) {
          var letter = ""
        } else {
          var letter = game_words[3][i]
        }
        flip_tile(fourth_row[i], letter, fourth_row_board[i])
      }

      var fifth_row_board = ds_list.slice(24,30)
      var fifth_row = document.querySelectorAll('[row="5"]');
      for (let i = 0; i < fifth_row.length; i++) {
        if (i > game_words[4].length) {
          var letter = ""
        } else {
          var letter = game_words[4][i]
        }
        flip_tile(fifth_row[i], letter, fifth_row_board[i])
      }

      var sixth_row_board = ds_list.slice(30,36)
      var sixth_row = document.querySelectorAll('[row="6"]');
      for (let i = 0; i < sixth_row.length; i++) {
        if (i > game_words[5].length) {
          var letter = ""
        } else {
          var letter = game_words[5][i]
        }
        flip_tile(sixth_row[i], letter, sixth_row_board[i])
      }
    }




    // 
    // 
    // Util Functions
    // 
    // 

    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function formatNumber(num) {
      // Convert the number to a string
      let numStr = num.toString();
    
      // Count the number of digits
      const numDigits = numStr.length;
    
      // Calculate the number of zeros to fill in
      const zerosToAdd = 4 - numDigits;
    
      // Add zeros in front if needed
      if (zerosToAdd > 0) {
        numStr = "0".repeat(zerosToAdd) + numStr;
      }
    
      return numStr;
    }

    function play() {
      const play_screen = document.getElementById('howToPlay')
      play_screen.classList.add("closed")
    }

    
    


























// CREATING LINE GRAPH
let labels = ["", "", "", "", "","", "", "", "", "",];
let itemData = [0,0,0,0,0,0,0,0,0,0];

var data = {
  labels: labels,
  datasets: [{
    data: itemData,
    borderColor: 'rgb(62, 162, 124)',
    label: '',
    fill: true,
    backgroundColor: 'rgba(85,190,150, 0.3)',
    tension: 0.2,

  }]
};

var config = {
  type: 'line',
  data: data,
  options: {
    elements: {
      point:{
          radius: 0
      },
    },
    options: {  
      responsive: false,
      maintainAspectRatio: true,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: "last 10 scores"
      }
    }
  }
}


const chart = new Chart(
  document.getElementById('linechart'),
  config
)