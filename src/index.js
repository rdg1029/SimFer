import WebTorrent from "webtorrent/dist/webtorrent.min.js";

let uploadedFiles;
const client = new WebTorrent();

function getMagnetLink(infoHash) {
  return `magnet:?xt=urn:btih:${infoHash}&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.dev`
}

function createFileLink(fileName, url) {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('class', 'download-link');
  a.textContent = fileName;
  a.download = fileName;
  return a;
}

window.onbeforeunload = (e) => {
  e.preventDefault();
  return (e.returnValue = "");
}

document.addEventListener('DOMContentLoaded', () => {
  const loadingText = document.getElementById('loading');
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const fileInfo = document.getElementById('fileInfo');
  const fileNameDisplay = document.getElementById('fileName');
  const uploadButton = document.getElementById('uploadButton');
  const cancelButton = document.getElementById('cancelButton');
  const uploadInfo = document.getElementById('uploadInfo');
  const infoHash = document.getElementById('infoHash');
  const copyURL = document.getElementById('copyURL');
  const downloadInfo = document.getElementById('downloadInfo');
  const downloadStatus = document.getElementById('downloadStatus');
  const downloadAll = document.getElementById('downloadAll');
  const downloadItems = document.getElementById('downloadItems');
  const qrcodeArea = document.getElementById('qrcodeArea');

  function displayElem(name) {
    loadingText.style.display = name === 'loading' ? 'block' : 'none';
    uploadArea.style.display = name === 'upload-area' ? 'block' : 'none';
    fileInfo.style.display = name === 'file-info' ? 'block' : 'none';
    uploadInfo.style.display = name === 'upload-info' ? 'block' : 'none';
    downloadInfo.style.display = name === 'download-info' ? 'block' : 'none';
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('h')) {
    displayElem('loading');
    client.add(getMagnetLink(params.get('h')), onTorrentAdd);
  }

  function onTorrentSeed(torrent) {
    const shareUrl = `https://${window.location.host}?h=${torrent.infoHash}`
    infoHash.textContent = shareUrl;
    copyURL.onclick = () => {
      navigator.clipboard.writeText(shareUrl).then(() => copyURL.textContent = 'Copied');
    }
    qrcodeArea.setAttribute('src', `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${shareUrl}`);
    displayElem('upload-info');
  }

  function onTorrentAdd(torrent) {
    downloadStatus.textContent = `Downloads: ${(torrent.progress * 100).toFixed(1)}%`;
    displayElem('download-info');
    torrent.on('download', (bytes) => {
      if (torrent.progress == 1) downloadStatus.textContent = 'Done (File sharing enabled)';
      downloadStatus.textContent = `Downloads: ${(torrent.progress * 100).toFixed(1)}%`;
      // console.log('just downloaded: ' + bytes);
      // console.log('total downloaded: ' + torrent.downloaded);
      // console.log('download speed: ' + torrent.downloadSpeed);
      // console.log('progress: ' + torrent.progress);
    });

    torrent.on('done', async () => {
      downloadStatus.textContent = 'Done (File sharing enabled)';
      downloadItems.style.display = 'block';
      if (torrent.files.length > 1) {
        downloadAll.style.display = 'block';
      }
      const downloadItemsList = [];
      for (const file of torrent.files) {
        try {
          const blob = await file.blob();
          const downloadItem = createFileLink(file.name, URL.createObjectURL(blob));
          downloadItemsList.push(downloadItem);
        } catch (err) {
          if (err) console.log(err.message);
        }
      }
      downloadItems.append(...downloadItemsList);
      downloadAll.onclick = () => {
        downloadItemsList.forEach(elem => {
          elem.click();
        });
      }
    });

  }

  // 클릭하여 파일 선택
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // 드래그 앤 드롭 이벤트 처리
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  uploadArea.addEventListener('dragenter', () => {
    uploadArea.classList.add('active');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
  });

  uploadArea.addEventListener('drop', (e) => {
    uploadArea.classList.remove('active');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
  });

  function handleFiles(files) {
    if (files.length > 0) {
      uploadedFiles = files;

      // 파일 정보 표시
      const firstFileName = files[0].name;
      const fileCount = files.length - 1;
      fileNameDisplay.textContent = fileCount > 0
        ? `${firstFileName} and ${fileCount} ${fileCount > 1 ? 'others' : 'other'}`
        : firstFileName;

      // 파일 정보 영역 표시
      displayElem('file-info');
    }
  }

  // 업로드 버튼 클릭 이벤트
  uploadButton.addEventListener('click', () => {
    // 업로드 로직 구현
    //   alert('파일이 업로드되었습니다.');
    displayElem('loading');
    client.seed(uploadedFiles, onTorrentSeed);
    //   resetUpload();
  });

  // 취소 버튼 클릭 이벤트
  cancelButton.addEventListener('click', () => {
    resetUpload();
  });

  function resetUpload() {
    displayElem('upload-area');
    // 파일 입력 초기화
    fileInput.value = '';

    // 파일 이름 초기화
    fileNameDisplay.textContent = '';
  }
});