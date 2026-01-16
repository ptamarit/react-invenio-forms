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
import "tinymce/plugins/table";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/preview";
import PropTypes from "prop-types";
import { Button, Label } from "semantic-ui-react";
import { humanReadableBytes } from "../utils/humanReadableBytes";

// Make content inside the editor look identical to how we will render it across the site.
// TinyMCE runs within an iframe, so we cannot style it with page-wide CSS styles as normal.
//
// TinyMCE overrides blockquotes with custom styles, so we need to use !important to override
// the overrides in a consistent and reliable way.
// https://github.com/tinymce/tinymce-dist/blob/8d7491f2ee341c201b68cc7c3701d54703edd474/skins/content/tinymce-5/content.css#L61-L70
const editorContentStyle = (disabled) => `
body {
  font-size: 14px;
  ${disabled ? "opacity: 0.5; " : ""}
}

blockquote  {
  margin-left: 0.5rem !important;
  padding-left: 1rem !important;
  color: #757575;
  border-left: 4px solid #C5C5C5 !important;
}

blockquote > blockquote {
  margin-left: 0 !important;
}
`;

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// TODO: Use nested_links_item
function getRequestId() {
  const prefix = "/requests/";
  const url = window.location.href;
  const index = url.indexOf(prefix);
  const start = index + prefix.length;
  const end = start + 36;
  return url.substring(start, end);
}

// The https://www.tiny.cloud/docs/tinymce/latest/tinydrive-introduction/ plugin enable the insertfile icon.

// We might have to go for a custom plugin: https://www.tiny.cloud/docs/tinymce/latest/creating-a-plugin/

// https://www.tiny.cloud/docs/tinymce/latest/custom-toolbarbuttons/

export class RichEditorWithFiles extends Component {
  // constructor(props) {
  //   super(props);
  //   // this.state = { files: [] };
  // }

  addFileToList = (json) => {
    // this.setState({
    //   files: [
    //     ...this.state.files,
    //     json,
    //   ]
    // });
    this.props.setFiles([
      ...this.props.files,
      {
        file_id: json.id,
        key: json.key,
        original_filename: json.metadata.original_filename,
        size: json.size,
        mimetype: json.mimetype,
      },
    ]);
  };

  removeFileFromList = (fileKey) => {
    // this.setState({
    //   files: this.state.files.filter(file => file.key !== fileKey)
    // });
    this.props.setFiles(this.props.files.filter((file) => file.key !== fileKey));
  };

  /**
   * This function is called when a user drag-n-drops an image onto the editor text area.
   */
  imagesUploadHandler = (blobInfo, progress) =>
    new Promise((resolve, reject) => {
      console.log("imagesUploadHandler");
      const xhr = new XMLHttpRequest();
      // xhr.withCredentials = true; // TODO: Needed?
      const filename = blobInfo.filename();
      // TODO: Use axios to include the CSRF token automatically?
      xhr.open("PUT", `/api/requests/${getRequestId()}/files/upload/${filename}`);
      xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
      // xhr.setRequestHeader('X-CSRF-TOKEN', window.csrfToken); // manually set header

      xhr.upload.onprogress = (e) => {
        progress((e.loaded / e.total) * 100);
      };

      xhr.onload = () => {
        if (xhr.status === 403) {
          reject({ message: "HTTP Error: " + xhr.status, remove: true });
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject("HTTP Error: " + xhr.status);
          return;
        }

        const json = JSON.parse(xhr.responseText);

        // if (!json || typeof json.location != 'string') {
        if (!json) {
          reject("Invalid JSON: " + xhr.responseText);
          return;
        }

        this.addFileToList(json);

        // TODO: Do not use the API endpoint.
        resolve(`/api/requests/${getRequestId()}/files/${json.key}/content`);
      };

      xhr.onerror = () => {
        reject("Image upload failed due to a XHR Transport error. Code: " + xhr.status);
      };

      // const formData = new FormData();
      // formData.append('file', blobInfo.blob(), blobInfo.filename());
      // xhr.send(formData);

      // As in https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#upload-a-draft-files-content
      // The content-type should always be `application/octet-stream`.

      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      const blob = blobInfo.blob();
      xhr.send(blob);
    });

  /**
   * This function is called when a choses to upload a fuser drag-n-drops an image onto the editor text area.
   */

  //  custom file picker to those dialogs that have it.
  //  small browse button will appear along the fields of supported file types (see file_picker_types).
  // When user clicks the button

  filePickerCallback = (callback, value, meta) => {
    console.log("filePickerCallback");

    // this.addFileToList({"key": "test.txt"})

    const localRefToAddFileToList = this.addFileToList;

    var input = document.createElement("input");
    input.setAttribute("type", "file");
    // If the file picker is called from the Image dialog, only allow to upload images (allow everything from the Link dialog).
    if (meta.filetype === "image") {
      // Media types list based on extensions taken from: https://www.tiny.cloud/docs/tinymce/latest/image/#images_file_types
      // We could accept "image/*", but then we would let users upload an SVG from the image upload dialog,
      // let the user inline the SVG, but this would not work, since we are forbidding the rendering of inline SVG for security reasons
      // (see MIMETYPE_PLAINTEXT in invenio_files_rest).
      input.setAttribute(
        "accept",
        "image/jpeg, image/png, image/gif, image/bmp, image/webp"
      );
    }

    //

    /*
        Note: In modern browsers input[type="file"] is functional without
        even adding it to the DOM, but that might not be the case in some older
        or quirky browsers like IE, so you might want to add it to the DOM
        just in case, and visually hide it. And do not forget do remove it
        once you do not need it anymore.
      */

    // input.onchange = function () {
    input.onchange = (event) => {
      var file = event.target.files[0];
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

        /* call the callback and populate the Title field with the file name */
        //callback("todo.ext", { title: file.name });
        // cb(blobInfo.blobUri(), { title: file.name });

        const xhr = new XMLHttpRequest();
        // xhr.withCredentials = true; // TODO: Needed?

        // TODO: Use axios to include the CSRF token automatically?
        xhr.open("PUT", `/api/requests/${getRequestId()}/files/upload/${filename}`);
        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        // xhr.setRequestHeader('X-CSRF-TOKEN', window.csrfToken); // manually set header

        xhr.onload = () => {
          if (xhr.status === 403) {
            reject({ message: "HTTP Error: " + xhr.status, remove: true });
            return;
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            reject("HTTP Error: " + xhr.status);
            return;
          }

          const json = JSON.parse(xhr.responseText);

          // if (!json || typeof json.location != 'string') {
          if (!json) {
            reject("Invalid JSON: " + xhr.responseText);
            return;
          }

          /* call the callback and populate the Title field with the file name */
          // callback(blobInfo.blobUri(), { title: file.name });
          // TODO: No API endpoint and add UUID.
          // TODO: Removed: `title: "Download the attached file content"`
          // this.setState({
          //   files: [
          //     // ...this.state.files,
          //     json,
          //   ]
          // });
          localRefToAddFileToList(json);

          // TODO: Do not use the API endpoint.
          const location = `/api/requests/${getRequestId()}/files/${json.key}/content`;
          if (meta.filetype === "file") {
            callback(location, { text: json.metadata.original_filename });
          } else if (meta.filetype === "image") {
            callback(location, {
              alt: `Description of ${json.metadata.original_filename}`,
            });
          } else {
            // This should not happen, since `file_picker_types` is set to only support `file` and `image`.
            callback(location);
          }
        };

        xhr.onerror = () => {
          reject(
            "Image upload failed due to a XHR Transport error. Code: " + xhr.status
          );
        };

        // const formData = new FormData();
        // formData.append('file', blobInfo.blob(), blobInfo.filename());
        // xhr.send(formData);

        // As in https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#upload-a-draft-files-content
        // The content-type should always be `application/octet-stream`.

        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        const blob = reader.result;
        xhr.send(blob);
      };
      //reader.readAsDataURL(file);
      reader.readAsArrayBuffer(file);
    };
    input.click();

    // TODO: Check https://www.tiny.cloud/docs/tinymce/latest/file-image-upload/#interactive-example
  };

  copyLink = async (fileKey) => {
    const requestId = getRequestId();
    try {
      await navigator.clipboard.writeText(
        `/api/requests/${requestId}/files/${fileKey}/content`
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  deleteFile = (fileKey) => {
    console.log("deleteFile");
    if (this.props.filesImmediateDeletion) {
      const xhr = new XMLHttpRequest();
      // xhr.withCredentials = true; // TODO: Needed?
      // TODO: Use axios to include the CSRF token automatically?
      xhr.open("DELETE", `/api/requests/${getRequestId()}/files/${fileKey}`);
      xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
      // xhr.setRequestHeader('X-CSRF-TOKEN', window.csrfToken); // manually set header

      xhr.onload = () => {
        if (xhr.status === 403) {
          console.error({ message: "HTTP Error: " + xhr.status, remove: true });
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          console.error("HTTP Error: " + xhr.status);
          return;
        }

        this.removeFileFromList(fileKey);
      };

      xhr.onerror = () => {
        console.error(
          "File deletion failed due to a XHR Transport error. Code: " + xhr.status
        );
      };

      xhr.send();
    } else {
      this.removeFileFromList(fileKey);
    }
  };

  getImageList = () => {
    const requestId = getRequestId();
    // TODO: Filter to keep only images (based on extension?).
    // List taken from: https://www.tiny.cloud/docs/tinymce/latest/image/#images_file_types
    const imageExtensions = [
      "jpeg",
      "jpg",
      "jpe",
      "jfi",
      "jif",
      "jfif",
      "png",
      "gif",
      "bmp",
      "webp",
    ];
    const list = this.props.files
      .filter((file) => {
        const filename = file.original_filename;
        const extension = filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
        return imageExtensions.includes(extension);
      })
      .map((file) => ({
        title: file.original_filename,
        value: `/api/requests/${requestId}/files/${file.key}/content`,
      }));
    return list.length > 0 ? list : [{ title: "NA", value: "NA" }];
  };

  getLinkList = () => {
    const requestId = getRequestId();
    const list = this.props.files.map((file) => ({
      title: file.original_filename,
      value: `/api/requests/${requestId}/files/${file.key}/content`,
    }));
    return list.length > 0 ? list : [{ title: "NA", value: "NA" }];
  };

  registerCustomPreviewButton = (editor) => {
    const customPreviewTitle = "Preview math equations";
    editor.ui.registry.addButton("custom_preview", {
      text: "√x",
      tooltip: customPreviewTitle,
      context: "any",
      onAction: () => {
        editor.execCommand("mcePreview");
        const dialog = document.querySelector(".tox-dialog");
        if (dialog) {
          // Change the title
          const title = dialog.querySelector(".tox-dialog__title");
          if (title) {
            title.textContent = customPreviewTitle; // Your custom title
          }
          const iframe = dialog.querySelector("iframe");
          // Handle iframe load to render MathJax by passing the iframe document body to MathJax.typesetPromise
          iframe.onload = () => {
            window.MathJax?.typesetPromise([iframe.contentDocument.body]);
          };
        }
      },
    });
  };

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
      files,
      // setFiles,
      onEditorChange,
      onInit,
    } = this.props;
    const config = {
      branding: false,
      menubar: false,
      statusbar: false,
      min_height: minHeight,
      content_style: editorContentStyle(disabled),
      plugins: [
        "autoresize",
        "code",
        "codesample",
        "image",
        "link",
        "lists",
        "table",
        "wordcount",
        "preview",
      ],
      contextmenu: false,
      toolbar:
        // "blocks | bold italic link codesample blockquote image table | bullist numlist | outdent indent | wordcount | undo redo | code | custom_preview",
        // Version with links and images separated:
        "blocks | bold italic codesample blockquote table | bullist numlist | outdent indent | link image attach | wordcount | undo redo | code | custom_preview",
      autoresize_bottom_margin: 20,
      block_formats: "Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3",
      table_advtab: false,
      convert_urls: false,
      // automatic_uploads
      images_reuse_filename: true,
      // image_title: true,
      images_upload_handler: this.imagesUploadHandler,
      // TODO: What about using files_upload_handler (similar to images_upload_handler)
      //       in addition or instead of file_picker_callback?
      //       There's also a link_uploadtab option similar to image_uploadtab,
      //       so we could have them both enabled (which is the default when configured?)
      // We do not implement the file picker type `media` since we do not enable the Media plugin/button.
      file_picker_types: "file image",
      // file_picker_types: 'image',
      file_picker_callback: this.filePickerCallback,
      // TODO: Risk of navigating away from the page containing the editor.
      // TODO: The images_upload_handler is unfortunately not called for unsupported formats.
      // block_unsupported_drop: false,
      // image_list: [
      //   { title: 'cern.png', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/cern.png/content' },
      //   { title: 'zenodo.png', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/zenodo.png/content' },
      // ],
      // link_list: [
      //   { title: 'demo.txt', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/jaz62-e6a21-demo.txt/content' },
      //   { title: 'demo.zip', value: '/api/requests/18b40ce5-491c-45eb-8db9-1fddb81b8394/files/8gs26-gdy39-demo.zip/content' },
      // ],
      image_list: (success) => {
        success(this.getImageList());
      },
      link_list: (success) => {
        success(this.getLinkList());
      },
      // The separated image upload tab in the Image dialog is a bit redundant with the little upload icon next to the filename.
      // Moreover, the link plugin does not have a similar tab, so disabling it for consistency.
      image_uploadtab: false,
      setup: (editor) => {
        this.registerCustomPreviewButton(editor);
        editor.ui.registry.addButton("attach", {
          icon: "upload",
          tooltip: "Attach files",
          onAction: () => this.filePickerCallback(() => {}, "", "file"),
        });
      },
      ...editorConfig,
    };

    return (
      <>
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
          onInit={onInit}
        />
        {/* {files.map((file) => (
          <ButtonGroup key={file.key} floated="left" className="mr-10 mt-10">
            <Button
              basic
              color="grey"
              icon="file"
              content={`${file.original_filename} (${humanReadableBytes(
                parseInt(file.size, 10),
                true
              )})`}
              as="a"
              href={`/api/requests/${getRequestId()}/files/${file.key}/content`}
            />
            <Button
              icon="linkify"
              title="Copy link"
              onClick={() => this.copyLink(file.key)}
            />
            <Button
              color="red"
              icon="delete"
              title="Delete file"
              onClick={() => this.deleteFile(file.key)}
            />
          </ButtonGroup>
        ))} */}
        {files.map((file) => (
          // <Icon name='delete' />
          // <Icon name='close' />
          // const filesList = files?.map((file) => (
          //   <Label as="a" key={file.key} className="mr-10 mt-10">
          //     <Icon name="file" />
          //     filename.ext (12.3 MB)
          //   </Label>
          // ));
          <Label
            key={file.key}
            className="no-text-decoration mr-5 mt-5"
            icon="file"
            content={`${file.original_filename} (${humanReadableBytes(
              parseInt(file.size, 10),
              true
            )})`}
            as="a"
            href={`/api/requests/${getRequestId()}/files/${file.key}/content`}
            // color="red"
            // title="Delete file"
            onRemove={(event) => this.deleteFile(event, file.key)}
          />
        ))}
        {/* {files.map((file) => (
          // const filesList = files?.map((file) => (
          //   <Label as="a" key={file.key} className="mr-10 mt-10">
          //     <Icon name="file" />
          //     filename.ext (12.3 MB)
          //   </Label>
          // ));
            <Label
              key={file.key}
              className="mr-10 mt-10"
              // color="red"
              // title="Delete file"
              // onRemove={() => this.deleteFile(file.key)}
            >
              <Icon name="file" />
              <a href={`/api/requests/${getRequestId()}/files/${file.key}/content`}>
                NEW{`${file.original_filename} (${humanReadableBytes(
                  parseInt(file.size, 10),
                  true
                )})`}
              </a>
              <Icon name="delete" onClick={() => this.deleteFile(file.key)} />
            </Label>
        ))} */}
        <div>
          <Button
            basic
            size="small"
            compact
            icon="attach"
            content="Attach files"
            className="mt-5"
            onClick={() => this.filePickerCallback(() => {}, "", "file")}
          />
        </div>
      </>
    );
  }
}

RichEditorWithFiles.propTypes = {
  initialValue: PropTypes.string,
  inputValue: PropTypes.string,
  files: PropTypes.array,
  setFiles: PropTypes.func,
  filesImmediateDeletion: PropTypes.bool,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onEditorChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onInit: PropTypes.func,
  minHeight: PropTypes.number,
  editorConfig: PropTypes.object,
  // initialFiles: PropTypes.array,
  // inputFiles: PropTypes.array,
  // onFilesChange: PropTypes.func,
};

RichEditorWithFiles.defaultProps = {
  minHeight: 250,
  initialValue: "",
  inputValue: "",
  files: [],
  setFiles: undefined,
  // TODO: Not sure what's the best default here.
  filesImmediateDeletion: true,
  id: undefined,
  disabled: undefined,
  onChange: undefined,
  onEditorChange: undefined,
  onBlur: undefined,
  onFocus: undefined,
  onInit: undefined,
  editorConfig: undefined,
  // // initialFiles: [],
  // initialFiles: undefined,
  // // inputFiles: [],
  // inputFiles: undefined,
  // onFilesChange: undefined,
};
