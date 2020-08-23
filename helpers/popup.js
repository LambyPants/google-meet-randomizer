/**
 * Refreshes the DOM with a list of names and saves it to syncstorage
 * @param {object} response
 * @returns {void}
 */
export function refreshList(response) {
  const list = document.getElementById('list');
  const hasData = Boolean(response && response.data.length);
  const data = (hasData
    ? response.data
    : ['No results found - please try again']
  )
    .map(function(name, index) {
      return `<li>${index + 1}. ${name}</li>`;
    })
    .join('');
  list.innerHTML = data;
  chrome.storage.sync.set({ prevList: response });
}

/**
 * Checks to see if anyone has left or joined the meeting and removes / appends them to the DOM
 * @param {object} response
 * @fires refreshList
 * @returns {void}
 */
export function resyncList(response) {
  chrome.storage.sync.get(['prevList'], function({ prevList }) {
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

/**
 * Updates the DOM with a message on load - used when a list of names is unavailable
 * @param {string} text
 * @returns {void}
 */
export function applyStarter(text) {
  const list = document.getElementById('list');
  list.innerHTML = `<li class="starter">${text}</li>`;
}

/**
 * Copies text to clipboard
 * @param {string} text
 * @returns {void}
 */
export function copyTextToClipboard(text) {
  const copyFrom = document.createElement('textarea');
  copyFrom.textContent = text;
  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  copyFrom.blur();
  document.body.removeChild(copyFrom);
}

/**
 * Removes the gross styling hack which is used to lazy-load all participants within a meeting
 * @emits chrome.tabs.sendMessage
 * @returns {void}
 */
export function resetDOM() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'reset' });
  });
}

/**
 * Removes disabled class to all buttons
 * @param {HTMLButtonElement} check
 * @param {HTMLButtonElement} copy
 * @param {HTMLButtonElement} resync
 * @returns {void}
 */
export function enableAllButtons(check, copy, resync) {
  check.classList.remove('disabled');
  copy.classList.remove('disabled');
  resync.classList.remove('disabled');
}

/**
 * Applies disabled class to select buttons
 * @param {HTMLButtonElement} check
 * @param {HTMLButtonElement} copy
 * @param {HTMLButtonElement} resync
 * @returns {void}
 */
export function disableButtons(check, copy, resync) {
  if (check) check.classList.add('disabled');
  if (copy) copy.classList.add('disabled');
  if (resync) resync.classList.add('disabled');
}
