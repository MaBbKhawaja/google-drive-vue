Google Drive Uploader Component
===============================

A highly customizable **Google Drive Uploader** component built with **Vue 3** and **TypeScript**. This component allows users to sign in using **Google OAuth**, select files, and upload them to **Google Drive**. It supports drag-and-drop functionality, file size and format validation, and offers customizable UI styling through **CSS variables**.

Features
--------

*   **Google OAuth**: Allows users to authenticate with Google and upload files to Google Drive.
*   **Drag-and-Drop Support**: Users can drag and drop files for uploading.
*   **Multiple File Upload**: Upload multiple files at once with progress indicators.
*   **File Size Validation**: Control the maximum allowed file size via a prop.
*   **File Format Validation**: Limit uploads to specific file formats using MIME types.
*   **Customizable UI**: Style the component easily with CSS variables and slots for customization.

Installation
------------

Install the **Google Drive Uploader** component via npm:

    npm install google-drive-vue
    

Usage
-----

### Basic Usage

    <template>
      <GoogleDrive
        clientId="your-google-client-id.apps.googleusercontent.com"
        redirectUri="http://localhost:3000/oauth2callback"
      />
    </template>
    
    <script setup lang="ts">
    import { GoogleDrive } from 'google-drive-vue';
    import "google-drive-vue/style.css";
    </script>
    

### Advanced Usage with Props

    <template>
      <GoogleDrive
        clientId="your-google-client-id.apps.googleusercontent.com"
        redirectUri="http://localhost:3000/oauth2callback"
        maxFileSize="5242880" <!-- 5 MB -->
        :allowedFormats="['image/png', 'image/jpeg', 'application/pdf']"
      />
    </template>
    
    <script setup lang="ts">
    import GoogleDrive from 'google-drive-vue';
    </script>
    

### Prop List

| Prop | Type | Default | Description |
|--- | --- | --- | --- |
| `clientId` | `string` | _Required_ | Google OAuth 2.0 Client ID. |
| `redirectUri` | `string` | _Required_ | URI to which the user is redirected after signing in with Google. |
|`maxFileSize` | `number` | `10 * 1024 * 1024` (10 MB) | Maximum allowed file size in bytes. |
|`allowedFormats` | `string[]`  | `['*/*']` | Array of allowed file MIME types (e.g., `['image/png', 'application/pdf']`). |

### CSS Variables

You can easily customize the component’s appearance using the following CSS variables:

| Variable | Default | Description | 
|--- | --- | --- |
|`--upload-box-border-color` | `#dcdcdc` | Border color of the drag-and-drop area. |
| `--upload-box-hover-border-color` | `#4285f4` | Border color when hovering over the drag-and-drop area. |
| `--btn-bg-color` | `#4285f4` | Background color of buttons. |
| `--btn-hover-bg-color` | `#357ae8` | Background color of buttons when hovered.|
| `--file-card-bg-color` | `#f9f9f9` | Background color of file cards.|
| `--file-card-border-color` | `#e0e0e0` | Border color of file cards.|
| `--remove-file-color` | `red` | Color of the remove file button.|

### Example of Overriding CSS Variables:

    .google-drive-uploader {
      --upload-box-border-color: #333;
      --upload-box-hover-border-color: #ff4500;
      --btn-bg-color: #4caf50;
      --btn-hover-bg-color: #388e3c;
      --file-card-bg-color: #e0e0e0;
      --remove-file-color: blue;
    }
    

Slots
-----

The component supports the following slots for customization:

1.  `sign-in-button`: Customize the sign-in button for Google authentication.
2.  `drag-and-drop`: Customize the drag-and-drop area for file selection.
3.  `file-card`: Customize the appearance of each file card.
4.  `upload-button`: Customize the file upload button.

### Example: Customizing the UI with Slots

    <template>
      <GoogleDrive
        clientId="your-google-client-id.apps.googleusercontent.com"
        redirectUri="http://localhost:3000/oauth2callback"
      >
        <template #sign-in-button>
          <button class="custom-sign-in-button">Sign in to Google</button>
        </template>
    
        <template #drag-and-drop>
          <label class="custom-upload-box">Drop your files here</label>
        </template>
    
        <template #file-card="{ file, index }">
          <div class="custom-file-card">
            {{ file.name }} ({{ file.size }} bytes)
          </div>
        </template>
    
        <template #upload-button>
          <button class="custom-upload-btn">Upload Now</button>
        </template>
      </GoogleDrive>
    </template>
    

Customizing File Upload Restrictions
------------------------------------

**Maximum File Size**: Control the maximum file size allowed for uploads with the `maxFileSize` prop.

**Allowed Formats**: Restrict the file formats that users can upload with the `allowedFormats` prop, using MIME types.

Example:

    <template>
      <GoogleDrive
        clientId="your-google-client-id.apps.googleusercontent.com"
        redirectUri="http://localhost:3000/oauth2callback"
        maxFileSize="10485760" <!-- 10 MB -->
        :allowedFormats="['image/png', 'application/pdf']"
      />
    </template>
    

License
-------

MIT License
