declare module 'quill-image-resize' {
  import Quill from 'quill';
  
  interface ImageResizeOptions {
    modules?: string[];
    parchment?: unknown;
    displaySize?: boolean;
    displayStyles?: {
      backgroundColor?: string;
      border?: string;
      color?: string;
    };
    handleStyles?: {
      backgroundColor?: string;
      border?: string;
      color?: string;
    };
  }
  
  export default class ImageResize {
    constructor(quill: Quill, options: ImageResizeOptions);
  }
}