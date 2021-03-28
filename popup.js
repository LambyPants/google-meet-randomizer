import {
  refreshList,
  resetDOM,
  resyncList,
  applyStarter,
  copyTextToClipboard,
  enableAllButtons,
  disableButtons,
} from './helpers/popup';

document.addEventListener(
  'DOMContentLoaded',
  function() {
    const checkPageButton = document.getElementById('checkPage');
    const copyButton = document.getElementById('copy');
    const resyncButton = document.getElementById('resync');
    const autopostCheckbox = document.getElementById('autopost');
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const curId = url.split('?')[0];
      const isMeet = /\meet\.google\.com/.test(url);
      if (isMeet) {
        chrome.storage.sync.get(['prevList', 'prevId', 'autopost'], function({
          prevList,
          prevId,
          autopost,
        }) {
          if (
            prevList &&
            prevList.data &&
            prevList.data.length &&
            prevId === curId
          ) {
            enableAllButtons(checkPageButton, copyButton, resyncButton);
            refreshList(prevList);
          } else {
            chrome.storage.sync.set({
              prevList: [],
              prevId: curId,
            });
            disableButtons(resyncButton, copyButton);
            applyStarter(
              'No previous results found. Click the randomize button to generate a new list.',
            );
          }
          if (autopost) {
            autopostCheckbox.setAttribute('checked', '');
          }
        });
      } else {
        disableButtons(resyncButton, copyButton, checkPageButton);
        applyStarter('This extension only works on google.meet.com');
      }
    });

    checkPageButton.addEventListener(
      'click',
      function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(
          tabs,
        ) {
          applyStarter('Randomizing participants...');
          chrome.tabs.sendMessage(tabs[0].id, { action: 'sort' }, function(
            response,
          ) {
            if (response) {
              refreshList(response, autopostCheckbox.checked);
              resetDOM();
              if (response.data && response.data.length) {
                enableAllButtons(checkPageButton, copyButton, resyncButton);
              }
            }
          });
        });
      },
      false,
    );
    resyncButton.addEventListener(
      'click',
      function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(
          tabs,
        ) {
          applyStarter('Checking to see if anyone left or joined...');
          chrome.tabs.sendMessage(tabs[0].id, { action: 'resync' }, function(
            response,
          ) {
            if (response) {
              resyncList(response, autopostCheckbox.checked);
              resetDOM();
            }
          });
        });
      },
      false,
    );
    copyButton.addEventListener(
      'click',
      function() {
        const list = document.getElementById('list');
        copyTextToClipboard(list.innerText);
        window.close();
      },
      false,
    );
    autopostCheckbox.addEventListener('change', function(e) {
      const shouldAutopost = e.currentTarget.checked;
      chrome.storage.sync.set({
        autopost: shouldAutopost,
      });
    });

    window.addEventListener(
      'beforeunload',
      () => {
        resetDOM();
      },
      true,
    );
  },
  false,
);
