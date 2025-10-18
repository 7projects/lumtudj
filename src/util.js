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

  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE11
      document.msExitFullscreen();
    }
  }
}

export const startUniverse = () => {
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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}