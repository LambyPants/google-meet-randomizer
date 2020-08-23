import {
  randomizeGMeetParticipants,
  grossHackToLoadAllParticipants,
  resetParentController,
} from './helpers/content';

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
  if (request.action === 'reset') {
    resetParentController();
  }
});
