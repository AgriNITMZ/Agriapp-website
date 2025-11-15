import { useEffect, useRef, useState } from "react";

const TextEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const fileInputRef = useRef();
    const [content, setContent] = useState(value || '');
  
    // Function to handle different formatting options
    const handleFormat = (command, value = null) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        onChange({
          target: {
            name: 'description',
            value: editorRef.current.innerHTML
          }
        });
      }
    };
  
    // Function to apply heading styles
    const applyHeading = (level) => {
      document.execCommand('formatBlock', false, `h${level}`);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        onChange({
          target: {
            name: 'description',
            value: editorRef.current.innerHTML
          }
        });
      }
    };
  
    // Update parent component when content changes
    const handleContentChange = () => {
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        onChange({
          target: {
            name: 'description',
            value: editorRef.current.innerHTML
          }
        });
      }
    };
  
    // Initialize with existing content
    useEffect(() => {
      if (editorRef.current && value) {
        editorRef.current.innerHTML = value;
      }
    }, []);
  
    return (
      <div className="w-full border border-gray-300 rounded-md">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-100">
          {/* Text formatting buttons */}
          <button 
            type="button"
            onClick={() => handleFormat('bold')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button 
            type="button"
            onClick={() => handleFormat('italic')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button 
            type="button"
            onClick={() => handleFormat('underline')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Underline"
          >
            <span className="underline">U</span>
          </button>
  
          <div className="h-6 mx-1 border-l border-gray-300"></div>
  
          {/* Heading dropdown */}
          <div className="relative">
            <select
              onChange={(e) => applyHeading(e.target.value)}
              className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm"
              defaultValue=""
            >
              <option value="" disabled>Heading</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
            </select>
          </div>
  
          <div className="h-6 mx-1 border-l border-gray-300"></div>
  
          {/* Alignment buttons */}
          <button 
            type="button"
            onClick={() => handleFormat('justifyLeft')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Align Left"
          >
            ←
          </button>
          <button 
            type="button"
            onClick={() => handleFormat('justifyCenter')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Align Center"
          >
            ↔
          </button>
          <button 
            type="button"
            onClick={() => handleFormat('justifyRight')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Align Right"
          >
            →
          </button>
  
          <div className="h-6 mx-1 border-l border-gray-300"></div>
  
          {/* List buttons */}
          <button 
            type="button"
            onClick={() => handleFormat('insertUnorderedList')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Bullet List"
          >
            •
          </button>
          <button 
            type="button"
            onClick={() => handleFormat('insertOrderedList')}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="Numbered List"
          >
            1.
          </button>
        </div>
  
        {/* Editable content area */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-40 p-4 focus:outline-none"
          onInput={handleContentChange}
        ></div>
      </div>
    );
  };
  export default TextEditor;