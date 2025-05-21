// src/components/BlogContentPreview.tsx

import React from 'react';

interface BlogContentProps {
    content: string;
    className?: string;
}

const BlogContentPreview: React.FC<BlogContentProps> = ({
    content,
    className = ''
}) => {
    return (
        <div
            className={`blog-content-preview prose prose-lg max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default BlogContentPreview;