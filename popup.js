function refreshList(response) {
  const list = document.getElementById('list');
  const hasData = Boolean(response && response.data.length);
  const data = (hasData
    ? response.data
    : ['No results found - please try again']
  )
    .map(function (name, index) {
      return `<li>${index + 1}. ${name}</li>`;
    })
    .join('');
  list.innerHTML = data;
  chrome.storage.sync.set({ prevList: response });
}

function resyncList(response) {
  chrome.storage.sync.get(['prevList'], function ({ prevList }) {
    if (prevList && prevList.data && response && response.data) {
      const obj = {};
      const arr = [];
      response.data.forEach((name) => {
        const index = prevList.data.findIndex((oName, i) => {
          return oName === name && !obj[i];
        });
        if (index >= 0) {
          obj[index] = name;
        } else {
          arr.push(name);
        }
      });
      const resyncedArr = Object.keys(obj)
        .map((key) => obj[key])
        .concat(arr);
      refreshList({ data: resyncedArr });
    } else {
      refreshList({ data: [] });
    }
  });
}

function applyStarter(text) {
  const list = document.getElementById('list');
  list.innerHTML = `<li class="starter">${text}</li>`;
}

function copyTextToClipboard(text) {
  const copyFrom = document.createElement('textarea');

  copyFrom.textContent = text;

  document.body.appendChild(copyFrom);

  copyFrom.select();

  document.execCommand('copy');
  copyFrom.blur();
  document.body.removeChild(copyFrom);
}

function resetDOM() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'reset' });
  });
}

function enableAllButtons(check, copy, resync) {
  check.classList.remove('disabled');
  copy.classList.remove('disabled');
  resync.classList.remove('disabled');
}
document.addEventListener(
  'DOMContentLoaded',
  function () {
    const checkPageButton = document.getElementById('checkPage');
    const copyButton = document.getElementById('copy');
    const resyncButton = document.getElementById('resync');
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const curId = url.split('?')[0];
      const isMeet = /\meet\.google\.com/.test(url);
      if (isMeet) {
        chrome.storage.sync.get(['prevList', 'prevId'], function ({
          prevList,
          prevId,
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
            resyncButton.classList.add('disabled');
            copyButton.classList.add('disabled');
            applyStarter('No previous results found');
          }
        });
      } else {
        resyncButton.classList.add('disabled');
        copyButton.classList.add('disabled');
        checkPageButton.classList.add('disabled');
        applyStarter('This extension only works on google.meet.com');
      }
    });

    checkPageButton.addEventListener(
      'click',
      function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs,
        ) {
          applyStarter('Randomzing participants...');
          chrome.tabs.sendMessage(tabs[0].id, { action: 'sort' }, function (
            response,
          ) {
            if (response) {
              refreshList(response);
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
      function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs,
        ) {
          console.log('go!');
          applyStarter('Checking to see if anyone left or joined...');
          chrome.tabs.sendMessage(tabs[0].id, { action: 'resync' }, function (
            response,
          ) {
            if (response) {
              resyncList(response);
              resetDOM();
            }
          });
        });
      },
      false,
    );
    copyButton.addEventListener(
      'click',
      function () {
        const list = document.getElementById('list');
        copyTextToClipboard(list.innerText);
        window.close();
      },
      false,
    );

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
