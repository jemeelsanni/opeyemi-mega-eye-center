// src/react-quill.d.ts

declare module 'react-quill' {
    import { Component } from 'react';
    import Quill from 'quill';
  
    // Define an interface for ReactQuill's props
    interface ReactQuillProps {
      value?: string;
      defaultValue?: string;
      theme?: string;
      onChange?: (content: string, delta: Quill.Delta, source: Quill.Sources, editor: Quill) => void;
      onChangeSelection?: (range: Quill.RangeStatic | null, source: Quill.Sources, editor: Quill) => void;
      modules?: Quill.Modules;
      formats?: string[];
      placeholder?: string;
      readOnly?: boolean;
      bounds?: string | HTMLElement;
      scrollingContainer?: string | HTMLElement;
      onFocus?: (range: Quill.RangeStatic, source: Quill.Sources, editor: Quill) => void;
      onBlur?: (previousRange: Quill.RangeStatic | null, source: Quill.Sources, editor: Quill) => void;
      onKeyPress?: React.KeyboardEventHandler;
      onKeyDown?: React.KeyboardEventHandler;
      onKeyUp?: React.KeyboardEventHandler;
      style?: React.CSSProperties;
      className?: string;
      tabIndex?: number;
      id?: string;
    }
  
    // Declare the ReactQuill class component
    class ReactQuill extends Component<ReactQuillProps> {}
  
    // Export ReactQuill as default
    export default ReactQuill;
  }
  