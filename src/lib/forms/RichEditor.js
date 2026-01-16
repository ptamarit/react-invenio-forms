// This file is part of React-Invenio-Forms
// Copyright (C) 2022-2025 CERN.
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
import { Button } from "semantic-ui-react";
import { FilesList } from "./FilesList";

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

/*
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
*/

// TODO: Use nested_links_item
/*
function getRequestId() {
  const prefix = "/requests/";
  const url = window.location.href;
  const index = url.indexOf(prefix);
  const start = index + prefix.length;
  const end = start + 36;
  return url.substring(start, end);
}
*/

export class RichEditor extends Component {
  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.editorDialogRef = React.createRef();
  }

  /*
  deleteLogo = async () => {
    const client = new CommunityApi();
    await client.deleteLogo(community.id);

    const logoUrlNoCache = noCacheUrl(logoUrl);
    logoSetUrl(logoUrlNoCache);
    logoSetUpdated(true);
    logoSetExists(false);
  };
  */

  onFileUploadEditor = async (filename, payload, options) => {
    console.log("onFileUploadEditor");
    const json = await this.props.onFileUpload(filename, payload, options);
    // console.log({json});
    this.props.onFilesChange([
      ...this.props.files,
      {
        file_id: json.data.id,
        key: json.data.key,
        original_filename: json.data.metadata.original_filename,
        size: json.data.size,
        mimetype: json.data.mimetype,
        links: {
          download_html: json.data.links.download_html,
        }
      },
    ]);
    return json;
  };

  onFileDeleteEditor = async (file) => {
    console.log("onFileDeleteEditor");
    if (this.props.onFileDelete) {
      await this.props.onFileDelete(file);
    }
    this.props.onFilesChange(
      this.props.files.filter((fileFromList) => fileFromList.key !== file.key)
    );
  };

  /**
   * This function is called when a user drag-n-drops an image onto the editor text area.
   */
  // imagesUploadHandlerOld = (blobInfo, progress) =>
  //   new Promise((resolve, reject) => {
  //     console.log("imagesUploadHandler");
  //     const xhr = new XMLHttpRequest();
  //     // xhr.withCredentials = true; // TODO: Needed?
  //     const filename = blobInfo.filename();
  //     // TODO: Use axios to include the CSRF token automatically?
  //     xhr.open("PUT", `/api/requests/${getRequestId()}/files/upload/${filename}`);
  //     xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  //     // xhr.setRequestHeader('X-CSRF-TOKEN', window.csrfToken); // manually set header

  //     xhr.upload.onprogress = (e) => {
  //       progress((e.loaded / e.total) * 100);
  //     };

  //     xhr.onload = () => {
  //       if (xhr.status === 403) {
  //         reject({ message: "HTTP Error: " + xhr.status, remove: true });
  //         return;
  //       }

  //       if (xhr.status < 200 || xhr.status >= 300) {
  //         reject("HTTP Error: " + xhr.status);
  //         return;
  //       }

  //       const json = JSON.parse(xhr.responseText);

  //       // if (!json || typeof json.location != 'string') {
  //       if (!json) {
  //         reject("Invalid JSON: " + xhr.responseText);
  //         return;
  //       }

  //       console.log({ json });

  //       // this.addFileToList(json);
  //       this.props.onFilesChange([
  //         ...this.props.files,
  //         {
  //           file_id: json.id,
  //           key: json.key,
  //           original_filename: json.metadata.original_filename,
  //           size: json.size,
  //           mimetype: json.mimetype,
  //           download_html: json.links.download_html,
  //         },
  //       ]);

  //       resolve(json.links.download_html);
  //     };

  //     xhr.onerror = () => {
  //       reject("Image upload failed due to a XHR Transport error. Code: " + xhr.status);
  //     };

  //     // const formData = new FormData();
  //     // formData.append('file', blobInfo.blob(), blobInfo.filename());
  //     // xhr.send(formData);

  //     // As in https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#upload-a-draft-files-content
  //     // The content-type should always be `application/octet-stream`.

  //     xhr.setRequestHeader("Content-Type", "application/octet-stream");
  //     const blob = blobInfo.blob();
  //     xhr.send(blob);
  //   });

  /**
   * This function is called when a user drag-n-drops an image onto the editor text area.
   */
  imagesUploadHandler = async (blobInfo, progress) => {
    const filename = blobInfo.filename();
    const payload = blobInfo.blob();

    const json = await this.onFileUploadEditor(filename, payload, {
      onUploadProgress: ({ loaded, total }) =>
        progress(Math.round((loaded / total) * 100)),
    });
    progress(100);

    return json.data.links.download_html;
  };

  /**
   * This function is called when a a user clicks on the attach toolbar button,
   * or on the upload icons in the Link and Image popup dialogs.
   */
  filePickerCallback = (callback, value, meta) => {
    const localRefOnFileUploadEditor = this.onFileUploadEditor;
    const localRefEditorRef = this.editorRef;
    const localRefEditorDialogRef = this.editorDialogRef;

    const input = document.createElement("input");
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

    input.onchange = (event) => {
      const file = event.target.files[0];
      const filename = file.name;

      if (this.editorRef.current) {
        // This is visible via the attach button,
        // but it is hidden behind the Link and Image popup dialogs.
        console.log("progress true");
        this.editorRef.current.setProgressState(true);
      }

      // Thanks to: https://github.com/tinymce/tinymce/issues/5133
      if (this.editorDialogRef.current) {
        console.log("block");
        this.editorDialogRef.current.block("Uploading file...");
      }

      const reader = new FileReader();
      reader.onload = async function () {
        const json = await localRefOnFileUploadEditor(filename, reader.result);
        console.log({ json });

        if (localRefEditorRef.current) {
          console.log("progress false");
          localRefEditorRef.current.setProgressState(false);
        }
        if (localRefEditorDialogRef.current) {
          console.log("unblock");
          localRefEditorDialogRef.current.unblock();
        }

        const location = json.data.links.download_html;
        if (meta.filetype === "file") {
          callback(location, { text: json.data.metadata.original_filename });
        } else if (meta.filetype === "image") {
          callback(location, {
            alt: `Description of ${json.data.metadata.original_filename}`,
          });
        } else {
          // This should not happen, since `file_picker_types` is set to only support `file` and `image`.
          callback(location);
        }
      };
      //reader.readAsDataURL(file);
      reader.readAsArrayBuffer(file);
    };
    input.click();

    // TODO: Check https://www.tiny.cloud/docs/tinymce/latest/file-image-upload/#interactive-example
  };

  getImageList = () => {
    // const requestId = getRequestId();
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
    console.log(this.props.files);
    const list = this.props.files
      .filter((file) => {
        const filename = file.original_filename;
        const extension = filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
        return imageExtensions.includes(extension);
      })
      .map((file) => ({
        title: file.original_filename,
        value: file.download_html,
      }));
    return list.length > 0 ? list : [{ title: "NA", value: "NA" }];
  };

  getLinkList = () => {
    // const requestId = getRequestId();
    const list = this.props.files.map((file) => ({
      title: file.original_filename,
      value: file.download_html,
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

  registerAttachButton = (editor) => {
    editor.ui.registry.addButton("attach", {
      icon: "upload",
      tooltip: "Attach files",
      onAction: () => this.filePickerCallback(() => {}, "", "file"),
    });
  };

  render() {
    const localRefEditorDialogRef = this.editorDialogRef;

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
      files,
      // onFilesChange,
      // onFileDelete,
      onInit,
    } = this.props;
    const filesEnabled = files !== undefined;
    let config = {
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
      toolbar: `blocks | bold italic codesample blockquote table | bullist numlist | outdent indent | link image ${
        filesEnabled ? "attach " : " "
      }| wordcount | undo redo | code | custom_preview`,
      autoresize_bottom_margin: 20,
      block_formats: "Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3",
      table_advtab: false,
      convert_urls: false,
      setup: (editor) => {
        this.registerCustomPreviewButton(editor);
        if (filesEnabled) {
          this.registerAttachButton(editor);
        }
        editor.on("OpenWindow", function (eventDetails) {
          console.log("OpenWindow");
          localRefEditorDialogRef.current = eventDetails.dialog;
        });
      },
      ...editorConfig,
    };

    if (filesEnabled) {
      config = {
        ...config,
        // It is the backend responsibility to generate unique filenames, so no need for TinyMCE to generate filenames.
        images_reuse_filename: true,
        images_upload_handler: this.imagesUploadHandler,
        // We do not implement the file picker type `media` since we do not enable the Media plugin/button.
        file_picker_types: "file image",
        file_picker_callback: this.filePickerCallback,
        image_list: (success) => {
          success(this.getImageList());
        },
        link_list: (success) => {
          success(this.getLinkList());
        },
        // The separated image upload tab in the Image dialog is a bit redundant with the little upload icon next to the filename.
        image_uploadtab: false,
      };
    }

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
          onInit={(event, editor) => {
            this.editorRef.current = editor;
            onInit && onInit(event, editor);
          }}
        />
        {filesEnabled && (
          <>
            <FilesList files={files} onFileDelete={this.onFileDeleteEditor} />
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
        )}
      </>
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
  onInit: PropTypes.func,
  minHeight: PropTypes.number,
  editorConfig: PropTypes.object,
  files: PropTypes.array,
  onFilesChange: PropTypes.func,
  onFileUpload: PropTypes.func,
  onFileDelete: PropTypes.func,
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
  onInit: undefined,
  editorConfig: undefined,
  files: undefined,
  onFilesChange: undefined,
  onFileUpload: undefined,
  onFileDelete: undefined,
};
