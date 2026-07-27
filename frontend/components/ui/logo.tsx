import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      width="100%"
      height="100%"
      {...props}
    >
      <g fill="#001b4e"> {/* Dark blue color matching your image */}
        
        {/* LEFT SHAPE: Flat top, pointy bottom-left, right 'hook' */}
        <path 
          d="M 290 390 
             L 530 390 
             L 550 490 
             L 480 480 
             L 380 550 
             Z" 
        />

        {/* RIGHT SHAPE: Sharp top, flat horizontal bottom, left 'hook' */}
        <path 
          d="M 480 500 
             L 610 410 
             L 710 600 
             L 490 600 
             L 550 500 
             Z" 
        />

      </g>
    </svg>
  );
};

export default Logo;