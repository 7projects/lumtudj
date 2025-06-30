import React from "react";

export const formatTime = (ms) => {
  if (ms === null) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const loadThemeCSS = (themeName) => {
  const id = 'theme-css-link'
  const href = "./themes/" + themeName + ".css";
  let link = document.getElementById(id)

  if (link) {
    link.href = href
  } else {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

export const isMobile = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
