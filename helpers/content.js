// parent element containing nametags
let parentController;

/**
 * Grabs all the participants in a meeting and shuffles them in an array
 * @returns {array}
 */
export function randomizeGMeetParticipants() {
  const arr = [];
  document.querySelectorAll(`*[data-participant-id]`).forEach((node) => {
    if (!node.innerText.startsWith('Presentation'))
      arr.push(node.innerText.split('\n')[0]);
  });

  function shuffle(array) {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex; // While there remain elements to shuffle...

    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1; // And swap it with the current element.

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  const shuffledArray = shuffle(arr);
  return shuffledArray;
}

/**
 * Google lazy loads the list of participants based on browser height; this solution is a hack which
 * basically makes the browser think it's taller than it really is so it loads all participants.
 * I am not particularly happy or proud of this solution. Any help would be appreciated :)
 * @async
 * @returns {void}
 */
export async function grossHackToLoadAllParticipants() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //TODO: replace this function - there has to be a better way to do this
      // if you have a suggestion feel free to open a PR
      let firstKey = document.querySelector('*[data-participant-id]');

      while (firstKey && !parentController) {
        if (firstKey.hasAttribute('data-is-persistent')) {
          parentController = firstKey;
        }
        firstKey = firstKey.parentElement;
      }
      if (parentController) {
        // arbitrarily large value
        parentController.style.height = '100000px';
        // tell the browser to redraw all the nametags
        window.dispatchEvent(new CustomEvent('resize'));
        setTimeout(() => {
          resolve(parentController);
        }, 500);
      } else {
        resolve(false);
      }
    }, 600);
  });
}

/**
 * Resets the parent controller styles
 * @returns {void}
 */
export function resetParentController() {
  if (parentController) {
    parentController.style.height = '';
    parentController = undefined;
  }
}
