function refreshList(response) {
  const list = document.getElementById('list');
  const data = (response.data || [])
    .map((name, index) => {
      return `<li>${index + 1}. ${name}</li>`;
    })
    .join('/n');
  list.innerHTML = data;

  copyTextToClipboard(document.getElementById('list').innerText);
}

function copyTextToClipboard(text) {
  var copyFrom = document.createElement('textarea');

  copyFrom.textContent = text;

  document.body.appendChild(copyFrom);

  copyFrom.select();

  document.execCommand('copy');
  copyFrom.blur();
  document.body.removeChild(copyFrom);
}

document.addEventListener(
  'DOMContentLoaded',
  function () {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let url = tabs[0].url;
      // use `url` here inside the callback because it's asynchronous!
    });

    const checkPageButton = document.getElementById('checkPage');
    const copyButton = document.getElementById('copy');
    checkPageButton.addEventListener(
      'click',
      function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs,
        ) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'sort' }, function (
            response,
          ) {
            if (response && !response.retry) {
              refreshList(response);
            } else if (response && response.retry) {
              setTimeout(() => {
                chrome.tabs.sendMessage(
                  tabs[0].id,
                  { action: 'retry' },
                  function (response) {
                    refreshList(response);
                  },
                );
              }, 1000);
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
      },
      false,
    );
  },
  false,
);
