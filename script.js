const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const uploadForm = document.getElementById('uploadForm');


// Chat form submission handler
chatForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  appendMessage('user', message);
  userInput.value = '';

  // Simulate AI response (replace with actual API call)
  try {
    console.log('Sending chat...');
    const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/SubmitChat?code=zFqYyoEA4aObdFx_IyNtzSMFTLVbrcTypZCRThzIC_anAzFu1xu3iw==', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.text();
    appendMessage('bot', result);
  } catch (err) {
    console.error('Upload error', err);
    alert('Upload failed: ' + (err && err.message ? err.message : 'unknown error'));
  }
});

// File upload form submission handler
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('fileInput');
  const files = input ? input.files : null;

  if (!files || files.length === 0) {
    alert('No files selected');
    return;
  }

  const formData = new FormData();
  // Append all selected files. Use 'files[]' so server frameworks treat them as an array.
  for (let i = 0; i < files.length; i++) {
    formData.append('files[]', files[i], files[i].name);
  }

  try {
    console.log('Uploading files...');
    const response = await fetch('https://ocdefonblobupload-ffcwb6frd2gnd0f8.westus2-01.azurewebsites.net/api/UploadPDF?code=dc4riUFRUGw4j0b0W2V1J-JivxH-iPresSi49yoMryNlAzFuumATfg==', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    appendMessage("ChatBot", result);
  } catch (err) {
    console.error('Upload error', err);
    alert('Upload failed: ' + (err && err.message ? err.message : 'unknown error'));
  }
});

// Chat response appending
function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  // Add sender label before the message
  const senderLabel = document.createElement('span');
  senderLabel.className = 'sender-label';
  senderLabel.textContent = (sender === 'user' ? 'User: ' : 'Bot: ');
  msgDiv.appendChild(senderLabel);
  msgDiv.appendChild(document.createTextNode(text));
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}