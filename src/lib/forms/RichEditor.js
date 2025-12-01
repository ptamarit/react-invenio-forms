// This file is part of React-Invenio-Forms
// Copyright (C) 2022 CERN.
// Copyright (C) 2020 Northwestern University.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import React, { Component } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/models/dom/model";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";
// import "tinymce/plugins/help";
import "tinymce/plugins/media";
import PropTypes from "prop-types";


// function from https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// TODO: Hacky method for prototype. Pass this via props/state.
function getRequestId() {
  const prefix = "/requests/";
  const url = window.location.href;
  const index = url.indexOf(prefix);
  const start = index + prefix.length;
  const end = start + 36;
  return url.substring(start, end);
}

// TODO: This is for images only.
const uploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
  console.log("uploadHandler");
  const xhr = new XMLHttpRequest();
  // xhr.withCredentials = true; // TODO: Needed?
  const filename = blobInfo.filename();
  // TODO: Use axios to include the CSRF token automatically?
  xhr.open('PUT', `/api/requests/${getRequestId()}/files/upload/${filename}`);
  xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  // xhr.setRequestHeader('X-CSRF-TOKEN', window.csrfToken); // manually set header

  xhr.upload.onprogress = (e) => {
    progress(e.loaded / e.total * 100);
  };

  xhr.onload = () => {
    if (xhr.status === 403) {
      reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
      return;
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      reject('HTTP Error: ' + xhr.status);
      return;
    }

    const json = JSON.parse(xhr.responseText);

    // if (!json || typeof json.location != 'string') {
    if (!json) {
      reject('Invalid JSON: ' + xhr.responseText);
      return;
    }

    // resolve(json.location);
    // TODO: No API endpoint and add UUID.
    resolve(`/api/requests/${getRequestId()}/files/${json.key}/content`);
  };

  xhr.onerror = () => {
    reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
  };

  // const formData = new FormData();
  // formData.append('file', blobInfo.blob(), blobInfo.filename());
  // xhr.send(formData);

  // As in https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#upload-a-draft-files-content
  // The content-type should always be `application/octet-stream`.

  xhr.setRequestHeader("Content-Type", "application/octet-stream")
  const blob = blobInfo.blob();
  xhr.send(blob);
});

function file_picker_callback_other_version(cb, value, meta) {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    // input.setAttribute('accept', 'image/*');

    /*
      Note: In modern browsers input[type="file"] is functional without
      even adding it to the DOM, but that might not be the case in some older
      or quirky browsers like IE, so you might want to add it to the DOM
      just in case, and visually hide it. And do not forget do remove it
      once you do not need it anymore.
    */

    input.onchange = function () {
      var file = this.files[0];

      var reader = new FileReader();
      reader.onload = function () {
        /*
          Note: Now we need to register the blob in TinyMCEs image blob
          registry. In the next release this part hopefully won't be
          necessary, as we are looking to handle it internally.
        */
        var id = 'blobid' + (new Date()).getTime();
        // var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
        // var base64 = reader.result.split(',')[1];
        // var blobInfo = blobCache.create(id, file, base64);
        // blobCache.add(blobInfo);

        /* call the callback and populate the Title field with the file name */
        cb("todo.ext", { title: file.name });
        // cb(blobInfo.blobUri(), { title: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
};

function filePickerCallback(callback, value, meta) {
  console.log("filePickerCallback");
  /*
  if (meta.filetype == 'file') {
    callback('mypage.html', { text: 'My text' });
  }

  // Provide image and alt text for the image dialog
  if (meta.filetype == 'image') {
    callback('myimage.jpg', { alt: 'My alt text' });
  }

  // Provide alternative source and posted for the media dialog
  if (meta.filetype == 'media') {
    callback('movie.mp4', { source2: 'alt.ogg', poster: 'image.jpg' });
  }
  */
  
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    // input.setAttribute('accept', 'image/*');

    /*
      Note: In modern browsers input[type="file"] is functional without
      even adding it to the DOM, but that might not be the case in some older
      or quirky browsers like IE, so you might want to add it to the DOM
      just in case, and visually hide it. And do not forget do remove it
      once you do not need it anymore.
    */

    input.onchange = function () {
      var file = this.files[0];
      const filename = file.name;

      var reader = new FileReader();
      reader.onload = function () {
        /*
          Note: Now we need to register the blob in TinyMCEs image blob
          registry. In the next release this part hopefully won't be
          necessary, as we are looking to handle it internally.
        */
        // var id = 'blobid' + (new Date()).getTime();
        // var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
        // var base64 = reader.result.split(',')[1];
        // var blobInfo = blobCache.create(id, file, base64);
        // blobCache.add(blobInfo);

        const xhr = new XMLHttpRequest();
        // xhr.withCredentials = true; // TODO: Needed?
        
        // TODO: Use axios to include the CSRF token automatically?
        xhr.open('PUT', `/api/requests/${getRequestId()}/files/upload/${filename}`);
        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        // xhr.setRequestHeader('X-CSRF-TOKEN', window.csrfToken); // manually set header

        xhr.onload = () => {
          if (xhr.status === 403) {
            reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
            return;
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            reject('HTTP Error: ' + xhr.status);
            return;
          }

          const json = JSON.parse(xhr.responseText);

          // if (!json || typeof json.location != 'string') {
          if (!json) {
            reject('Invalid JSON: ' + xhr.responseText);
            return;
          }

          // resolve(json.location);
          /* call the callback and populate the Title field with the file name */
          // callback(blobInfo.blobUri(), { title: file.name });
          // TODO: No API endpoint and add UUID.
          // TODO: Removed: `title: "Download the attached file content"`
          callback(`/api/requests/${getRequestId()}/files/${json.key}/content`, { text: json.original_filename });
        };

        xhr.onerror = () => {
          reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
        };

        // const formData = new FormData();
        // formData.append('file', blobInfo.blob(), blobInfo.filename());
        // xhr.send(formData);

        // As in https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#upload-a-draft-files-content
        // The content-type should always be `application/octet-stream`.

        xhr.setRequestHeader("Content-Type", "application/octet-stream")
        const blob = reader.result;
        xhr.send(blob);
              };
      reader.readAsArrayBuffer(file);
    }
    input.click()

  // TODO: Check https://www.tiny.cloud/docs/tinymce/latest/file-image-upload/#interactive-example
}

// The https://www.tiny.cloud/docs/tinymce/latest/tinydrive-introduction/ plugin enable the insertfile icon.

// We might have to go for a custom plugin: https://www.tiny.cloud/docs/tinymce/latest/creating-a-plugin/

// https://www.tiny.cloud/docs/tinymce/latest/custom-toolbarbuttons/


export class RichEditor extends Component {
  render() {
    const {
      id,
      initialValue,
      disabled,
      minHeight,
      onBlur,
      onChange,
      onFocus,
      editorConfig,
      inputValue,
      onEditorChange,
    } = this.props;
    const config = {
      branding: false,
      menubar: false,
      statusbar: false,
      min_height: minHeight,
      content_style: "body { font-size: 14px; }",
      plugins: [
        "autoresize",
        "code",
        "codesample",
        "image",
        "link",
        "lists",
        "table",
        "wordcount",
        // "help",
        "media"
      ],
      image_list: [
        { title: 'cern.png', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/cern.png/content' },
        { title: 'zenodo.png', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/zenodo.png/content' },
      ],
      link_list: [
        { title: 'demo.txt', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/jaz62-e6a21-demo.txt/content' },
        { title: 'demo.zip', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/8gs26-gdy39-demo.zip/content' },
      ],
      contextmenu: false,
      toolbar:
        "blocks | bold italic blockquote codesample table | bullist numlist | outdent indent | link bla image insertfile | wordcount | undo redo | code | media | mediaembed editimage",
      autoresize_bottom_margin: 20,
      block_formats: "Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3",
      table_advtab: false,
      convert_urls: false,
      // automatic_uploads
      images_reuse_filename: true,
      // image_title: true,
      images_upload_handler: uploadHandler,
      // TODO: This seems to be the default.
      file_picker_types: 'file image media',
      // file_picker_types: 'image',
      file_picker_callback: filePickerCallback,
      // TODO: Risk of navigating away from the page containing the editor.
      block_unsupported_drop: false,
      ...editorConfig,
    };

    return (
      <Editor
        initialValue={initialValue}
        value={inputValue}
        init={config}
        id={id}
        disabled={disabled}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        onEditorChange={onEditorChange}
      />
    );
  }
}

RichEditor.propTypes = {
  initialValue: PropTypes.string,
  inputValue: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onEditorChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  minHeight: PropTypes.number,
  editorConfig: PropTypes.object,
};

RichEditor.defaultProps = {
  minHeight: 250,
  initialValue: "",
  inputValue: "",
  id: undefined,
  disabled: undefined,
  onChange: undefined,
  onEditorChange: undefined,
  onBlur: undefined,
  onFocus: undefined,
  editorConfig: undefined,
};
