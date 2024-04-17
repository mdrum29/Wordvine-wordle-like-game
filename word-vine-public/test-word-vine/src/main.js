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
import '../styles/components/contactmodal.css';
import '../styles/components/remindermodal.css';
import '../styles/utils.css';
import puzzles from './puzzles.js';


  // V 2.0.0

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

 
    // init new game
    if (already_played_check(todays_date) === true) {
      // if already played today
      already_played_check(todays_date)
      // remove enter and next letter
      var enterKey = document.querySelector("[data-enter]")    
      var hintKey = document.querySelector("[data-help]")  
      enterKey.removeAttribute("data-enter");
      hintKey.removeAttribute("data-help");
    } else {
      //  if havent played today
      open_help_modal()
      setTimeout(function() {
        flip_help_tiles ();
      }, 750);
    }


    function flip_help_tiles () {
      var flip_wait_time = 50

      function set_all_tiles_back() {
        var tiles = document.querySelectorAll('.practice');
        console.log(tiles)
        tiles.forEach(tile=> {
          // tile.classList.remove('shine')
          tile.classList.remove('flip')
        })
      }
    
      set_all_tiles_back()
        var first_word = "BOOK";
        var first_row = document.querySelectorAll('[row="x"]');
    
        var second_word = "SHELF"
        var second_row = document.querySelectorAll('[row="y"]');

        var third_word = "LIFE"
        var third_row = document.querySelectorAll('[row="z"]');
        
        // Call the function with tiles, duration, and delayBetweenTiles
        
        first_row.forEach(tile => {
          tile.className = "tile";
        })
        first_row.forEach(tile => {
            var col = parseInt(tile.getAttribute("cols"),10)
            tile.classList.remove("flip")
            
            if (col -1 < first_word.length){
                var letter = first_word[col-1].toUpperCase()
                setTimeout( function() {
                flip_tile(tile, letter, "starter")
                },col*flip_wait_time + col)
            } else {
                var letter = ''
                setTimeout( function() {
                flip_tile(tile, letter, "starter")
                },col*flip_wait_time + col)
            };
        }) 
        setTimeout(function() {
          second_row.forEach(tile => {
            tile.className = "tile";
          })
          second_row.forEach(tile => {
              var col = parseInt(tile.getAttribute("cols"),10)
              tile.classList.remove("flip")
              
              if (col -1 < second_word.length){
                var letter = second_word[col-1].toUpperCase()
                setTimeout( function() {
                flip_tile(tile, letter, "correct")
                },col*flip_wait_time)
            
              } else {
                  var letter = ''
                  setTimeout( function() {
                    flip_tile(tile, letter, "disabled")
                    },col*flip_wait_time)
                };
          }) 
        }, 1000);
        setTimeout(function() {
          third_row.forEach(tile => {
            tile.className = "tile";
          })
          third_row.forEach(tile => {
            
              var col = parseInt(tile.getAttribute("cols"),10)
              tile.classList.remove("flip")
              
              if (col -1 < third_word.length){
                  var letter = third_word[col-1].toUpperCase()
                  setTimeout( function() {
                  flip_tile(tile, letter, "correct")
                  },col*flip_wait_time)
              
              } else {
                  var letter = ''
                  setTimeout( function() {
                    flip_tile(tile, letter, "disabled")
                    },col*flip_wait_time)
              };
          }) 
        }, 2000);
        startInteraction()
    }
    

    function startGame() {
      var existing_storage = getStorage()

      if (existing_storage) {
        if (existing_storage[todays_date]) {
          // if already played today
          var existing_storage = getStorage()
          var avg = get_average (existing_storage)
          var high = get_high (existing_storage)
          var games_streak = findConsecutiveDates(existing_storage);
          var last10_scores = getlast10(existing_storage,last_score)
          var last_score = existing_storage[todays_date].score

          setTimeout(function() {
            open_stats_modal(last_score, avg, high, games_streak, existing_storage);
          }, 1000);

        } else {
          // if havent played today
          setTimeout(function() {
            fill_in_first_and_last(game_words);
          }, 500);
          startTimer();
        }
      } else {
          // if havent played today
          setTimeout(function() {
            fill_in_first_and_last(game_words);
          }, 500);
          startTimer();
      }
    }
    

    function getPuzzle(puzzles, dayOffset) {
      const targetWords = puzzles[Math.floor(dayOffset)]
      return targetWords
    }
  
     
  
    function set_all_tiles_back_to_default() {
      var tiles = document.querySelectorAll('.tile');
      tiles.forEach(tile=> {
        // tile.classList.remove('shine')
        tile.classList.remove('flip')
      })
    }
  
    function fill_in_first_and_last(game_words) {
      set_all_tiles_back_to_default()
      var first_word = game_words[0];
      var first_row = document.querySelectorAll('[row="1"]');
  
      var second_word = game_words[1];
      var second_row = document.querySelectorAll('[row="2"]');
      var last_word = game_words[game_words.length - 1];
      var last_row = document.querySelectorAll('[row="' + game_words.length.toString() + '"]');
      
      // Call the function with tiles, duration, and delayBetweenTiles
      
        first_row.forEach(tile => {
          tile.className = "tile";
        })
        first_row.forEach(tile => {
            var col = parseInt(tile.getAttribute("col"),10)
            tile.classList.remove("flip")
            
            if (col -1 < first_word.length){
                var letter = first_word[col-1].toUpperCase()
            } else {
                var letter = ''
            };
            flip_tile(tile, letter, "starter")
        })
          // // giving first letter of second word.
        flip_tile(second_row[0], second_word[0], "correct")       
        }
  
    function turnOn_keys() {
      document.addEventListener("keydown", handleKeyPress)
    }

    function turnOff_keys() {
      document.removeEventListener("keydown", handleKeyPress)
    }


    function startInteraction() {
      document.addEventListener("click", handleMouseClick)
      document.addEventListener("keydown", handleKeyPress)
    }
    
    function stopInteraction() {
      document.removeEventListener("click", handleMouseClick)
      document.removeEventListener("keydown", handleKeyPress)
    }
    
    function handleMouseClick(e) {
      
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

      if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key)
        return
      }
      
      // non-game button clicks
      if (e.target.matches("[data-help]")) {
       give_hint();
       e.target.blur();
      
       return
      }

      if (e.target.matches("[data-close-stat-modal]")) {
        close_stats_modal()
        turnOn_keys()
        e.target.blur();
      
        return
      }

      if (e.target.matches("[data-play]")) {
        disableClicks()
        play()
        setTimeout(function(){
          enableClicks()
         }, 1200);
         console.log("hit")
        
        e.target.blur();
        return
      }

      if (e.target.matches("[data-share]")) {
        share(puzzle_number)
        e.target.blur();
        return
      }

      // NAV BAR LINKS
      if (e.target.matches("[data-instructions]")) {
        disableClicks()
        open_help_modal()
        setTimeout(function(){
          enableClicks()
         }, 300);
        e.target.blur();
        return
      }

      if (e.target.matches("[data-stats]")) {
        disableClicks()
        turnOff_keys()
        stats_link_open_modal(todays_date)
        setTimeout(function(){
          enableClicks()
         }, 400);
        e.target.blur();
        return
      }

      if (e.target.matches("[data-reminder]")) {
        disableClicks()
        turnOff_keys()
        open_reminder_modal()
        setTimeout(function(){
          enableClicks()
         }, 400);
        e.target.blur();
        return
      }

      if (e.target.matches("[data-close-reminder-modal]")) {
        close_reminder_modal()
        e.target.blur();
        return
      }

      if (e.target.matches("[data-reminder-btn]")) {
        disableClicks()
        set_reminder()
        setTimeout(function(){
          enableClicks()
         }, 400);
        e.target.blur();
        return
      }

      if (e.target.matches("[data-contact]")) {
        turnOff_keys()
        disableClicks()
        open_contact_modal()
        setTimeout(function(){
          enableClicks()
         }, 1200);
        e.target.blur();
        return
      }
      if (e.target.matches("[data-close-contact-modal]")) {
        close_contact_modal()
        turnOn_keys()
        e.target.blur();
        return
      }

      if (e.target.matches("[data-send-msg]")) {
        send_msg()

        e.target.blur();
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
  
      
      var tiles_in_row = guessGrid.querySelector('.tile:not([data-state])')
      const nextTile = guessGrid.querySelector('.tile:not([data-state])')
      if (nextTile == null) return

      if (nextTile.getAttribute("col") === "1") return;
      // get all tiles in the row? and then cap it at 6
      var row_lookup = nextTile.getAttribute("row")
      var current_row = document.querySelectorAll(`[row="${row_lookup}"]`)
      var filled_in = document.querySelectorAll(`[row="${row_lookup}"][data-state="correct"]`)
      var count = filled_in.length 
      var all_tiles = document.querySelectorAll(`[row="${row_lookup}"][data-state="correct"], [row="${row_lookup}"][data-state="active"]`);
      if (all_tiles.length >= MAX_WORD_LENGTH) return;
      nextTile.dataset.state = "active"
      nextTile.dataset.letter = key.toUpperCase()
      nextTile.textContent = key
    
    }
    
    
    function deleteKey() {
  
      var next_tile = guessGrid.querySelector('.tile:not([data-state])')
      const activeTiles = getActiveTiles()
      const lastTile = activeTiles[activeTiles.length - 1]
      if (lastTile == null) return
      lastTile.textContent = ""
      delete lastTile.dataset.state
      delete lastTile.dataset.letter
    }
    
    function submitGuess() {
      
  
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
      console.log(guess.length)
      if (guess.length < 3) {
        showAlert("Guess must be more than 2 letters.")
        return
      } 

      count_guess()
      
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
    
    
    function getActiveTiles() {
      return guessGrid.querySelectorAll('[data-state="active"]')
    }
  
  //   Created by me.
    function locateTiles (tiles) {
      var tile_locations = []
      tiles.forEach(function (tile) {
          var locationValue = tile.getAttribute('row');
          tile_locations.push(locationValue)
      
      });
      return 'row' + tile_locations[0];
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
  
  //   correct answer function working as expected.
    function correct_answer() {
      var ats = getActiveTiles() 
      var guessed_word = getGuess(ats)
      var targetRow = ats[0].getAttribute('row')
      var right_answer = game_words[parseInt(targetRow,10) - 1].toUpperCase()
  
      if (guessed_word === right_answer) {    
          updateDataStateForRow(targetRow)       
      }
      return
      }
  
      function updateDataStateForRow(targetRow) {
      // Iterate through each div with the class "tile" inside the guess grid
      const tiles = document.querySelectorAll('.tile[row="' + targetRow + '"]:not([data-state="correct"]):not([data-state="hint_given"])');
      tiles.forEach(tile => {
          if (tile.textContent.trim() !== '') {
              // Change the data state to 'correct' if there is text content
              tile.setAttribute('data-state', 'correct');
          } else {
              // Change the data state to 'disabled' if there is no text content
              tile.setAttribute('data-state', 'disabled');
          }
          });
      }
  
      function wrong_answer() {
          var ats = getActiveTiles() 
          var guessed_word = getGuess(ats)
          if (ats[0]){
            var targetRow = ats[0].getAttribute('row')
            var right_answer = game_words[parseInt(targetRow,10) - 1].toUpperCase()
        
            if (guessed_word !== right_answer) {    
                RemoveTextForRow(targetRow)       
          }}
          return
          }
  
      function RemoveTextForRow(targetRow) {
          // Iterate through each div with the class "tile" inside the guess grid
          const tiles = document.querySelectorAll('.tile[row="' + targetRow + '"]')
          tiles.forEach(tile => {
              if  (tile.getAttribute('data-state') !== 'correct' && tile.getAttribute('data-state') !== 'hint_given'){
              tile.textContent = ''
              tile.removeAttribute('data-state')
              }
              });
          }
  
      function give_next_letter() {
          var next = guessGrid.querySelector('.tile:not([data-state])')
          var targetRow = next.getAttribute('row')
          var right_answer = game_words[parseInt(targetRow,10) - 1].toUpperCase()
          
          var col = parseInt(next.getAttribute('col'),10)
          var next_letter = right_answer[col-1]
  
          // sets the first active tile to the correct next letter and changes data-state to correct.
          flip_tile(next, next_letter, 'correct')
        //   setTimeout(function(){
        //     shine_tiles(next)
        // }, 350);
          
  
          var curr_row = document.querySelectorAll('.tile[row="' + targetRow + '"]')
          var guessed_word = getGuess(curr_row)
          var right_answer = game_words[parseInt(targetRow,10) - 1].toUpperCase()
          if (guessed_word === right_answer) {
              updateDataStateForRow(targetRow)
              give_next_letter()
          }
          
      }
  
      function give_hint() {
         
          count_hint()
          var last_correct = document.querySelectorAll('[data-state="correct"]:not([row="x"]):not([row="y"]):not([row="z"]), [data-state="hint_given"]:not([row="x"]):not([row="y"]):not([row="z"]), [data-state="disabled"]:not([row="x"]):not([row="y"]):not([row="z"])');
          var cur_row = last_correct[last_correct.length-1].getAttribute("row")
          var next_col = (parseInt(last_correct[last_correct.length-1].getAttribute("col"),10) + 1).toString()
          var hint_tile = document.querySelector('.tile[row="' + cur_row + '"][col="' + next_col + '"]');
          if (hint_tile == null) return

          RemoveTextForRow(cur_row) // removing letters from row then giving hint

          var word = game_words[cur_row-1]
          var letter = word[parseInt(next_col,10)-1]

          hint_tile.dataset.letter = letter
          hint_tile.textContent = letter
          hint_tile.setAttribute('data-state', 'hint_given')
  
          var tiles_in_row = document.querySelectorAll('.tile[row="' + cur_row + '"]');
          var guessed_word = getGuess(tiles_in_row)
          var right_answer = game_words[parseInt(cur_row,10) - 1].toUpperCase()
          if (guessed_word === right_answer) {
              updateDataStateForRow(cur_row)
              var WL = checkWinLose()
              if (WL !== true) {
                give_next_letter()
              } else {
                var final_board = getFinalBoard()
                var last_score = calculate_score(MAX_SCORE, seconds, guessCount, hintCount)
                setStorage(final_board, last_score, guessCount)
                var existing_storage = getStorage()
                var avg = get_average (existing_storage)
                var high = get_high (existing_storage)
                var games_streak = findConsecutiveDates(existing_storage);
                var last10_scores = getlast10(existing_storage, last_score)
                open_stats_modal(last_score, avg, high, games_streak, existing_storage)
                update_chart(chart, last10_scores)
                var enterKey = document.querySelector("[data-enter]")    
                var hintKey = document.querySelector("[data-help]")  
                enterKey.removeAttribute("data-enter");
                hintKey.removeAttribute("data-help");
                
              }
          };
          startInteraction()
      }
  
      function checkWinLose() {
        const remainingTiles = guessGrid.querySelectorAll(":not([data-state])");
        const all_tiles =  guessGrid.querySelectorAll("[data-state]");
      
        if (remainingTiles.length === 0) {
          var score = calculate_score(MAX_SCORE, seconds, guessCount, hintCount)
          stopTimer()
          stopInteraction();
  
          danceTiles(guessGrid.querySelectorAll('.tile[row="' + "6" + '"]'))
          return true;
        }
      
        return false;
      }
  
      function showAlert(message, duration = 1000) {
        const alert = document.createElement("div")
        alert.textContent = message
        alert.classList.add("alert")
        alertContainer.prepend(alert)
        if (duration == null) return
      
        setTimeout(() => {
          alert.classList.add("hide")
          alert.addEventListener("transitionend", () => {
            alert.remove()
          })
        }, duration)
      }
  
      function shakeTiles(tiles) {
        stopInteraction()
        tiles.forEach(tile => {
          tile.classList.add("shake")
          tile.addEventListener(
            "animationend",
            () => {
              tile.classList.remove("shake")
            },
            { once: true }
          )
        })
        startInteraction();
      }
  
      function animateText(element, duration = 2000) {
        const startTime = Date.now();
        const lettersToAnimate = element.dataset.text.split("");
        const steps = lettersToAnimate.length;
      
        const map = (n, x1, y1, x2, y2) => Math.min(Math.max(((n - x1) * (y2 - x2)) / (y1 - x1) + x2, x2), y2);
      
        const random = (set) => set[Math.floor(Math.random() * set.length)];
      
        let frame;
      
        function animationFrame() {
          var frame = requestAnimationFrame(animationFrame);
      
          const step = Math.round(map(Date.now() - startTime, 0, duration, 0, steps));
      
          element.innerText = lettersToAnimate
            .map((s, i) => (step - 1 >= i ? lettersToAnimate[i] : random("0123456789")))
            .join("");
      
          if (step >= steps) {
            cancelAnimationFrame(frame);
          }
        }
      
        animationFrame();
      }
  
      let intervalId;
      let seconds = 0;
  
      function startTimer() {
        // Ensure the timer is not already running
        if (!intervalId) {
          intervalId = setInterval(updateTimer, 1000);
        }
      }
    
      // Function to stop the timer
      function stopTimer() {
        // Ensure the timer is running before attempting to stop it
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    
      // Function to update the timer display
      function updateTimer() {
        seconds++;
        document.getElementById('timer').innerText = seconds;
      }
    
      // Start the timer automatically on page load
      
  
      let guessCount = 0;
      let hintCount = 0;
  
      function count_guess() {
        // Increment the guess count
        guessCount++;
    
        // Update the HTML to display the new guess count
        document.getElementById('guessCounter').innerText = guessCount;
      }
  
      function count_hint() {
        // Increment the guess count
        hintCount++;
    
        // Update the HTML to display the new guess count
        document.getElementById('hintCounter').innerText = hintCount;
      }
  
      function calculate_score(MAX_SCORE, seconds, guessCount, hintCount){
        const hint_penalty = (hintCount * 75); 
        const guess_penalty = (guessCount * 3);
        const time_penalty = (seconds * 2);
        var points = MAX_SCORE - hint_penalty - time_penalty - guess_penalty
        const score = Math.round(Math.max(points, 0));
        return score;
  
      }
  
      function danceTiles(tiles) {
        tiles.forEach((tile, index) => {
          setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener(
              "animationend",
              () => {
                tile.classList.remove("dance")
              },
              { once: true }
            )
          }, (index * DANCE_ANIMATION_DURATION) / 6)
        })
      }
  
       
  function flip_tile(tiles, next_letter, dataset){
    console.log(tiles)
    stopInteraction();
    if (!tiles.length) {
      tiles.classList.add("flip");
      tiles.addEventListener(
        "transitionend",
        () => {
          tiles.classList.remove("flip");

          tiles.dataset.letter = next_letter;
          tiles.textContent = next_letter;
          tiles.setAttribute('data-state', dataset)
          
        },
        { once: false }
      )
    } else {

    tiles.forEach((tile) => {
      setTimeout(function() {
        console.log("hit")
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
    }, 500)})
    }startInteraction();
  }

  
  
  // stat modal
  var intervalId2;
  
  function open_stats_modal(last_score, avg, high, streak) {
    
    // Update the countdown every second
    updateCountdown();
    intervalId2 = setInterval(updateCountdown, 1000);    

    const modal = document.getElementById('outer-stats-modal')
    modal.classList.add("open")
    update_stats(last_score, avg, high, streak)
  }
  
  function close_stats_modal() {
    clearInterval(intervalId2);
    clearInterval(intervalId2-1);
    intervalId2 = null;
    const modal = document.getElementById('outer-stats-modal')
    modal.classList.remove("open")
  }
  
  function update_stats(last_score, avg, high, streak) {
    var last_score_div = document.querySelector("[data-last-score]")

    if (last_score == null) {
      last_score = 0
      }
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
      var streak = 0
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
          "date_played": todays_date
        }
      }
    }
    let wordvine_obj_serialized = JSON.stringify(wordvine_obj);
    localStorage.setItem("WordVineData", wordvine_obj_serialized)
  }
  
  function already_played_check(todays_date) {
    if (localStorage.getItem("WordVineData") !== null) {
      var wordvine_obj = JSON.parse(localStorage.getItem("WordVineData"))
      if (wordvine_obj.hasOwnProperty(todays_date)) {
        var last_score = wordvine_obj[todays_date].score
        var avg = get_average (wordvine_obj)
        var high = get_high (wordvine_obj)
        var games_streak = findConsecutiveDates(wordvine_obj);
        var last10_scores = getlast10(wordvine_obj, last_score)

        setTimeout(function() {
          update_board_if_played(wordvine_obj, todays_date);
        }, 500);
  
        setTimeout(function() {
          open_stats_modal(last_score, avg, high, games_streak);
        }, 1300);
  
        setTimeout(function() {
          update_chart(chart, last10_scores);
        }, 2000);
  
        
        
        
        return true
      } return false
  
    }
  }
  
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
  
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }  
      
  function getlast10 (wordvine_obj, last_score){
    if (wordvine_obj == null) {
      return [0,0,0,0,0,0,0,0,0,last_score]
    } else {
      var all_keys = Object.keys(wordvine_obj)
      var all_keys = all_keys

      let last10_scores = []
      i=0

      for (let i = 0; i < all_keys.length; i++) {
        var game_day = all_keys[i]
        var historical_score = wordvine_obj[game_day].score
        last10_scores[i] = historical_score
      }

      if (!wordvine_obj[todays_date]){
        last10_scores[last10_scores.length] = last_score
      }
      
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
      var puke = String.fromCodePoint(0x1F92E)
      var silver_medal = String.fromCodePoint(0x1F948)
      var bronze_medal = String.fromCodePoint(0x1F949)
      var thumbs_down = String.fromCodePoint(0x1F44E)


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

      if (last_score > 850) {
        var performance_emoji = trophy
      } 
      else if (last_score >700) {
        var performance_emoji = silver_medal
      } 
      else if (last_score >600) {
        var performance_emoji = bronze_medal
      }
      else if (last_score > 400) {
        var performance_emoji = thumbs_down
      } 
      else {
        var performance_emoji = puke
      }

      var line1 = 'Difficulty Score: ' + last_score + '' + performance_emoji
      var line2 = white_square + white_square + white_square + white_square + white_square + white_square
      var line3 = ''
      var line4 = ''
      var line5 = ''
      var line6 = ''
      var line7 = ''
      // var line8 = 'Can you beat my score?' + smirk
      var line8 = ""

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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log(isMobile)
      if (isMobile) {
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
          showAlert("WordVine score copied to clipboard!");

        }
        } else {
          // if client is on a desktop
          navigator.clipboard.writeText(text_msg);
        
          // Alert the copied text
          showAlert("WordVine score copied to clipboard!");

        }
    };

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
      startGame()
    }

    function open_help_modal() {
      var play_screen = document.getElementById('howToPlay')
      play_screen.classList.remove("closed")

      setTimeout(function() {
        flip_help_tiles ();
      }, 750);

    }

    function stats_link_open_modal (todays_date) {
      if (localStorage.getItem("WordVineData") !== null) {
        var wordvine_obj = JSON.parse(localStorage.getItem("WordVineData"))
        if (wordvine_obj.hasOwnProperty(todays_date)) {
          var last_score = wordvine_obj[todays_date].score
          var avg = get_average (wordvine_obj)
          var high = get_high (wordvine_obj)
          var games_streak = findConsecutiveDates(wordvine_obj);
          var last10_scores = getlast10(wordvine_obj, last_score)
          open_stats_modal(last_score, avg, high, games_streak);
          
          setTimeout(function() {
            update_chart(chart, last10_scores);
          }, 100);
            } else {
              var all_keys = Object.keys(wordvine_obj)
              var last_date = all_keys.slice[all_keys.length-1]
              var last_score = wordvine_obj[last_date].score
              var avg = get_average (wordvine_obj)
              var high = get_high (wordvine_obj)
              var games_streak = findConsecutiveDates(wordvine_obj);
              var last10_scores = getlast10(wordvine_obj, last_score)
              open_stats_modal(last_score, avg, high, games_streak);
            }
        }
        else {
          open_stats_modal(0, 0, 0, 0);
        }
      }

      function calculateTimeRemaining() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Set to midnight

        const timeRemaining = midnight - now;
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        

        return {
            hours: hours < 10 ? "0" + hours : hours,
            minutes: minutes < 10 ? "0" + minutes : minutes,
            seconds: seconds < 10 ? "0" + seconds : seconds
        };
    }

    // Function to update the countdown display
    function updateCountdown() {
        const timeRemaining = calculateTimeRemaining();
        document.getElementById('countdown-timer').textContent = `${timeRemaining.hours}:${timeRemaining.minutes}:${timeRemaining.seconds}`;
    }



function contact_me(subject, user_email, content) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "subject": subject,
    "user_email": user_email,
    "content": content
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://flask-hello-world-git-main-mdrum29s-projects.vercel.app/contact-me", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}
// contact_me("hello", "mdrum29@gmail.com", "you got it working")


function add_email(name, email, phone) {          
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "name": name,
    "email": email,
    "phone": phone
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://flask-hello-world-git-main-mdrum29s-projects.vercel.app/add-email", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

}

// add_email("john", "email@test.com", "1234567890")

function open_contact_modal() {
  const modal = document.getElementById('outer-contact')
  modal.classList.add("open")
}
function close_contact_modal() {
  const modal = document.getElementById('outer-contact')
  modal.classList.remove("open")
}

function open_reminder_modal() {
  const modal = document.getElementById('outer-reminder')
  modal.classList.add("open")
}
function close_reminder_modal() {
  const modal = document.getElementById('outer-reminder')
  modal.classList.remove("open")
}

function send_msg() {
  // Get form elements by their IDs
  var form = document.querySelector('.contactme');
  // Get input values from the form
  var email = form.querySelector('.email-input').value;
  var name = form.querySelector('.name-input').value;
  var message = form.querySelector('.msg-input').value;
  if (!email || !name || !message) {
    showAlert("Please fill in all fields.");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Invalid Email");
    return
  }

  contact_me(name, email, message) 
  close_contact_modal()
  turnOn_keys()
}

function set_reminder() {
    // Get form elements by their IDs
    var form = document.querySelector('.reminder_form');
    // Get input values from the form
    var email = form.querySelector('.reminder-email-input').value;
    var name = form.querySelector('.reminder-name-input').value;


    if (!email || !name) {
      showAlert("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      showAlert("Invalid Email");
      return
    }

    add_email(name, email, "")
    close_reminder_modal()
    turnOn_keys()

}

function isValidEmail(email) {
  // Regular expression for a basic email validation
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function stopIt(e) {
  e.preventDefault();
  e.stopPropagation();
}

function disableClicks() { 
  document.body.addEventListener("click", stopIt);
}

// then later

function enableClicks() {
  document.body.removeEventListener("click", stopIt);
}