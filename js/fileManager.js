// File list management and display

class FileManager {
  constructor() {
    // File management is initialized through method calls
  }

  async loadFileList() {
    if (!window.currentCaseNumber) {
      console.warn('No case number available to load files');
      return;
    }

    const filesLoading = document.getElementById('filesLoading');
    const filesEmpty = document.getElementById('filesEmpty');
    const filesItems = document.getElementById('filesItems');

    // Show loading state
    if (filesLoading) filesLoading.style.display = 'flex';
    if (filesEmpty) filesEmpty.style.display = 'none';
    if (filesItems) filesItems.innerHTML = '';

    try {
      console.log('Loading file list for case:', window.currentCaseNumber);
      const response = await fetch(`https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/ListFiles?code=ZeI5vyYITMvYPiyMwU7t33vxG20sgCPQcnv0z684uoabAzFulc6rxg==&CaseNumber=${encodeURIComponent(window.currentCaseNumber)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Hide loading state
      if (filesLoading) filesLoading.style.display = 'none';

      // Check if we have files in the response format
      if (!result || !result.fileNames || !Array.isArray(result.fileNames) || result.fileNames.length === 0) {
        if (filesEmpty) filesEmpty.style.display = 'block';
        return;
      }

      // Display files using the fileNames array
      if (filesEmpty) filesEmpty.style.display = 'none';
      this.displayFileList(result.fileNames, result.fileCount);

    } catch (err) {
      console.error('Error loading file list:', err);
      
      // Hide loading state and show error
      if (filesLoading) filesLoading.style.display = 'none';
      if (filesEmpty) {
        filesEmpty.style.display = 'block';
        filesEmpty.textContent = 'Error loading files. Please try again.';
        
        // Reset to default message after 3 seconds
        setTimeout(() => {
          filesEmpty.textContent = 'No files uploaded for this case yet.';
        }, 3000);
      }
    }
  }

  displayFileList(fileNames, fileCount) {
    const filesItems = document.getElementById('filesItems');
    if (!filesItems) return;
    
    filesItems.innerHTML = '';

    // Show file count if available
    if (fileCount && fileCount > 0) {
      console.log(`Displaying ${fileCount} files for case`);
    }

    fileNames.forEach(fileName => {
      const fileItem = document.createElement('li');
      fileItem.className = 'file-item';
      
      fileItem.innerHTML = `
        <div class="file-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4z"></path>
            <polyline points="14,2 14,8 8,8"></polyline>
          </svg>
        </div>
        <div class="file-name" title="${fileName}">${fileName}</div>
      `;
      
      filesItems.appendChild(fileItem);
    });
  }
}