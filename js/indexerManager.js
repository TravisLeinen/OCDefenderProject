// Azure AI Search Indexer Status Management

class IndexerManager {
  constructor() {
    this.pollingInterval = null;
  }

  showLoadingState() {
    const indexerStatus = document.getElementById('indexerStatus');
    const indexerStatusIcon = document.getElementById('indexerStatusIcon');
    const indexerStatusValue = document.getElementById('indexerStatusValue');
    
    if (!indexerStatus || !indexerStatusIcon || !indexerStatusValue) {
      console.warn('Indexer status elements not found');
      return;
    }
    
    // Show the status display with loading state
    indexerStatus.style.display = 'block';
    
    // Remove all status classes
    indexerStatus.classList.remove('success', 'error', 'in-progress', 'reset');
    indexerStatusIcon.classList.remove('spinning');
    
    // Add loading state
    indexerStatus.classList.add('loading');
    indexerStatusIcon.classList.add('spinning');
    indexerStatusValue.textContent = 'Checking Status...';
    indexerStatusIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
      </svg>
    `;
    
    console.log('Showing indexer status loading state');
  }

  async checkStatus() {
    try {
      console.log('Checking indexer status...');
      
      const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/PollIndexer?code=LdfbePlBNrVsaLboW5fh1HXLxazkuIUe_vuq_NMY2OwGAzFuabshdw==', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const status = result.status;
      
      this.updateStatusDisplay(status);
      
      // If status is "in progress", continue polling
      if (status === 'in progress') {
        // Continue checking every 3 seconds
        setTimeout(() => this.checkStatus(), 3000);
      } else {
        // Status is final, stop polling after 5 seconds
        setTimeout(() => {
          this.stopPolling();
        }, 5000);
      }
      
    } catch (err) {
      console.error('Error checking indexer status:', err);
      this.updateStatusDisplay('error');
      // Stop polling on error after 5 seconds
      setTimeout(() => {
        this.stopPolling();
      }, 5000);
    }
  }

  updateStatusDisplay(status) {
    const indexerStatus = document.getElementById('indexerStatus');
    const indexerStatusIcon = document.getElementById('indexerStatusIcon');
    const indexerStatusValue = document.getElementById('indexerStatusValue');
    
    if (!indexerStatus || !indexerStatusIcon || !indexerStatusValue) {
      console.warn('Indexer status elements not found');
      return;
    }
    
    // Show the status display
    indexerStatus.style.display = 'block';
    
    // Remove all status classes including loading
    indexerStatus.classList.remove('success', 'error', 'in-progress', 'reset', 'loading');
    indexerStatusIcon.classList.remove('spinning');
    
    // Update based on status
    switch (status) {
      case 'success':
        indexerStatus.classList.add('success');
        indexerStatusValue.textContent = 'Completed Successfully';
        indexerStatusIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        `;
        break;
        
      case 'error':
        indexerStatus.classList.add('error');
        indexerStatusValue.textContent = 'Indexing Failed';
        indexerStatusIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        `;
        break;

      case 'reset':
        indexerStatus.classList.add('reset');
        indexerStatusValue.textContent = 'Ready to Index';
        indexerStatusIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <circle cx="12" cy="1" r="1"></circle>
            <circle cx="12" cy="23" r="1"></circle>
            <circle cx="4.22" cy="4.22" r="1"></circle>
            <circle cx="19.78" cy="19.78" r="1"></circle>
            <circle cx="1" cy="12" r="1"></circle>
            <circle cx="23" cy="12" r="1"></circle>
            <circle cx="4.22" cy="19.78" r="1"></circle>
            <circle cx="19.78" cy="4.22" r="1"></circle>
          </svg>
        `;
        break;
        
      case 'in progress':
      default:
        indexerStatus.classList.add('in-progress');
        indexerStatusValue.textContent = 'Indexing Documents...';
        indexerStatusIcon.classList.add('spinning');
        indexerStatusIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 11-6.219-8.56"></path>
          </svg>
        `;
        break;
    }
    
    console.log('Updated indexer status display:', status);
  }

  startPolling() {
    this.checkStatus();
    console.log('Started indexer status polling');
  }
}