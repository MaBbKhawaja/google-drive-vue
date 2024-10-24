export const getAuthUrl = (clientId: string, redirectUri: string): string => {
  const SCOPES = 'https://www.googleapis.com/auth/drive.file'; // For file access

  return `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(SCOPES)}&prompt=consent`;
};


// Parse token from URL hash
export const parseTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  const tokenMatch = hash.match(/access_token=([^&]*)/);
  return tokenMatch ? tokenMatch[1] : null;
};


// Upload file to Google Drive with progress tracking
export const uploadFileWithProgress = async (token: string, file: File, onProgress: (e: ProgressEvent) => void) => {
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = onProgress;

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject(`Failed to upload file: ${xhr.statusText}`);
      }
    };

    xhr.onerror = () => reject(`Failed to upload file: ${xhr.statusText}`);
    xhr.send(form);
  });
};
