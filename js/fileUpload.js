// File upload functionality and management

class FileUploadManager {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => this.handleFileUpload(e));
    }
  }

  async handleFileUpload(e) {
    e.preventDefault();
    const input = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const files = input ? input.files : null;

    if (!files || files.length === 0) {
      alert('No files selected');
      return;
    }

    // Ensure we have an active chat
    if (!window.chatManager || !window.chatManager.activeChatId) {
      alert('Please create a chat first.');
      return;
    }

    // Record start time for upload duration tracking
    const uploadStartTime = Date.now();

    const formData = this.createFormData(files);
    
    // Show loading state
    this.setUploadLoadingState(uploadBtn, input, files);

    try {
      console.log('Uploading files...');
      const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/UploadPDF?code=dc4riUFRUGw4j0b0W2V1J-JivxH-iPresSi49yoMryNlAzFuumATfg==', {
        method: 'POST',
        body: formData
      });

      const result = await response.text();

      // Calculate upload duration
      const uploadDuration = Date.now() - uploadStartTime;
      const formattedDuration = formatUploadDuration(uploadDuration);

      // Handle successful upload
      this.handleUploadSuccess(files, formattedDuration);
      
      // Clear the file input after successful upload
      input.value = '';
      
      // Refresh the file list and start indexer polling
      if (window.fileManager) {
        window.fileManager.loadFileList();
      }
      if (window.indexerManager) {
        window.indexerManager.startPolling();
      }

    } catch (err) {
      console.error('Upload error', err);
      this.handleUploadError(err);
    } finally {
      this.resetUploadState(uploadBtn, input);
    }
  }

  createFormData(files) {
    const formData = new FormData();
    // Append case number
    formData.append('caseNumber', window.currentCaseNumber);
    // Append all selected files
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i], files[i].name);
    }
    return formData;
  }

  setUploadLoadingState(uploadBtn, input, files) {
    // Disable forms during upload
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendBtn) sendBtn.disabled = true;
    if (chatInput) chatInput.disabled = true;
    
    // Show loading state on button
    uploadBtn.dataset.originalText = uploadBtn.textContent;
    uploadBtn.textContent = 'Uploading...';
    uploadBtn.disabled = true;
    input.disabled = true;
    
    // Add loading message to chat
    const fileNames = Array.from(files).map(file => file.name);
    const fileListHtml = fileNames.map(name => `<li style="margin: 2px 0; color: #d1d5db;">${name}</li>`).join('');
    
    const loadingMessageId = 'loading_' + Date.now();
    const loadingMessage = `<div id="${loadingMessageId}" style="display: flex; flex-direction: column; gap: 8px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border: 2px solid #374151; border-top: 2px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>Uploading ${files.length} file${files.length > 1 ? 's' : ''}...</div><ul style="margin: 4px 0 0 24px; padding: 0; list-style-type: disc;">${fileListHtml}</ul></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>`;
    
    if (window.chatUI) {
      window.chatUI.appendMessage("System", loadingMessage);
    }
    
    return loadingMessageId;
  }

  handleUploadSuccess(files, formattedDuration) {
    // Remove loading message
    const loadingMsg = document.querySelector('[id^="loading_"]');
    if (loadingMsg) {
      loadingMsg.closest('.message').remove();
    }
    
    // Show successful upload message with file list and upload time
    const fileNames = Array.from(files).map(file => file.name);
    const successFileListHtml = fileNames.map(name => `<li style="margin: 2px 0; color: #10b981;">${name}</li>`).join('');
    const successMessage = `<div style="color: #10b981; font-weight: 500;">✅ Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''} in ${formattedDuration}:</div><ul style="margin: 4px 0 0 16px; padding: 0; list-style-type: disc;">${successFileListHtml}</ul>`;
    
    if (window.chatUI) {
      window.chatUI.appendMessage("System", successMessage);
    }
  }

  handleUploadError(err) {
    // Remove loading message on error
    const loadingMsg = document.querySelector('[id^="loading_"]');
    if (loadingMsg) {
      loadingMsg.closest('.message').remove();
    }
    
    const errorMessage = "Upload failed: " + (err && err.message ? err.message : 'unknown error');
    if (window.chatUI) {
      window.chatUI.appendMessage("System", errorMessage);
    }
  }

  resetUploadState(uploadBtn, input) {
    // Reset button state and re-enable all forms
    uploadBtn.textContent = uploadBtn.dataset.originalText || 'Upload';
    uploadBtn.disabled = false;
    input.disabled = false;
    
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendBtn) sendBtn.disabled = false;
    if (chatInput) chatInput.disabled = false;
  }
}