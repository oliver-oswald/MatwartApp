import React from 'react';

// Mimics next/link
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}
// Mimics next/image
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    fill?: boolean;
}

export const Image: React.FC<ImageProps> = ({ src, alt, width, height, fill, className, ...props }) => {
    const style: React.CSSProperties = fill
        ? { position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover' }
        : { width, height };

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={{ ...style, ...props.style }}
            {...props}
        />
    );
};