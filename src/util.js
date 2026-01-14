import React from "react";
import 'shepherd.js/dist/css/shepherd.css';
import Shepherd from 'shepherd.js';

export const myShazamTracksPl = {
  id: "MyShazamedTracks",
  count: 0,
  name: "My shazamed tracks",
  total: 0,
  type: "featured",
  tracks: [],
  shuffle: 2
}

export const lastListenedPl = {
  id: "LastListened",
  count: 0,
  name: "Last listened",
  total: 0,
  type: "featured",
  tracks: [],
  shuffle: 2
}

export const getTour = () => {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true
    }
  });

  tour.addStep({
    title: "LIBRARY",
    id: 'example-step',
    text: 'Explore your saved albums and playlists with ease. Start typing in the search bar to instantly see results from your local library.\nLooking for something new on the server? Just hit Enter to expand your search.',
    attachTo: {
      element: '#library',
      on: 'right'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    title: "TRACK PREVIEW PANEL",
    id: 'example-step2',
    text: 'This panel shows all songs from your selected album or playlist. Make changes to the playlist on the spot.Start typing in the search bar to instantly see results from your local library.Press Enter to look for more on the server.',
    attachTo: {
      element: '#panel-main',
      on: 'top'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    title: "QUEUE",
    id: 'example-step3',
    text: 'This panel shows the songs you’ve queued up — they’ll play in order, or shuffled if you choose. You can also create new playlists right here. \nOnce a song starts playing, it’s removed from the queue.',
    attachTo: {
      element: '#playlist',
      on: 'top'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    title: "Hide/Show Library",
    id: 'example-step3',
    text: 'Click this button to toggle the library panel visibility. \nThis allows you to focus on your current playlist or track preview panel.',
    attachTo: {
      element: '#button-library',
      on: 'top'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    title: "Hide/Show Playlist Controller",
    id: 'example-step4',
    text: 'The Playlist Controller provides an overview of all your playlists. When you select a song, any playlist containing that track becomes highlighted, making it easy to see where it belongs. To manage the song, simply click a playlist’s button to add it or remove it instantly.',
    attachTo: {
      element: '#button-plc',
      on: 'top'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    title: "Change Theme",
    id: 'example-step5',
    text: 'Click this button to cycle through different themes for the application. Customize the look and feel to suit your preferences!',
    attachTo: {
      element: '#button-theme',
      on: 'top'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    title: "Toggle Lock Mode",
    id: 'example-step6',
    text: 'Press the lock icon to activate Lock Mode. Playback controls, deletion, and playlist reordering are disabled. \nThe only action allowed is adding new tracks to the queue.\nType your password (dinamo) at any time to unlock.',
    attachTo: {
      element: '#button-lock',
      on: 'top'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Finish',
        action: tour.next
      }
    ]
  });


  return tour;
}

export const isDesktop = () => {
  return !!window.chrome?.webview;
}

export const formatTime = (ms) => {
  if (ms === null) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const loadThemeCSS = (themeName) => {
  localStorage.setItem("theme", themeName);
  return new Promise((resolve, reject) => {
    const id = 'theme-css-link'
    const href = `./themes/${themeName}.css`
    let link = document.getElementById(id)

    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // IMPORTANT: attach handlers BEFORE setting href
    link.onload = () => {
      const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
      sendMsgToDesktop(bodyBgColor);
      resolve();
    }
    link.onerror = () => reject(new Error(`Failed to load theme: ${themeName}`))
    link.href = href
  })
}

export const changeTheme = async () => {
  const currentTheme = localStorage.getItem("theme");

  switch (currentTheme) {
    case "neon":
      localStorage.setItem("theme", "light");
      await loadThemeCSS("light");
      break;

    case "light":
      localStorage.setItem("theme", "spotify");
      await loadThemeCSS("spotify");
      break;

    case "spotify":
      localStorage.setItem("theme", "mono");
      await loadThemeCSS("mono");
      break;

    case "mono":
      localStorage.setItem("theme", "slate");
      await loadThemeCSS("slate");
      break;

    case "slate":
      localStorage.setItem("theme", "blue");
      await loadThemeCSS("blue");
      break;

    case "blue":
      localStorage.setItem("theme", "bluescreen");
      await loadThemeCSS("bluescreen");
      break;

    case "bluescreen":
      localStorage.setItem("theme", "retro");
      await loadThemeCSS("retro");
      break;

    case "retro":
      localStorage.setItem("theme", "newspaper");
      await loadThemeCSS("newspaper");
      break

    case "newspaper":
      localStorage.setItem("theme", "cool");
      await loadThemeCSS("cool");
      break

    case "cool":
      localStorage.setItem("theme", "neon");
      await loadThemeCSS("neon");
      break

    default:
      localStorage.setItem("theme", "spotify");
      await loadThemeCSS("spotify");
      break;
  }
};

export const sendMsgToDesktop = (msg) => {
  window.chrome?.webview?.postMessage(msg);
};

export const isMobile = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}



export function fullscreen() {
  const elem = document.getElementById("html");

  // If no element is in fullscreen
  if (!document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement) {

    // Enter fullscreen

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
      elem.msRequestFullscreen();
    }

    return true;
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE11
      document.msExitFullscreen();
    }

    return false;
  }
}

export const getTotalDurationString = (tracks) => {

  // 1. Sum all duration_ms
  const totalMs = tracks.reduce((sum, t) => sum + t.duration_ms, 0);

  // 2. Convert to mm:ss
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // 3. Format with leading zero
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return formatted;

}

export const startUniverse = () => {

  return; // disabling for now
  const field = document.getElementById("field");
  const f = field.getContext("2d");

  // 🔧 CONFIG
  let starCount = 400;    // number of stars
  let speed = 1.02;       // star acceleration
  let growthRate = 60;    // star size growth
  let meteorChance = 0.002;   // probability per frame for meteor
  let shipChance = 0.0008;    // probability per frame for spaceship

  let stars = {};
  let starIndex = 0;
  let numStars = 0;
  let meteors = [];
  let spaceships = [];

  function Star() {
    this.X = field.width / 2;
    this.Y = field.height / 2;

    this.SX = Math.random() * 6 - 3;
    this.SY = Math.random() * 6 - 3;

    let start = Math.max(field.width, field.height);
    this.X += this.SX * start / 10;
    this.Y += this.SY * start / 10;

    this.W = 1;
    this.H = 1;
    this.age = 0;

    starIndex++;
    stars[starIndex] = this;
    this.ID = starIndex;
    this.C = "#fff";
  }

  Star.prototype.Draw = function () {
    this.X += this.SX;
    this.Y += this.SY;

    this.SX *= speed;
    this.SY *= speed;

    this.age++;
    if (this.age % growthRate === 0 && this.W < 4) {
      this.W++;
      this.H++;
    }

    if (this.X + this.W < 0 || this.X > field.width ||
      this.Y + this.H < 0 || this.Y > field.height) {
      delete stars[this.ID];
      numStars--;
    }

    f.fillStyle = this.C;
    f.fillRect(this.X, this.Y, this.W, this.H);
  }

  // 🌠 Meteor
  function Meteor() {
    this.x = Math.random() * field.width;
    this.y = -20;
    this.length = Math.random() * 80 + 50;
    this.speed = Math.random() * 10 + 15;
    this.angle = Math.PI / 4;
    this.opacity = 1;
  }

  Meteor.prototype.update = function () {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.opacity -= 0.01;
  }

  Meteor.prototype.draw = function () {
    f.beginPath();
    f.moveTo(this.x, this.y);
    f.lineTo(this.x - Math.cos(this.angle) * this.length,
      this.y - Math.sin(this.angle) * this.length);
    f.strokeStyle = `rgba(255,255,255,${this.opacity})`;
    f.lineWidth = 2;
    f.stroke();
  }

  // 🚀 Spaceship (styled)
  function Spaceship() {
    // random side
    const side = Math.floor(Math.random() * 4);
    const speedVal = 4 + Math.random() * 3;

    if (side === 0) { // left → right
      this.x = -50;
      this.y = Math.random() * field.height;
      this.vx = speedVal; this.vy = 0; this.angle = 0;
    } else if (side === 1) { // right → left
      this.x = field.width + 50;
      this.y = Math.random() * field.height;
      this.vx = -speedVal; this.vy = 0; this.angle = Math.PI;
    } else if (side === 2) { // top → bottom
      this.x = Math.random() * field.width;
      this.y = -50;
      this.vx = 0; this.vy = speedVal; this.angle = Math.PI / 2;
    } else { // bottom → top
      this.x = Math.random() * field.width;
      this.y = field.height + 50;
      this.vx = 0; this.vy = -speedVal; this.angle = -Math.PI / 2;
    }

    this.size = 25;
    this.opacity = 1;
  }

  Spaceship.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= 0.0015; // slow fade
  }

  Spaceship.prototype.draw = function () {
    f.save();
    f.translate(this.x, this.y);
    f.rotate(this.angle);
    f.globalAlpha = this.opacity;

    // Body
    f.fillStyle = "silver";
    f.fillRect(-this.size / 4, -this.size / 2, this.size / 2, this.size);

    // Cockpit dome
    f.beginPath();
    f.arc(0, -this.size / 3, this.size / 4, 0, Math.PI * 2);
    f.fillStyle = "cyan";
    f.fill();

    // Wings
    f.fillStyle = "gray";
    f.fillRect(-this.size / 2, -this.size / 3, this.size, this.size / 6);

    // Engine flames
    f.beginPath();
    f.moveTo(-this.size / 6, this.size / 2);
    f.lineTo(this.size / 6, this.size / 2);
    f.lineTo(0, this.size / 2 + Math.random() * 15);
    f.closePath();
    f.fillStyle = "orange";
    f.fill();

    f.restore();
  }

  function resize() {
    field.width = window.innerWidth;
    field.height = window.innerHeight;
  }
  window.onresize = resize;
  resize();

  function draw() {
    f.clearRect(0, 0, field.width, field.height);

    // Stars
    for (let i = numStars; i < starCount; i++) {
      new Star();
      numStars++;
    }
    for (let star in stars) {
      stars[star].Draw();
    }

    // Meteors
    if (Math.random() < meteorChance) {
      meteors.push(new Meteor());
    }
    meteors.forEach((m, i) => {
      m.update();
      m.draw();
      if (m.opacity <= 0) meteors.splice(i, 1);
    });

    // Spaceships
    if (Math.random() < shipChance) {
      spaceships.push(new Spaceship());
    }
    spaceships.forEach((s, i) => {
      s.update();
      s.draw();
      if (s.opacity <= 0) spaceships.splice(i, 1);
    });

    requestAnimationFrame(draw);
  }

  draw();
};

export const isTokenExpired = (expiryTimestampMs) => {
  const now = Date.now(); // current time in ms since epoch
  return now > expiryTimestampMs;
}

export const newGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const flyToPlaylist = (id) => {
  requestAnimationFrame(() => {
    let element = document.getElementById(id);

    // if (!element)
    //   element = document.getElementById("tr" + track.uid);

    // if (!element)
    //   element = document.getElementById(track.uid);

    if (!element) return;

    const clone = element.cloneNode(true);
    const rectStart = element.getBoundingClientRect();
    const player = document.getElementById('playlistButton');
    const rectEnd = player.getBoundingClientRect();

    clone.style.position = 'fixed';
    clone.style.left = rectStart.left + 'px';
    clone.style.top = rectStart.top + 'px';
    clone.style.width = rectStart.width + 'px';
    clone.style.height = rectStart.height + 'px';
    clone.style.zIndex = 9000;
    clone.style.transition = 'all 1s ease-out';

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = rectEnd.left + 'px';
      clone.style.top = rectEnd.top + 'px';
      clone.style.opacity = 0;
      clone.style.transform = 'scale(0.5)';
    });

    clone.addEventListener('transitionend', () => {
      clone.remove();
    });
  });
}

export const flyToPlayer = (id) => {

  let element = document.getElementById(id);
  if (!element)
    return;

  const clone = element.cloneNode(true);
  const rectStart = element.getBoundingClientRect();
  const player = document.querySelector('.player');
  const rectEnd = player.getBoundingClientRect();

  clone.style.position = 'fixed';
  clone.style.left = rectStart.left + 'px';
  clone.style.top = rectStart.top + 'px';
  clone.style.width = rectStart.width + 'px';
  clone.style.height = rectStart.height + 'px';

  clone.style.zIndex = 1000;
  clone.style.transition = 'all 1s ease-out';
  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = rectEnd.left + 'px';
    clone.style.top = rectEnd.top + 'px';
    clone.style.opacity = 0;
    clone.style.transform = 'scale(0.5)';
  });

  clone.addEventListener('transitionend', () => {
    clone.remove();
    // Optional: trigger player update here
  });
}