import {
  randomizeGMeetParticipants,
  grossHackToLoadAllParticipants,
  resetParentController,
} from './helpers/content';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sort' || request.action === 'resync') {
    (async () => {
      const chat =
        document.querySelector('*[data-tooltip~="everyone"]') ||
        document.querySelector('button[data-panel-id="1"]');
      if (chat) {
        chat.click();
        await grossHackToLoadAllParticipants();
        sendResponse({ data: randomizeGMeetParticipants() });
      } else {
        sendResponse({ data: [] });
      }
    })();
    return true; // keep the messaging channel open for sendResponse
  }
  if (request.action === 'reset') {
    resetParentController();
  }
  if (request.action === 'autopost') {
    // when the autopost checkbox is checked, post to chat
    const everyoneChat =
      document.querySelector('*[data-tooltip~="Chat"]') ||
      document.querySelector('button[data-panel-id="2"]');
    if (everyoneChat) {
      if (everyoneChat.getAttribute('aria-pressed') !== 'true') {
        everyoneChat.click();
      }
      setTimeout(() => {
        const textArea = document.querySelector('textarea');
        const send = document.querySelector('button[aria-label~="Send"]');
        console.log('send: ', send);

        if (textArea && send) {
          textArea.value = request.data;
          send.removeAttribute('disabled');
          send.removeAttribute('aria-disabled');
          send.click();
        }
      }, 300);
    }
  }
});
