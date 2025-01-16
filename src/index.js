import WebTorrent from "webtorrent/dist/webtorrent.min.js";

const client = new WebTorrent();

async function onTorrent(torrent) {
    console.log(torrent);
    console.log('Got torrent metadata!');
    console.log(`metadata: ${torrent.metadata}`);
    console.log(`magnetURI: ${torrent.magnetURI}`);
    console.log(`announce: ${torrent.announce}`);
    console.log(
        'Torrent info hash: ' + torrent.infoHash + ' ' +
        '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
        '<a href="' + URL.createObjectURL(torrent.torrentFileBlob) + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
    );

    // Print out progress every 5 seconds
    // const interval = setInterval(() => {
    //     log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
    // }, 5000)

    torrent.on('download', (bytes) => {
        console.log('just downloaded: ' + bytes);
        console.log('total downloaded: ' + torrent.downloaded);
        console.log('download speed: ' + torrent.downloadSpeed);
        console.log('progress: ' + torrent.progress);
      });

    torrent.on('done', () => {
        log('done');
        // clearInterval(interval);
    });

    // Render all files into to the page
    for (const file of torrent.files) {
        try {
            const blob = await file.blob();
            document.querySelector('.log')?.append(file.name);
            console.log('(Blob URLs only work if the file is loaded from a server. "http//localhost" works. "file://" does not.)');
            console.log('File done.');
            console.log('<a href="' + URL.createObjectURL(blob) + '">Download full file: ' + file.name + '</a>');
        } catch (err) {
            if (err) console.log(err.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileNameDisplay = document.getElementById('fileName');
    const uploadButton = document.getElementById('uploadButton');
    const cancelButton = document.getElementById('cancelButton');
    const uploadContainer = document.querySelector('.upload-container');
    const uploadTitle = uploadContainer.querySelector('h2');
  
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
        // 제목과 업로드 영역 숨기기
        uploadTitle.style.display = 'none';
        uploadArea.style.display = 'none';
  
        // 파일 정보 표시
        const firstFileName = files[0].name;
        const fileCount = files.length - 1;
        fileNameDisplay.textContent = fileCount > 0
          ? `${firstFileName} 외 ${fileCount}개`
          : firstFileName;
  
        // 파일 정보 영역 표시
        fileInfo.style.display = 'block';
      }
    }
  
    // 업로드 버튼 클릭 이벤트
    uploadButton.addEventListener('click', () => {
      // 업로드 로직 구현
      alert('파일이 업로드되었습니다.');
      resetUpload();
    });
  
    // 취소 버튼 클릭 이벤트
    cancelButton.addEventListener('click', () => {
      resetUpload();
    });
  
    function resetUpload() {
      // 파일 입력 초기화
      fileInput.value = '';
  
      // 제목과 업로드 영역 표시
      uploadTitle.style.display = 'block';
      uploadArea.style.display = 'block';
  
      // 파일 정보 영역 숨기기
      fileInfo.style.display = 'none';
  
      // 파일 이름 초기화
      fileNameDisplay.textContent = '';
    }
  });