# Cloudinary Image Upload App

A React + Vite app that uploads images to Cloudinary using an unsigned upload preset and shows them in a session gallery using resized Cloudinary URLs.

## Features
- Form with file input and upload button
- Loading state while uploading, visible error messages on failure
- Latest upload displayed from the URL Cloudinary returns
- Gallery of every image uploaded this session, rendered with `w_400,h_300,c_fill,q_auto,f_auto`
- Home page, upload page and favourites page, switched with the top navbar and the Home / Favourites icons
- Heart button on every uploaded image to add or remove it from favourites
- Responsive gallery: 5 / 3 / 2 columns

## Tech
React, Vite, Tailwind CSS (v4), Cloudinary.

## Prerequisites
Node.js 18+ and a free Cloudinary account.

## Setup
1. `npm install`
2. In Cloudinary: Settings → Upload → Upload presets → Add preset → set **Signing mode: Unsigned** → save. Note the preset name and your **cloud name** (shown on the dashboard).
3. `cp .env.example .env` and fill in the values. Never put your API secret in frontend code.
4. `npm run dev` and open the URL it prints.

## Test an upload
Choose an image, press Upload, and confirm it appears in the gallery. Upload a second image and confirm the first stays. Set a wrong preset name in `.env` to see the error message.

## Build and deploy
`npm run build` creates `dist/`. On Netlify or Vercel: build command `npm run build`, output directory `dist`. Add `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` and `VITE_MAX_FILE_SIZE_MB` in the host's environment settings, then redeploy.

## Notes
Max file size defaults to 10MB (`VITE_MAX_FILE_SIZE_MB`). The gallery is React state, so it resets on refresh.
