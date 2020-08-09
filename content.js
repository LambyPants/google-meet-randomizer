function randomizeGMeetParticipants() {
  const arr = [];
  document
    .querySelectorAll(`*[data-sort-key]`)
    .forEach((node) =>
      arr.push(node.getAttribute('data-sort-key').split(' spaces')[0]),
    );

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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'sort') {
    const arr = randomizeGMeetParticipants();
    if (!arr.length) {
      const chat = document.querySelector('*[data-tooltip~="everyone"]');
      if (chat) {
        chat.click();
        sendResponse({ data: [], retry: true });
      }
    } else {
      sendResponse({ data: arr });
    }
  }
  if (request.action === 'retry') {
    sendResponse({ data: randomizeGMeetParticipants() });
  }
});
