// src/components/EnhancedBlogEditor.tsx

import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { blogApi } from "../../api/apiClient"; // Adjust the path based on your project structure

// Define the props interface for our component
interface EnhancedEditorProps {
    value: string;
    onChange: (content: string) => void;
    height?: string;
    placeholder?: string;
    error?: boolean;
}

const EnhancedBlogEditor: React.FC<EnhancedEditorProps> = ({
    value,
    onChange,
    height = "350px",
    placeholder = "Write your blog content here...",
    error = false
}) => {
    const [isUploading, setIsUploading] = React.useState(false);

    // Use any type for the ref to bypass TypeScript checking
    const quillRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Define formats
    const formats = [
        "header", "font", "size", "bold", "italic", "underline", "strike", "blockquote",
        "list", "bullet", "link", "image", "video", "align", "color", "background"
    ];

    // Custom image upload handler
    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                try {
                    setIsUploading(true);

                    // Insert a placeholder for the image
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    const quill = quillRef.current?.getEditor();
                    if (!quill) return;

                    const range = quill.getSelection(true);

                    // Insert a placeholder while uploading
                    quill.insertText(range.index, "Uploading image...", {
                        color: '#999',
                        italic: true
                    });

                    // Use your actual API for image upload
                    const response = await blogApi.uploadImage(file);

                    // Remove the placeholder text
                    quill.deleteText(range.index, "Uploading image...".length);

                    // Insert the image with custom HTML to ensure full width
                    const imageHtml = `<img src="${response.url}" style="display: block; width: 100%; max-width: 100%; height: auto; margin: 1rem 0;" />`;
                    quill.clipboard.dangerouslyPasteHTML(range.index, imageHtml);

                    // Move cursor to the next position
                    quill.setSelection(range.index + 1);

                } catch (error) {
                    console.error('Error uploading image:', error);
                    // Show error message in editor
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    const quill = quillRef.current?.getEditor();
                    if (!quill) return;

                    const range = quill.getSelection(true);
                    quill.deleteText(range.index, "Uploading image...".length);
                    quill.insertText(range.index, "Failed to upload image. Please try again.", {
                        color: 'red',
                        italic: true
                    });
                } finally {
                    setIsUploading(false);
                }
            }
        };
    };

    // Modules configuration with custom image handler
    const modules = {
        toolbar: {
            container: [
                [{ header: "1" }, { header: "2" }, { font: [] }],
                [{ size: [] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image", "video"],
                [{ align: [] }],
                [{ color: [] }, { background: [] }],
                ["clean"],
            ],
            handlers: {
                image: handleImageUpload
            }
        },
        clipboard: {
            matchVisual: false
        }
    };

    // Apply custom CSS to ensure lists and images render correctly
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .ql-editor img {
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        display: block !important;
        margin: 1rem auto !important;
      }
      .ql-editor ul {
        list-style-type: disc !important;
        padding-left: 1.5em !important;
        margin: 1em 0 !important;
      }
      .ql-editor ol {
        list-style-type: decimal !important;
        padding-left: 1.5em !important;
        margin: 1em 0 !important;
      }
      .ql-editor li {
        display: list-item !important;
        margin: 0.5em 0 !important;
      }
      .ql-editor li::before {
        display: none !important;
      }
      .prose img {
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        display: block !important;
        margin: 1rem 0 !important;
      }
      .prose ul {
        list-style-type: disc !important;
        padding-left: 1.5em !important;
        margin: 1em 0 !important;
      }
      .prose ol {
        list-style-type: decimal !important;
        padding-left: 1.5em !important;
        margin: 1em 0 !important;
      }
      .prose li {
        display: list-item !important;
        margin: 0.5em 0 !important;
      }
      .prose li::before {
        display: none !important;
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="enhanced-blog-editor">
            {isUploading && (
                <div className="upload-indicator py-1 px-2 bg-amber-100 text-amber-800 rounded text-sm mb-2">
                    Uploading image... Please wait.
                </div>
            )}
            <ReactQuill
                ref={quillRef}
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ height }}
                theme="snow"
                className={error ? "border-red-500 bg-red-50" : ""}
            />
            <div className="editor-info text-xs text-gray-500 mt-2">
                <p>• For lists, use the bullet or numbered list buttons in the toolbar.</p>
                <p>• For images, use the image button to upload. Images will be sized to full width.</p>
            </div>
        </div>
    );
};

export default EnhancedBlogEditor;