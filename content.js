let parentController;

function randomizeGMeetParticipants() {
  const arr = [];
  document.querySelectorAll(`*[data-sort-key]`).forEach((node) => {
    if (!node.innerText.startsWith('Presentation'))
      arr.push(node.getAttribute('data-sort-key').split(' spaces/')[0]);
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

async function grossHackToLoadAllParticipants() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //TODO: replace this function - there has to be a better way to do this
      // if you have a suggestion feel free to open a PR
      let firstKey = document.querySelector('*[data-sort-key]');

      while (firstKey && !parentController) {
        if (firstKey.hasAttribute('data-is-persistent')) {
          parentController = firstKey;
        }
        firstKey = firstKey.parentElement;
      }
      if (parentController) {
        parentController.style.height = '10000vh';
        window.dispatchEvent(new CustomEvent('resize'));
        setTimeout(() => {
          resolve(parentController);
        }, 500);
      } else {
        resolve(false);
      }
    }, 500);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sort' || request.action === 'resync') {
    (async () => {
      const chat = document.querySelector('*[data-tooltip~="everyone"]');
      chat.click();
      await grossHackToLoadAllParticipants();
      sendResponse({ data: randomizeGMeetParticipants() });
    })();
    return true; // keep the messaging channel open for sendResponse
  }
  if (request.action === 'reset' && parentController) {
    parentController.style.height = '';
  }
});
