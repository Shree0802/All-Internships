import React from 'react';
import { Shirt, Sparkles, Shield, RotateCw } from 'lucide-react';

/**
 * Interactive SVG Jersey Mockup Component
 * Renders live front/back view with real-time colors, collar styles, team name, crest, player name & number.
 */
export default function JerseyPreview({
  primaryColor = '#0B1730',
  secondaryColor = '#2677FF',
  accentColor = '#FFFFFF',
  jerseyStyle = 'Round Neck Athletic',
  sport = 'Cricket',
  teamName = 'CAMPUS TITANS',
  organization = 'DYPULSE VARSITY',
  playerName = 'CAPTAIN',
  jerseyNumber = '10',
  logoUrl = '',
  view = 'front',
  onViewChange
}) {
  const isSleeveless = jerseyStyle.toLowerCase().includes('sleeveless') || jerseyStyle.toLowerCase().includes('tank');
  const isVNeck = jerseyStyle.toLowerCase().includes('v-neck');
  const isPolo = jerseyStyle.toLowerCase().includes('polo');
  const isQuarterZip = jerseyStyle.toLowerCase().includes('zip');

  const displayTeam = (teamName || 'CAMPUS TITANS').trim().toUpperCase();
  const displayOrg = (organization || 'DY PATIL UNIVERSITY').trim().toUpperCase();
  const displayName = (playerName || 'CAPTAIN').trim().toUpperCase();
  const displayNumber = (jerseyNumber || '10').trim();

  return (
    <div className="flex flex-col items-center select-none">
      {/* View Switcher Pill */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full border border-slate-200 mb-4 shadow-inner">
        <button
          type="button"
          onClick={() => onViewChange && onViewChange('front')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            view === 'front'
              ? 'bg-[#0B1730] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Front View</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange && onViewChange('back')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            view === 'back'
              ? 'bg-[#0B1730] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Back View (Name & Number)</span>
        </button>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl p-4 border border-slate-200/80 shadow-md flex items-center justify-center overflow-hidden">
        {/* Subtle athletic stadium grid background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <svg
          viewBox="0 0 400 480"
          className="w-full h-full drop-shadow-xl transition-all duration-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft 3D Lighting Gradients */}
            <linearGradient id="jerseyShadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
              <stop offset="25%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="75%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
            </linearGradient>

            <linearGradient id="sleeveShadowL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="sleeveShadowR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>

            {/* Subtle mesh pattern */}
            <pattern id="meshPattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="0.75" fill="#ffffff" fillOpacity="0.1" />
            </pattern>
          </defs>

          {/* ============================================================ */}
          {/* SLEEVES LAYER (If not sleeveless) */}
          {/* ============================================================ */}
          {!isSleeveless && (
            <g id="sleeves">
              {/* Left Sleeve Body */}
              <path
                d="M 130 45 L 45 145 L 85 180 L 122 135 Z"
                fill={secondaryColor}
              />
              <path
                d="M 130 45 L 45 145 L 85 180 L 122 135 Z"
                fill="url(#sleeveShadowL)"
              />
              {/* Left Sleeve Cuff Trim */}
              <path
                d="M 45 145 L 53 152 L 93 187 L 85 180 Z"
                fill={accentColor}
              />

              {/* Right Sleeve Body */}
              <path
                d="M 270 45 L 355 145 L 315 180 L 278 135 Z"
                fill={secondaryColor}
              />
              <path
                d="M 270 45 L 355 145 L 315 180 L 278 135 Z"
                fill="url(#sleeveShadowR)"
              />
              {/* Right Sleeve Cuff Trim */}
              <path
                d="M 355 145 L 347 152 L 307 187 L 315 180 Z"
                fill={accentColor}
              />
            </g>
          )}

          {/* ============================================================ */}
          {/* MAIN TORSO BODY */}
          {/* ============================================================ */}
          <g id="torso">
            {/* Base Silhouette */}
            <path
              d={
                isSleeveless
                  ? 'M 145 50 Q 200 45 255 50 Q 240 100 265 145 L 260 415 Q 200 425 140 415 L 135 145 Q 160 100 145 50 Z'
                  : 'M 130 45 Q 200 40 270 45 L 278 135 L 270 415 Q 200 425 130 415 L 122 135 Z'
              }
              fill={primaryColor}
            />

            {/* Mesh Perforation Overlay */}
            <path
              d={
                isSleeveless
                  ? 'M 145 50 Q 200 45 255 50 Q 240 100 265 145 L 260 415 Q 200 425 140 415 L 135 145 Q 160 100 145 50 Z'
                  : 'M 130 45 Q 200 40 270 45 L 278 135 L 270 415 Q 200 425 130 415 L 122 135 Z'
              }
              fill="url(#meshPattern)"
            />

            {/* Athletic Side Panels (Flanks) */}
            <path
              d="M 122 135 L 138 150 L 145 413 L 130 415 Z"
              fill={secondaryColor}
              opacity="0.9"
            />
            <path
              d="M 278 135 L 262 150 L 255 413 L 270 415 Z"
              fill={secondaryColor}
              opacity="0.9"
            />

            {/* 3D Curved Fabric Shading */}
            <path
              d={
                isSleeveless
                  ? 'M 145 50 Q 200 45 255 50 Q 240 100 265 145 L 260 415 Q 200 425 140 415 L 135 145 Q 160 100 145 50 Z'
                  : 'M 130 45 Q 200 40 270 45 L 278 135 L 270 415 Q 200 425 130 415 L 122 135 Z'
              }
              fill="url(#jerseyShadow)"
            />

            {/* Bottom Hem Stitching Accent */}
            <path
              d={
                isSleeveless
                  ? 'M 140 410 Q 200 420 260 410'
                  : 'M 130 410 Q 200 420 270 410'
              }
              stroke={accentColor}
              strokeWidth="2.5"
              strokeDasharray="4 2"
              fill="none"
              opacity="0.8"
            />
          </g>

          {/* ============================================================ */}
          {/* COLLAR & NECKLINE */}
          {/* ============================================================ */}
          <g id="collar">
            {/* Back collar inner liner */}
            <path
              d="M 160 45 Q 200 65 240 45 Q 200 52 160 45 Z"
              fill="#111111"
              opacity="0.6"
            />

            {/* Front Collar styles */}
            {isVNeck ? (
              // V-Neck Cut
              <>
                <polygon
                  points="160,45 240,45 200,95"
                  fill="#000000"
                  opacity="0.3"
                />
                <path
                  d="M 158 43 L 200 95 L 242 43 L 235 41 L 200 87 L 165 41 Z"
                  fill={secondaryColor}
                />
                <path
                  d="M 162 44 L 200 90 L 238 44"
                  stroke={accentColor}
                  strokeWidth="2"
                  fill="none"
                />
              </>
            ) : isPolo ? (
              // Polo Lapels with Buttons
              <>
                {/* Left Collar Flap */}
                <polygon
                  points="160,43 195,50 185,95 155,70"
                  fill={secondaryColor}
                  stroke={accentColor}
                  strokeWidth="1"
                />
                {/* Right Collar Flap */}
                <polygon
                  points="240,43 205,50 215,95 245,70"
                  fill={secondaryColor}
                  stroke={accentColor}
                  strokeWidth="1"
                />
                {/* Placket */}
                <rect
                  x="193"
                  y="50"
                  width="14"
                  height="45"
                  fill={secondaryColor}
                  rx="2"
                />
                {/* 2 Buttons */}
                <circle cx="200" cy="62" r="2.5" fill="#FFFFFF" />
                <circle cx="200" cy="78" r="2.5" fill="#FFFFFF" />
              </>
            ) : isQuarterZip ? (
              // Quarter Zip Cut
              <>
                <path
                  d="M 165 44 Q 200 62 235 44"
                  stroke={secondaryColor}
                  strokeWidth="8"
                  fill="none"
                />
                {/* Metallic Zip Track */}
                <line
                  x1="200"
                  y1="56"
                  x2="200"
                  y2="115"
                  stroke={accentColor}
                  strokeWidth="3"
                  strokeDasharray="2 1"
                />
                {/* Zip Puller */}
                <rect
                  x="197"
                  y="85"
                  width="6"
                  height="10"
                  rx="1"
                  fill="#D4D4D8"
                  stroke="#71717A"
                  strokeWidth="1"
                />
              </>
            ) : (
              // Standard Athletic Round Neck
              <>
                <path
                  d="M 162 43 Q 200 75 238 43"
                  stroke={secondaryColor}
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M 165 44 Q 200 70 235 44"
                  stroke={accentColor}
                  strokeWidth="2"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* ============================================================ */}
          {/* VIEW: FRONT VIEW GRAPHICS */}
          {/* ============================================================ */}
          {view === 'front' && (
            <g id="frontViewGraphics" className="animate-fadeIn">
              {/* Left Chest Crest */}
              <g transform="translate(150, 125)">
                {logoUrl ? (
                  <image
                    href={logoUrl}
                    x="-18"
                    y="-18"
                    width="36"
                    height="36"
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <g>
                    <path
                      d="M 0 -14 L 14 -6 L 14 6 C 14 14 0 20 0 20 C 0 20 -14 14 -14 6 L -14 -6 Z"
                      fill={accentColor}
                      stroke={secondaryColor}
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="6"
                      fontFamily="Space Grotesk, sans-serif"
                      fontWeight="900"
                      fontSize="10"
                      fill={primaryColor}
                      textAnchor="middle"
                    >
                      {displayTeam.charAt(0) || 'D'}
                    </text>
                  </g>
                )}
              </g>

              {/* Right Chest DYPULSE Brand Mark */}
              <g transform="translate(250, 125)">
                <path
                  d="M 2 -12 L -6 0 L 0 0 L -3 10 L 7 -2 L 1 -2 Z"
                  fill={accentColor}
                />
                <text
                  x="12"
                  y="0"
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight="900"
                  fontSize="7"
                  letterSpacing="1"
                  fill={accentColor}
                  textAnchor="start"
                >
                  DYPULSE
                </text>
              </g>

              {/* Center Chest: Team Name */}
              <g transform="translate(200, 205)">
                {/* Drop Shadow */}
                <text
                  x="0"
                  y="2"
                  fontFamily="Space Grotesk, Impact, sans-serif"
                  fontWeight="900"
                  fontSize="22"
                  letterSpacing="2.5"
                  fill="#000000"
                  opacity="0.4"
                  textAnchor="middle"
                >
                  {displayTeam}
                </text>
                {/* Main Text */}
                <text
                  x="0"
                  y="0"
                  fontFamily="Space Grotesk, Impact, sans-serif"
                  fontWeight="900"
                  fontSize="22"
                  letterSpacing="2.5"
                  fill={accentColor}
                  stroke={secondaryColor}
                  strokeWidth="0.5"
                  textAnchor="middle"
                >
                  {displayTeam}
                </text>
              </g>

              {/* Sub-text: College / University */}
              <text
                x="200"
                y="228"
                fontFamily="Inter, sans-serif"
                fontWeight="700"
                fontSize="9"
                letterSpacing="1.5"
                fill={accentColor}
                opacity="0.85"
                textAnchor="middle"
              >
                {displayOrg}
              </text>

              {/* Front Center Number */}
              <text
                x="200"
                y="310"
                fontFamily="Space Grotesk, Impact, sans-serif"
                fontWeight="900"
                fontSize="68"
                letterSpacing="2"
                fill={accentColor}
                stroke={secondaryColor}
                strokeWidth="1.5"
                opacity="0.95"
                textAnchor="middle"
              >
                {displayNumber}
              </text>

              {/* Sport Badge Pill on lower left */}
              <g transform="translate(142, 385)">
                <rect
                  x="0"
                  y="0"
                  width="44"
                  height="16"
                  rx="3"
                  fill="#000000"
                  opacity="0.4"
                />
                <text
                  x="22"
                  y="11"
                  fontFamily="Inter, sans-serif"
                  fontWeight="800"
                  fontSize="7"
                  fill="#FFFFFF"
                  letterSpacing="0.8"
                  textAnchor="middle"
                >
                  {sport.toUpperCase()}
                </text>
              </g>

              {/* Authenticity Patch on lower right */}
              <g transform="translate(225, 382)">
                <rect
                  x="0"
                  y="0"
                  width="35"
                  height="20"
                  rx="2"
                  fill="#111827"
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x="17"
                  y="9"
                  fontFamily="Inter, sans-serif"
                  fontWeight="900"
                  fontSize="5"
                  fill="#F59E0B"
                  textAnchor="middle"
                >
                  DYPULSE
                </text>
                <text
                  x="17"
                  y="16"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  fontSize="4.5"
                  fill="#9CA3AF"
                  textAnchor="middle"
                >
                  OFFICIAL KIT
                </text>
              </g>
            </g>
          )}

          {/* ============================================================ */}
          {/* VIEW: BACK VIEW GRAPHICS */}
          {/* ============================================================ */}
          {view === 'back' && (
            <g id="backViewGraphics" className="animate-fadeIn">
              {/* Upper Back: Player Name */}
              <g transform="translate(200, 145)">
                {/* Shadow */}
                <text
                  x="0"
                  y="2"
                  fontFamily="Space Grotesk, Impact, sans-serif"
                  fontWeight="900"
                  fontSize="24"
                  letterSpacing="3"
                  fill="#000000"
                  opacity="0.4"
                  textAnchor="middle"
                >
                  {displayName}
                </text>
                {/* Name text */}
                <text
                  x="0"
                  y="0"
                  fontFamily="Space Grotesk, Impact, sans-serif"
                  fontWeight="900"
                  fontSize="24"
                  letterSpacing="3"
                  fill={accentColor}
                  stroke={secondaryColor}
                  strokeWidth="0.8"
                  textAnchor="middle"
                >
                  {displayName}
                </text>
              </g>

              {/* Massive Center Back Number */}
              <g transform="translate(200, 275)">
                {/* Shadow */}
                <text
                  x="2"
                  y="4"
                  fontFamily="Space Grotesk, Impact, sans-serif"
                  fontWeight="900"
                  fontSize="120"
                  letterSpacing="2"
                  fill="#000000"
                  opacity="0.35"
                  textAnchor="middle"
                >
                  {displayNumber}
                </text>
                {/* Main Number */}
                <text
                  x="0"
                  y="0"
                  fontFamily="Space Grotesk, Impact, sans-serif"
                  fontWeight="900"
                  fontSize="120"
                  letterSpacing="2"
                  fill={accentColor}
                  stroke={secondaryColor}
                  strokeWidth="2"
                  textAnchor="middle"
                >
                  {displayNumber}
                </text>
              </g>

              {/* Lower Back: DYPULSE Sublimated Watermark */}
              <g transform="translate(200, 395)">
                <text
                  x="0"
                  y="0"
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight="900"
                  fontSize="10"
                  letterSpacing="3"
                  fill={accentColor}
                  opacity="0.4"
                  textAnchor="middle"
                >
                  DYPULSE VARSITY PERFORMANCE
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Floating Perspective Badge */}
        <div className="absolute bottom-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#2677FF]" />
          <span>Interactive Live 3D Canvas</span>
        </div>
      </div>
    </div>
  );
}
