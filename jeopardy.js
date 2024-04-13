
const $startButton = $('.start-button');
const $tHead = $('th');
let categories = [];

/* Get category id */
async function getCategory() {
  try {
    const response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/categories?count=100');
    return response.data.map(category => category.id);
  } catch (error) {
    console.error("Error fetching category IDs", error);
    return [];
  }
}

/* Get category clues */
async function getClues(catId) {
  try {
    const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
    const allClues = response.data.clues.slice(0, 5); // Take the first 5 clues

    categories.push({
      title: response.data.title,
      clues: allClues
    });
  } catch (error) {
    console.error("Error fetching clues:", error);
  }
}

function fillTable() {
  $tHead.each(function(index) {
    if (categories[index]) {
      $(this).text(categories[index].title).addClass('th_styles');
    }
  });

  $('tbody tr').each(function(rowIndex) {
    $(this).find('td').each(function(colIndex) {
      if (categories[colIndex] && categories[colIndex].clues[rowIndex]) {
        let clue = categories[colIndex].clues[rowIndex];
        $(this).data('question', clue.question).data('answer', clue.answer).data('isQuestion', true);
        $(this).html('<h2>?</h2>'); // Wrap "?" with <h2> to match CSS rules
      }
    });
  });
}

/* Show table with categories and clues */
async function showLoadingView() {
  $('.hidden').removeClass();
  $startButton.text('Loading...');

  const catIds = await getCategory();
  if (catIds.length === 0) {
    console.error("No category IDs fetched");
    return;
  }
  const randomCatIds = catIds.sort(() => 0.5 - Math.random()).slice(0, 6);
  await Promise.all(randomCatIds.map(getClues));
  fillTable();

  setTimeout(() => { $startButton.text("Restart!"); }, 500);
}

$(document).ready(function() {
  let gameLoaded = false;

  // Event listener for the start button
  $('.start-button').on('click', function() {
    if (gameLoaded) {
      // Refresh the page if the game has already been loaded once
      location.reload();
    } else {
      // Load the game for the first time
      showLoadingView();
      gameLoaded = true;  // The game has been loaded
      $startButton.text("Restart!");
    }
  });

  // Click event for each cell in the game board
  $('tbody').on('click', 'td', function() {
    let isQuestion = $(this).data('isQuestion');
    let question = $(this).data('question');
    let answer = $(this).data('answer');

    if (isQuestion) {
      $(this).text(question).data('isQuestion', false);
      $(this).addClass('clicked-question').removeClass('clicked-answer');
    } else {
      $(this).text(answer).addClass('clicked-answer').removeClass('clicked-question');
      $(this).off('click'); // Remove click event handler after displaying answer
    }
  });
});

/* Start Button Event Listener */
$('.start-button').on('click', showLoadingView);

/* Initialize */
$(document).ready(function() {
  // Any initialization code if needed
});