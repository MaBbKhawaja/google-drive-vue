<template>
  <div class="google-drive-uploader">
    <!-- Sign In Button Slot -->
    <slot name="sign-in-button">
      <button v-if="!signedIn" @click="handleSignIn" class="btn btn-signin">
        Sign In with Google
      </button>
    </slot>

    <div v-if="signedIn" class="upload-container">
      <!-- Drag-and-Drop Slot -->
      <slot name="drag-and-drop">
        <label
          for="file-input"
          class="upload-box"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDraggingOver }"
        >
          <i class="upload-icon fas fa-cloud-upload-alt"></i>
          <span>Click or Drag Files to Upload</span>
        </label>
      </slot>
      <input type="file" id="file-input" @change="handleFileSelection" class="file-input" multiple />

      <div v-if="selectedFiles.length" class="file-list">
        <h4>Selected Files:</h4>
        <div class="file-grid">
          <slot name="file-card" v-for="(file, index) in selectedFiles" :file="file" :index="index">
            <div class="file-card">
              <div class="file-icon-container">
                <font-awesome-icon :icon="getFileIcon(file)" class="file-icon" />
              </div>
              <div class="file-details">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </div>
              <button class="remove-file" @click="removeFile(index)">&#x2715;</button>
            </div>
          </slot>
        </div>
      </div>

      <!-- Upload Button Slot -->
      <slot name="upload-button">
        <button :disabled="!selectedFiles.length || fileSizeError || fileFormatError" @click="handleFileUpload" class="btn btn-upload">
          <span v-if="!uploading">Upload {{ selectedFiles.length }} File(s)</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </slot>
    </div>

    <!-- File Size Error Message -->
    <div v-if="fileSizeError" class="message error-message">
      <i class="error-icon fas fa-times-circle"></i> {{ fileSizeError }}
    </div>

    <!-- File Format Error Message -->
    <div v-if="fileFormatError" class="message error-message">
      <i class="error-icon fas fa-times-circle"></i> {{ fileFormatError }}
    </div>

    <!-- Uploading Indicator -->
    <div v-if="uploading" class="uploading-text">Uploading your files, please wait...</div>

    <!-- Success and Error Messages -->
    <div v-if="uploadSuccess" class="message success-message">
      <i class="checkmark-icon fas fa-check-circle"></i> Files uploaded successfully!
    </div>
    <div v-if="uploadError" class="message error-message">
      <i class="error-icon fas fa-times-circle"></i> File upload failed. Please try again.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAuthUrl, parseTokenFromUrl, uploadFileWithProgress } from './googleApiService';

// Props for dynamic clientId, redirectUri, maxFileSize, and allowedFormats
const props = defineProps<{
  clientId: string;
  redirectUri: string;
  maxFileSize?: number; // Maximum allowed file size (in bytes)
  allowedFormats?: string[]; // Allowed file formats (MIME types)
}>();

const signedIn = ref(false);
const token = ref<string | null>(null);
const selectedFiles = ref<File[]>([]);
const uploading = ref(false);
const uploadSuccess = ref(false);
const uploadError = ref(false);
const isDraggingOver = ref(false);
const fileSizeError = ref<string | null>(null); // Error message if file size exceeds limit
const fileFormatError = ref<string | null>(null); // Error message if file format is invalid
const progress = ref(0); // Progress indicator for larger files

// Default max file size of 10 MB if not provided
const maxFileSize = props.maxFileSize || 10 * 1024 * 1024; // 10 MB
// Default to allowing all formats if not provided
const allowedFormats = props.allowedFormats || ['*/*'];

onMounted(() => {
  token.value = parseTokenFromUrl();
  if (token.value) {
    signedIn.value = true;
  }
});
const handleSignIn = () => {
  const authUrl = getAuthUrl(props.clientId, props.redirectUri);
  window.location.href = authUrl;
};
// Check if the file format is allowed
const isFileFormatAllowed = (file: File): boolean => {
  console.log(allowedFormats)
  if (allowedFormats.includes('*/*')) return true; // Allow all formats if wildcard
  return allowedFormats.some(format => file.type === format);
};

const handleFileSelection = (event: Event) => {
  const input = event.target as HTMLInputElement;
  fileSizeError.value = null; // Reset error message
  fileFormatError.value = null; // Reset format error

  if (input.files) {
    const files = Array.from(input.files);
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    const invalidFormatFiles = files.filter(file => !isFileFormatAllowed(file));

    if (oversizedFiles.length > 0) {
      fileSizeError.value = `File ${oversizedFiles[0].name} exceeds the maximum file size limit of ${formatSize(maxFileSize)}.`;
      selectedFiles.value = [];
    } else if (invalidFormatFiles.length > 0) {
      fileFormatError.value = `File ${invalidFormatFiles[0].name} is not an allowed file format.`;
      selectedFiles.value = [];
    } else {
      selectedFiles.value = files;
    }
  }
};

const handleDragOver = () => {
  isDraggingOver.value = true;
};

const handleDragLeave = () => {
  isDraggingOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDraggingOver.value = false;
  fileSizeError.value = null; // Reset error message
  fileFormatError.value = null; // Reset format error

  if (event.dataTransfer?.files) {
    const droppedFiles = Array.from(event.dataTransfer.files);
    const oversizedFiles = droppedFiles.filter(file => file.size > maxFileSize);
    const invalidFormatFiles = droppedFiles.filter(file => !isFileFormatAllowed(file));

    if (oversizedFiles.length > 0) {
      fileSizeError.value = `File ${oversizedFiles[0].name} exceeds the maximum file size limit of ${formatSize(maxFileSize)}.`;
      selectedFiles.value = [];
    } else if (invalidFormatFiles.length > 0) {
      fileFormatError.value = `File ${invalidFormatFiles[0].name} is not an allowed file format.`;
      selectedFiles.value = [];
    } else {
      selectedFiles.value = [...selectedFiles.value, ...droppedFiles];
    }
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const handleFileUpload = async () => {

  if (selectedFiles.value.length && token.value) {
    uploading.value = true;
    uploadSuccess.value = false;
    uploadError.value = false;
    progress.value = 0;

    try {
      for (const file of selectedFiles.value) {
        await uploadFileWithProgress(token.value, file, (e: ProgressEvent) => {
          if (e.lengthComputable) {
            progress.value = Math.round((e.loaded / e.total) * 100);
          }
        });
      }
      uploadSuccess.value = true;
      selectedFiles.value = []; // Remove files from screen after upload
    } catch (error) {
      uploadError.value = true;
    } finally {
      uploading.value = false;
      progress.value = 0; // Reset progress after upload
    }
  }
};

const formatSize = (size: number) => {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return ['fas', 'file-image'];
  if (file.type === 'application/pdf') return ['fas', 'file-pdf'];
  if (file.type.startsWith('video/')) return ['fas', 'file-video'];
  return ['fas', 'file-alt'];
};
</script>

<style scoped>
.google-drive-uploader {
  --upload-box-border-color: #dcdcdc;
  --upload-box-hover-border-color: #4285f4;
  --upload-box-drag-border-color: #34a853;
  --file-card-bg-color: #f9f9f9;
  --file-card-border-color: #e0e0e0;
  --btn-bg-color: #4285f4;
  --btn-hover-bg-color: #357ae8;
  --btn-upload-bg-color: #34a853;
  --btn-upload-disabled-bg-color: #ddd;
  --remove-file-color: red;

  text-align: center;
  background-color: var(--file-card-bg-color);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.upload-box {
  width: 220px;
  height: 220px;
  border: 2px dashed var(--upload-box-border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 20px auto;
  transition: border-color 0.3s ease;
  background-color: #fafafa;
}

.upload-box:hover {
  border-color: var(--upload-box-hover-border-color);
}

.upload-box.drag-over {
  border-color: var(--upload-box-drag-border-color);
  background-color: #f1f1f1;
}

.upload-icon {
  font-size: 50px;
  color: var(--upload-box-hover-border-color);
  margin-bottom: 10px;
}
.file-input {
  display: none;
}
.file-list {
  margin-top: 20px;
}

.file-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-card {
  background-color: var(--file-card-bg-color);
  border: 1px solid var(--file-card-border-color);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-icon {
  font-size: 24px;
}

.file-details {
  flex-grow: 1;
  padding: 0 10px;
  text-align: start;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
}

.file-size {
  font-size: 14px;
  color: #666;
  display: block;
}

.remove-file {
  background: none;
  border: none;
  color: var(--remove-file-color);
  font-size: 18px;
  cursor: pointer;
}

.btn {
  display: inline-block;
  padding: 12px 25px;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  background-color: var(--btn-bg-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: var(--btn-hover-bg-color);
}

.btn-upload {
  margin-top: 20px;
  background-color: var(--btn-upload-bg-color);
}

.btn-upload:disabled {
  background-color: var(--btn-upload-disabled-bg-color);
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--btn-upload-bg-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.uploading-text {
  margin-top: 20px;
  font-size: 14px;
  color: #555;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
}

.success-message {
  background-color: #e7f7e7;
  color: #34a853;
}

.error-message {
  background-color: #fdeaea;
  color: #dc3545;
}

.checkmark-icon, .error-icon {
  margin-right: 8px;
}
</style>
