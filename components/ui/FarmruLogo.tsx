import React from 'react';
import Svg, { Circle, Path, Text as SvgText, TextPath, Defs, G } from 'react-native-svg';

interface FarmruLogoProps {
  width?: number | string;
  height?: number | string;
  shadow?: boolean;
}

export function FarmruLogo({ width = 140, height = 140, shadow = false }: FarmruLogoProps) {
  // Perfected Brand colors
  const C_BLACK = "#101820"; 
  const C_GREEN = "#72C04D"; 
  const C_BROWN = "#BC8D44"; 
  const C_BLUE = "#15416B";  
  const C_WHITE = "#FFFFFF"; 
  const STROKE_WIDTH = 6;  
  
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200"
      style={shadow ? {
        shadowColor: '#203A5A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      } : {}}
    >
      <Defs>
        {/* Invisible path for the text to follow along the bottom curve */}
        {/* Concentric with outer ring (Center 100, 110), radius 42 for text baseline */}
        <Path id="textCurve" d="M 58 110 A 42 42 0 0 0 142 110" />
      </Defs>

      {/* White background disk concentric */}
      <Circle cx="100" cy="110" r="70" fill={C_WHITE} />

      {/* Outer Dotted Ring - Concentric (Center 100, 110, R=65) */}
      <Path 
        d="M 67.5 53.7 A 65 65 0 1 0 132.5 53.7" 
        fill="none" 
        stroke={C_BLACK} 
        strokeWidth={STROKE_WIDTH} 
        strokeLinecap="round" 
      />

      {/* Blue Dots Halo (Concentric, matching real arc radius ~ 52) */}
      {/* Left side arc */}
      <Circle cx="48" cy="116" r="3" fill={C_BLUE} />
      <Circle cx="47" cy="98"  r="3" fill={C_BLUE} />
      <Circle cx="53" cy="82"  r="3" fill={C_BLUE} />
      <Circle cx="64" cy="68"  r="3" fill={C_BLUE} />
      <Circle cx="78" cy="58"  r="3" fill={C_BLUE} />
      
      {/* Right side arc */}
      <Circle cx="152" cy="116" r="3" fill={C_BLUE} />
      <Circle cx="153" cy="98"  r="3" fill={C_BLUE} />
      <Circle cx="147" cy="82"  r="3" fill={C_BLUE} />
      <Circle cx="136" cy="68"  r="3" fill={C_BLUE} />
      <Circle cx="122" cy="58"  r="3" fill={C_BLUE} />

      {/* Leaves (drawn underneath stem to act as fill with outline) */}
      {/* Left Leaf Body (sharp tip, points up/left) */}
      <Path 
        d="M 85 10 C 60 20, 65 45, 88 48 C 110 40, 100 15, 85 10 Z" 
        fill={C_GREEN} 
        stroke={C_BLACK} 
        strokeWidth={STROKE_WIDTH} 
        strokeLinejoin="round" 
      />

      {/* Right Leaf Body (sharp tip, points up/right) */}
      <Path 
        d="M 132 25 C 145 42, 125 58, 118 52 C 108 42, 118 28, 132 25 Z" 
        fill={C_GREEN} 
        stroke={C_BLACK} 
        strokeWidth={STROKE_WIDTH} 
        strokeLinejoin="round" 
      />

      {/* Plant Stems (drawn over leaves to form the inner vein) */}
      {/* Left Main Stem */}
      <Path 
        d="M 100 84 Q 95 50 85 24" 
        fill="none" 
        stroke={C_BLACK} 
        strokeWidth={STROKE_WIDTH} 
        strokeLinecap="round" 
      />
      {/* Right Branch Stem */}
      <Path 
        d="M 96 60 Q 115 50 126 34" 
        fill="none" 
        stroke={C_BLACK} 
        strokeWidth={STROKE_WIDTH} 
        strokeLinecap="round" 
      />

      {/* Inner Soil/Seed Circle - Concentric (Center 100, 110) */}
      <Circle cx="100" cy="110" r="26" fill={C_BROWN} stroke={C_BLACK} strokeWidth={STROKE_WIDTH} />

      {/* FARMRU Text */}
      <G>
        <SvgText 
          fill={C_BLACK} 
          fontSize="18" 
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          letterSpacing="4"
        >
          <TextPath href="#textCurve" startOffset="50%" textAnchor="middle">
            FARMRU
          </TextPath>
        </SvgText>
      </G>

    </Svg>
  );
}
